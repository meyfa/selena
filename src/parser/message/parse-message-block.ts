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
 * This class helps construct a MessageBlock from activations and a return value.
 * Note that invocation order is important; there cannot be any further activations added after a return value was set.
 */
class MessageBlockBuilder {
  private readonly activations: Activation[] = []
  private returnValue: string | undefined
  private returnEvidence: Token | undefined

  private ensureNotReturned (evidence: Token): void {
    if (this.returnValue != null) {
      throw new AlreadyReturnedError(evidence)
    }
  }

  applyReturn (value: string, evidence: Token): void {
    this.ensureNotReturned(evidence)
    this.returnValue = value
    this.returnEvidence = evidence
  }

  addActivation (activation: Activation, evidence: Token): void {
    this.ensureNotReturned(evidence)
    this.activations.push(activation)
  }

  build (blockClose: Token): MessageBlock {
    return {
      activations: this.activations,
      returnValue: this.returnValue,
      evidence: {
        returnValue: this.returnEvidence ?? blockClose
      }
    }
  }
}

/**
 * Determine whether the given token marks the beginning of a message block.
 * This will only produce valid results when right at the end of a message description.
 *
 * @param token The next token in the input stream.
 * @returns Whether the token (and what follows) could be parsed as a message block.
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
 * @param tokens The token stream.
 * @param entities A way of resolving entity ids.
 * @param active The entity that was targeted by the message to which this block belongs.
 * @returns The parsed message description.
 * @throws If a check fails.
 */
export function parseMessageBlock (tokens: TokenAccessor, entities: EntityLookup, active: Entity): MessageBlock {
  tokens.pop(TokenType.BLOCK_LEFT)

  const builder = new MessageBlockBuilder()

  let tBlockRight
  while ((tBlockRight = tokens.popOptional(TokenType.BLOCK_RIGHT)) == null) {
    const token = tokens.peek()
    if (detectMessage(token)) {
      builder.addActivation(parseMessage(tokens, entities, active), token)
    } else if (detectReturn(token)) {
      builder.applyReturn(parseReturn(tokens), token)
    } else {
      throw new UnexpectedTokenError(token)
    }
  }

  return builder.build(tBlockRight)
}
