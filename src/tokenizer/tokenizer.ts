import { Token, TokenType } from './token'
import { TokenStream } from './token-stream'
import { UnterminatedStringError } from './errors'
import { regexpIndexOf } from '../util/regexp-index-of'

/**
 * Match the next token form the input string, starting at the given position.
 *
 * @param {string} str The input.
 * @param {number} start The current position in the input string (start of the token to match).
 * @returns {Token} The matched token.
 * @throws {UnterminatedStringError} If the matched token is a string that is left unterminated.
 */
function matchToken (str: string, start: number): Token {
  const singleCharTokens: Record<string, TokenType> = {
    '=': TokenType.EQUALS,
    '(': TokenType.PAREN_LEFT,
    ')': TokenType.PAREN_RIGHT,
    '{': TokenType.BLOCK_LEFT,
    '}': TokenType.BLOCK_RIGHT,
    ':': TokenType.COLON
  }
  if (singleCharTokens[str[start]] != null) {
    return new Token(singleCharTokens[str[start]], str[start])
  }
  if (str.indexOf('->', start) === start) {
    return new Token(TokenType.ARROW, str.slice(start, start + 2))
  }
  if (str[start] === '"') {
    const closing = str.indexOf('"', start + 1)
    if (closing < 0) {
      throw new UnterminatedStringError()
    }
    return new Token(TokenType.STRING, str.slice(start, closing + 1))
  }
  let end = regexpIndexOf(str, /[\s=(){}:"]|->/, start)
  if (end < 0) {
    end = str.length
  }
  return new Token(TokenType.WORD, str.slice(start, end))
}

/**
 * Convert the given string into a stream of tokens.
 *
 * @param {string} str The input.
 * @returns {TokenStream} The tokenize result.
 * @throws {UnterminatedStringError} If the matched token is a string that is left unterminated.
 */
export function tokenize (str: string): TokenStream {
  const tokens: Token[] = []

  for (let i = 0; i < str.length;) {
    if (/\s/.test(str[i])) {
      ++i
      continue
    }
    const token = matchToken(str, i)
    tokens.push(token)
    i += token.value.length
  }

  return new TokenStream(tokens)
}
