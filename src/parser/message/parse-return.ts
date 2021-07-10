import { Token, TokenType } from '../../tokenizer/token'
import { keywords } from '../strings'
import { unquote } from '../unquote'
import { TokenAccessor } from '../token-accessor'

/**
 * Determine whether the given token marks the beginning of a return statement.
 * This will only produce valid results when inside a message block.
 *
 * @param token The next token in the input stream.
 * @returns Whether the token (and what follows) could be parsed as a return statement.
 */
export function detectReturn (token: Token): boolean {
  return token.type === TokenType.WORD && token.value === keywords.return
}

/**
 * Force-parse a return statement from the given stream.
 *
 * @param tokens The input stream.
 * @returns The return value.
 */
export function parseReturn (tokens: TokenAccessor): string {
  tokens.pop(TokenType.WORD, keywords.return)
  const tValue = tokens.pop(TokenType.STRING)
  return unquote(tValue).trim()
}
