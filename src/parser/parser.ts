import { TokenStream } from '../tokenizer/token-stream.js'
import { Sequence } from '../sequence/sequence.js'
import { ParserState } from './parser-state.js'
import { detectEntity, parseEntity } from './entity/parse-entity.js'
import { UnexpectedTokenError } from './errors.js'
import { TokenAccessor } from './token-accessor.js'
import { TokenType } from '../tokenizer/token.js'
import { detectMessage, parseMessage } from './message/parse-message.js'

/**
 * Parse the given stream of tokens into a sequence.
 * This expects the stream to contain a completely valid document, otherwise an error will be thrown when there
 * is a token mismatch.
 *
 * @param tokens The input token stream as produced by the tokenizer.
 * @returns The parsed sequence.
 * @throws If an error occurs during parsing.
 */
export function parse (tokens: TokenStream): Sequence {
  const state = new ParserState()

  const accessor = new TokenAccessor(tokens, [TokenType.COMMENT])

  // On global level, the script can contain either entity definitions or messages.

  while (accessor.hasNext()) {
    const token = tokens.peek()
    if (detectEntity(token)) {
      state.insertEntity(parseEntity(accessor))
      continue
    }
    if (detectMessage(token)) {
      state.insertActivation(parseMessage(accessor, state, undefined))
      continue
    }
    throw new UnexpectedTokenError(token)
  }

  return new Sequence(state.getEntities(), state.getRootActivations())
}
