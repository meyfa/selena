import { tokenize as tokenizerTokenize } from './src/tokenizer/tokenizer'
import { TokenStream } from './src/tokenizer/token-stream'

export function tokenize (input: string): TokenStream {
  return tokenizerTokenize(input)
}

export function parse (input: string): any {
}
