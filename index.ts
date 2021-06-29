import { Sequence } from './src/sequence/sequence'
import { tokenize } from './src/tokenizer/tokenizer'
import { parse } from './src/parser/parser'

export { tokenize } from './src/tokenizer/tokenizer'
export { parse } from './src/parser/parser'

export function compileToSequence (input: string): Sequence {
  const tokens = tokenize(input)
  return parse(tokens)
}
