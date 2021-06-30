import { Token, TokenType } from './token'
import { TokenStream } from './token-stream'
import { UnknownTokenTypeError, UnterminatedStringError } from './errors'
import { regexpIndexOf } from '../util/regexp-index-of'

/**
 * This record stores the values of each of the fixed token types.
 */
const FIXED_TYPES: Readonly<Record<string, TokenType>> = {
  '=': TokenType.EQUALS,
  '(': TokenType.PAREN_LEFT,
  ')': TokenType.PAREN_RIGHT,
  '{': TokenType.BLOCK_LEFT,
  '}': TokenType.BLOCK_RIGHT,
  ':': TokenType.COLON,
  '->': TokenType.ARROW
}

/**
 * This RegExp matches the start of another token or whitespace.
 * This is useful in determining when a token ends.
 */
const TOKEN_END_REGEXP = /[\s=(){}:"]|->/

/**
 * Try matching the input as a comment.
 * Anything is considered a comment that starts with the hash character ('#').
 *
 * @param {string} str The input.
 * @param {number} start The current position in the input string (start of the token to match).
 * @returns {Token | undefined} The matched token, or undefined if not of the correct format.
 */
function tryMatchComment (str: string, start: number): Token | undefined {
  if (str[start] === '#') {
    const nPos = str.indexOf('\n', start)
    const rPos = str.indexOf('\r', start)
    const end = Math.min(
      str.length,
      nPos >= 0 ? nPos : str.length,
      rPos >= 0 ? rPos : str.length
    )
    return new Token(TokenType.COMMENT, start, str.slice(start, end))
  }
  return undefined
}

/**
 * Try matching the input against the fixed token types.
 * A token type is considered "fixed" if its tokens can only ever have one specific value.
 *
 * @param {string} str The input.
 * @param {number} start The current position in the input string (start of the token to match).
 * @returns {Token | undefined} The matched token, or undefined if not of the correct format.
 */
function tryMatchFixed (str: string, start: number): Token | undefined {
  for (const fixed of Object.keys(FIXED_TYPES)) {
    if (str.indexOf(fixed, start) === start) {
      return new Token(FIXED_TYPES[fixed], start, fixed)
    }
  }
  return undefined
}

/**
 * Try matching the input as a string.
 * Anything is considered a string that starts with a quotation mark ('"').
 *
 * @param {string} str The input.
 * @param {number} start The current position in the input string (start of the token to match).
 * @returns {Token | undefined} The matched token, or undefined if not of the correct format.
 * @throws {UnterminatedStringError} If the matched string is left unterminated.
 */
function tryMatchString (str: string, start: number): Token | undefined {
  if (str[start] === '"') {
    const closing = str.indexOf('"', start + 1)
    if (closing < 0) {
      throw new UnterminatedStringError(start)
    }
    return new Token(TokenType.STRING, start, str.slice(start, closing + 1))
  }
  return undefined
}

/**
 * Try matching the input as a word.
 * A word is any sequence of regular characters up until the next whitespace, string token, or fixed token.
 *
 * @param {string} str The input.
 * @param {number} start The current position in the input string (start of the token to match).
 * @returns {Token | undefined} The matched token, or undefined if not of the correct format.
 */
function tryMatchWord (str: string, start: number): Token | undefined {
  let end = regexpIndexOf(str, TOKEN_END_REGEXP, start)
  if (end < 0) {
    end = str.length
  }
  return new Token(TokenType.WORD, start, str.slice(start, end))
}

/**
 * Match the next token form the input string, starting at the given position.
 *
 * @param {string} str The input.
 * @param {number} start The current position in the input string (start of the token to match).
 * @returns {Token} The matched token.
 * @throws {UnknownTokenTypeError} If the type of token could not be determined.
 * @throws {UnterminatedStringError} If the matched token is a string that is left unterminated.
 */
function matchToken (str: string, start: number): Token {
  const match = tryMatchComment(str, start) ??
    tryMatchFixed(str, start) ??
    tryMatchString(str, start) ??
    tryMatchWord(str, start)

  if (match == null) {
    throw new UnknownTokenTypeError(start)
  }

  return match
}

/**
 * Convert the given string into a stream of tokens.
 *
 * @param {string} str The input.
 * @returns {TokenStream} The tokenize result.
 * @throws {UnknownTokenTypeError} If the string includes a token whose type cannot be determined.
 * @throws {UnterminatedStringError} If the string includes a token that is left unterminated.
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
