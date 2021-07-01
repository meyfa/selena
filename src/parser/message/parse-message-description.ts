import { Token, TokenType } from '../../tokenizer/token'
import { MissingTargetError, UnexpectedMessageBlockError, UnknownObjectError, UnsupportedOptionError } from '../errors'
import { EntityLookup } from '../parser-state'
import { unquote } from '../unquote'
import { detectMessageBlock, parseMessageBlock } from './parse-message-block'
import { MessageBlock, MessageDescription, MessageType } from './message-description'
import { TokenAccessor } from '../token-accessor'
import { keywords, messageOptions } from '../strings'
import { Entity } from '../../sequence/entity'

// I wish Object.values was supported in this ES version
const AVAILABLE_TYPE_KEYWORDS = Object.keys(messageOptions).map(key => (messageOptions as Record<string, string>)[key])

const TYPE_OPTIONS: ReadonlyMap<string, MessageType> = new Map([
  [messageOptions.sync, MessageType.SYNC],
  [messageOptions.async, MessageType.ASYNC],
  [messageOptions.create, MessageType.CREATE],
  [messageOptions.destroy, MessageType.DESTROY]
])

interface OptionalValueWithEvidence<T> {
  value: T | undefined
  evidence: Token | undefined
}

/**
 * Determine whether the message begins with '*'. If yes, value will be true, and false otherwise.
 *
 * @param {TokenAccessor} tokens The token stream.
 * @returns {object} The Boolean value and evidence for it if possible.
 */
function determineFromOutside (tokens: TokenAccessor): OptionalValueWithEvidence<boolean> {
  const evidence = tokens.popOptional(TokenType.WORD, keywords.outside)
  return { value: evidence != null, evidence }
}

/**
 * Determine the type of message (sync, async, ...) specified in parentheses.
 * If no type was specified, value will be undefined.
 *
 * @param {TokenAccessor} tokens The token stream.
 * @returns {object} The message type and evidence for it if possible.
 */
function determineType (tokens: TokenAccessor): OptionalValueWithEvidence<MessageType> {
  if (tokens.popOptional(TokenType.PAREN_LEFT) != null) {
    const evidence = tokens.pop(TokenType.WORD)
    const type = TYPE_OPTIONS.get(evidence.value)
    if (type == null) {
      throw new UnsupportedOptionError(evidence, evidence.value, AVAILABLE_TYPE_KEYWORDS)
    }
    tokens.pop(TokenType.PAREN_RIGHT)
    return { value: type, evidence }
  }
  return { value: undefined, evidence: undefined }
}

/**
 * Determine the message target. This will be an entity if one was specified, and undefined if '*' was given.
 *
 * @param {TokenAccessor} tokens The token stream.
 * @param {EntityLookup} entities A way of resolving entity ids.
 * @returns {object} The target and evidence for it if possible.
 */
function determineTarget (tokens: TokenAccessor, entities: EntityLookup): OptionalValueWithEvidence<Entity> {
  const evidence = tokens.pop(TokenType.WORD)
  if (evidence.value === keywords.outside) {
    return { value: undefined, evidence }
  }
  const entity = entities.lookupEntity(evidence.value)
  if (entity == null) {
    throw new UnknownObjectError(evidence, evidence.value)
  }
  return { value: entity, evidence }
}

/**
 * Determine the message label. If no label was specified, the value will be undefined.
 *
 * @param {TokenAccessor} tokens The token stream.
 * @returns {object} The message label and evidence for it if possible.
 */
function determineLabel (tokens: TokenAccessor): OptionalValueWithEvidence<string> {
  const evidence = tokens.popOptional(TokenType.STRING)
  if (evidence == null) {
    return { value: undefined, evidence }
  }
  return { value: unquote(evidence).trim(), evidence }
}

/**
 * Determine the message block (nested messages). If no block exists, the value will be undefined.
 * If a block exists but the target is null, this will throw an error.
 *
 * @param {TokenAccessor} tokens The token stream.
 * @param {EntityLookup} entities A way of resolving entity ids.
 * @param {Entity | undefined} target The already-resolved message target.
 * @returns {object} The message label and evidence for it if possible.
 */
function determineBlock (tokens: TokenAccessor, entities: EntityLookup, target: Entity | undefined): OptionalValueWithEvidence<MessageBlock> {
  const evidence = tokens.hasNext() ? tokens.peek() : undefined
  if (evidence == null || !detectMessageBlock(evidence)) {
    return { value: undefined, evidence }
  }
  if (target == null) {
    throw new UnexpectedMessageBlockError(tokens.peek())
  }
  return { value: parseMessageBlock(tokens, entities, target), evidence }
}

/**
 * Determine whether the given token marks the beginning of a message description.
 * This will only produce valid results when on global level or inside a message block.
 *
 * @param {Token} token The next token in the input stream.
 * @returns {boolean} Whether the token (and what follows) could be parsed as a message description.
 */
export function detectMessageDescription (token: Token): boolean {
  return token.type === TokenType.ARROW || (token.type === TokenType.WORD && token.value === keywords.outside)
}

/**
 * Parse a message description (complete representation of a message), including basic checks but not much more.
 * The checks that are done include: entities must exist if named, message type must be valid if specified,
 * a message block requires the message to have a target entity, etc.
 * No checks are done regarding semantic correctness (can that type of message exist at this point in the script?).
 *
 * For each value in the description (whether it exists or not) a piece of "evidence" will be returned as well.
 * This is the token that caused that value to be detected (or not to be detected) and allows for meaningful error
 * messages to be created later.
 *
 * @param {TokenAccessor} tokens The token stream.
 * @param {EntityLookup} entities A way of resolving entity ids.
 * @returns {object} The parsed message description.
 * @throws {ParserError} If a check fails.
 */
export function parseMessageDescription (tokens: TokenAccessor, entities: EntityLookup): MessageDescription {
  // parse the following format, where [...] indicates optionality and target is an entity or '*':
  // [*] -> [( [type] )] target ["label"] [{ block }]

  const { value: fromOutside, evidence: fromOutsideEvidence } = determineFromOutside(tokens)

  const tArrow = tokens.pop(TokenType.ARROW)

  const { value: type, evidence: typeEvidence } = determineType(tokens)
  const { value: target, evidence: targetEvidence } = determineTarget(tokens, entities)

  // Catch messages of the form '*->*'.
  // If this check was not done here, the problem _would_ be detected, but only much later and potentially with
  // a more cryptic error message.
  // In particular, due to how determineBlock() works, '*->* {}' would lead to an error because a block cannot exist
  // when there is no target -- but in reality the problem _really_ comes from a missing target!
  if (fromOutside === true && target == null) {
    throw new MissingTargetError(targetEvidence ?? tArrow)
  }

  const { value: label, evidence: labelEvidence } = determineLabel(tokens)
  const { value: block, evidence: blockEvidence } = determineBlock(tokens, entities, target)

  return {
    type: type ?? MessageType.SYNC,
    fromOutside: fromOutside ?? false,
    target,
    label: label ?? '',
    block,
    evidence: {
      type: typeEvidence ?? tArrow,
      fromOutside: fromOutsideEvidence ?? tArrow,
      target: targetEvidence ?? tArrow,
      label: labelEvidence ?? tArrow,
      block: blockEvidence ?? tArrow
    }
  }
}
