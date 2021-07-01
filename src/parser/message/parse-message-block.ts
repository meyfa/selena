import { Entity } from '../../sequence/entity'
import { Token, TokenType } from '../../tokenizer/token'
import { Activation } from '../../sequence/activation'
import { AlreadyReturnedError, UnexpectedTokenError } from '../errors'
import { detectMessage, parseMessage } from './parse-message'
import { detectReturn, parseReturn } from './parse-return'
import { EntityLookup } from '../parser-state'
import { TokenAccessor } from '../token-accessor'
import { MessageBlock } from './message-description'

/**
 * Determine whether the given token marks the beginning of a message block.
 * This will only produce valid results when right at the end of a message description.
 *
 * @param {Token} token The next token in the input stream.
 * @returns {boolean} Whether the token (and what follows) could be parsed as a message block.
 */
export function detectMessageBlock (token: Token): boolean {
  return token.type === TokenType.BLOCK_LEFT
}

/**
 * Force-parse a message block.
 * This requires the message to have a target entity.
 *
 * Message blocks can include return statements. This function does not care whether return statements are allowed
 * for the specific message type. It does, however, include "evidence" (a token) for the return value if one exists so
 * meaningful error messages can be created later.
 *
 * @param {TokenAccessor} tokens The token stream.
 * @param {EntityLookup} entities A way of resolving entity ids.
 * @param {Entity} active The entity that was targeted by the message to which this block belongs.
 * @returns {object} The parsed message description.
 * @throws {ParserError} If a check fails.
 */
export function parseMessageBlock (tokens: TokenAccessor, entities: EntityLookup, active: Entity): MessageBlock {
  tokens.pop(TokenType.BLOCK_LEFT)

  const activations: Activation[] = []

  let returnValue: string | undefined
  let tReturn: Token | undefined

  let tBlockRight
  while ((tBlockRight = tokens.popOptional(TokenType.BLOCK_RIGHT)) == null) {
    const token = tokens.peek()
    if (returnValue != null) {
      throw new AlreadyReturnedError(token)
    }
    if (detectMessage(token)) {
      activations.push(parseMessage(tokens, entities, active))
      continue
    }
    if (detectReturn(token)) {
      returnValue = parseReturn(tokens)
      tReturn = token
      continue
    }
    throw new UnexpectedTokenError(token)
  }

  return {
    activations,
    returnValue,
    evidence: {
      returnValue: tReturn ?? tBlockRight
    }
  }
}
