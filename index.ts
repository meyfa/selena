import { Sequence } from './src/sequence/sequence'
import { tokenize } from './src/tokenizer/tokenizer'
import { parse } from './src/parser/parser'

export { tokenize } from './src/tokenizer/tokenizer'
export { parse } from './src/parser/parser'

/**
 * Given an input string containing the sequence specification, perform a full tokenize and parse
 * to obtain the resulting sequence.
 *
 * @param input The input code.
 * @returns The parsed sequence.
 */
export function compileToSequence (input: string): Sequence {
  const tokens = tokenize(input)
  return parse(tokens)
}
