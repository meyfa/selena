import { TokenStream } from '../tokenizer/token-stream'
import { Sequence } from '../sequence/sequence'
import { ParserState } from './parser-state'
import { UnexpectedTokenError } from './errors'
import { detectEntity, parseEntity } from './entity/parse-entity'

/**
 * Parse the given stream of tokens into a sequence.
 * This expects the stream to contain a completely valid document, otherwise an error will be thrown when there
 * is a token mismatch.
 *
 * @param {TokenStream} tokens The input token stream as produced by the tokenizer.
 * @returns {Sequence} The parsed sequence.
 */
export function parse (tokens: TokenStream): Sequence {
  const state = new ParserState()

  while (tokens.hasNext()) {
    const token = tokens.peek()
    if (detectEntity(token)) {
      state.insertEntity(parseEntity(tokens))
      continue
    }
    throw new UnexpectedTokenError(token)
  }

  return new Sequence(state.getEntities(), state.getRootActivations())
}
