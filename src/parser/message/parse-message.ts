import { Entity } from '../../sequence/entity'
import { Activation } from '../../sequence/activation'
import { Token } from '../../tokenizer/token'
import { UnexpectedTokenError } from '../errors'
import { EntityLookup } from '../parser-state'
import { detectMessageDescription, parseMessageDescription } from './parse-message-description'
import { TokenAccessor } from '../token-accessor'
import { matchFoundMessage } from './species/match-found-message'
import { matchLostMessage } from './species/match-lost-message'
import { matchRegularMessage } from './species/match-regular-message'

/**
 * Determine whether the given token marks the beginning of a message.
 * This will only produce valid results when on global level or inside a message block.
 *
 * @param token The next token in the input stream.
 * @returns Whether the token (and what follows) could be parsed as a message.
 */
export function detectMessage (token: Token): boolean {
  return detectMessageDescription(token)
}

/**
 * Force-parse a message including full validity and type checks.
 * This can parse found messages, lost messages, and regular messages (with two participating entities).
 *
 * @param tokens The token stream.
 * @param entities A way of resolving entity ids.
 * @param active The entity that was targeted by the parent message, if any.
 * @returns The parsed message description.
 * @throws If a check fails.
 */
export function parseMessage (tokens: TokenAccessor, entities: EntityLookup, active: Entity | undefined): Activation {
  /*
   * Parsing messages works in multiple layers because a few different syntactical forms are supported.
   * First, every piece of information about the message is gathered as the "message description".
   * This step does not try to make sense of any of it and poses little to no conditions on the input,
   * except for things like "if an entity is named, it must exist".
   * Then in the second step, a sort of pattern-matching is done on that message description to determine which
   * "species" of message it belongs to.
   * If one of the species matches, it will produce an Activation.
   */

  const desc = parseMessageDescription(tokens, entities)

  const activation = matchFoundMessage(desc) ??
    matchLostMessage(desc, active) ??
    matchRegularMessage(desc, active)

  if (activation == null) {
    // no species produced a match, this is most likely due to invalid target
    throw new UnexpectedTokenError(desc.evidence.target)
  }

  return activation
}
