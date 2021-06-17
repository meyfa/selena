import { Token, TokenType } from './token'
import { EndOfStreamError, UnexpectedTokenTypeError, UnexpectedTokenValueError } from './errors'

/**
 * A stream of tokens that allows for sequential processing.
 * This keeps an internal pointer that is advanced to the next token every time a token is popped off.
 * It also supports peeking at the next token without popping it off.
 */
export class TokenStream {
  private readonly tokens: Token[]
  private nextPointer: number = 0

  constructor (tokens: Token[]) {
    this.tokens = tokens
  }

  /**
   * Check stream state.
   *
   * @returns {boolean} Whether there are any more tokens left.
   */
  hasNext (): boolean {
    return this.nextPointer < this.tokens.length
  }

  /**
   * Obtain the next token without advancing the stream.
   *
   * @returns {Token} The next token in the stream.
   * @throws {EndOfStreamError} If there is no remaining token.
   */
  peek (): Token {
    if (!this.hasNext()) {
      throw new EndOfStreamError()
    }
    return this.tokens[this.nextPointer]
  }

  /**
   * Obtain the next token and advance the stream, but only if the token matches the given type.
   * If the type does not match, this returns undefined and the stream does not change state.
   *
   * @param {TokenType} type The type of token to pop off.
   * @returns {Token | undefined} The next token in the stream, or undefined.
   * @throws {EndOfStreamError} If there is no remaining token.
   */
  popOptional (type: TokenType): Token | undefined {
    const token = this.peek()
    if (token.type !== type) {
      return undefined
    }
    ++this.nextPointer
    return token
  }

  /**
   * Obtain the next token and advance the stream. The token must be of the given type,
   * otherwise an error will be thrown. Optionally, the token value can be asserted in the same manner.
   *
   * @param {TokenType} type The type of token to pop off.
   * @param {?string} value The value the token is expected to have.
   * @returns {Token} The next token in the stream.
   * @throws {EndOfStreamError} If there is no remaining token.
   * @throws {UnexpectedTokenTypeError} If the token type mismatches.
   * @throws {UnexpectedTokenValueError} If a token value was specified, and it mismatches.
   */
  pop (type: TokenType, value?: string): Token {
    const optToken = this.popOptional(type)
    if (optToken == null) {
      throw new UnexpectedTokenTypeError(this.peek(), type)
    }
    if (value != null && optToken.value !== value) {
      throw new UnexpectedTokenValueError(optToken, value)
    }
    return optToken
  }
}
