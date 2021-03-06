import { Token, TokenType } from '../tokenizer/token.js'

/**
 * Unquote the given string token, returning its true value.
 *
 * @param stringToken The token, which must have type STRING.
 * @returns The unquoted value.
 */
export function unquote (stringToken: Token): string {
  if (stringToken.type !== TokenType.STRING) {
    throw new Error('expected string')
  }
  return stringToken.value.slice(1, stringToken.value.length - 1)
}
