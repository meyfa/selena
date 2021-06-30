import { Token, TokenType } from '../tokenizer/token'
import { TokenStream } from '../tokenizer/token-stream'
import { UnexpectedTokenError } from './errors'

/**
 * This class operates on a TokenStream.
 *
 * It extends the basic functionality of such a stream by enabling typesafe removal of tokens,
 * i.e. a token type can be asserted when obtaining it.
 *
 * Moreover, a set of skipped token types can be configured.
 * These tokens will be ignored completely (it will be as if they did not occur at all in the input stream).
 * This is useful for stripping out comments.
 */
export class TokenAccessor {
  private readonly stream: TokenStream
  private readonly skip: ReadonlySet<TokenType>

  constructor (stream: TokenStream, skip?: TokenType[]) {
    this.stream = stream
    this.skip = new Set(skip)
  }

  private advanceSkippedTokens (): void {
    while (this.stream.hasNext() && this.skip.has(this.stream.peek().type)) {
      this.stream.next()
    }
  }

  /**
   * Check stream state.
   *
   * @returns {boolean} Whether there are any more tokens left.
   */
  hasNext (): boolean {
    this.advanceSkippedTokens()
    return this.stream.hasNext()
  }

  /**
   * Retrieve the next token without advancing the stream.
   *
   * @returns {Token} The next token in the stream.
   * @throws {EndOfStreamError} If there is no remaining token.
   */
  peek (): Token {
    this.advanceSkippedTokens()
    return this.stream.peek()
  }

  /**
   * Obtain the next token and advance the stream, but only if the token matches the given type.
   * If the type does not match, this returns undefined and the stream does not change state.
   * Optionally, the token value can be checked in the same manner.
   *
   * If no token remains (empty stream), this will return undefined.
   *
   * @param {TokenType} type The type of token to pop off.
   * @param {?string} value The value the token is expected to have.
   * @returns {Token | undefined} The next token in the stream, or undefined.
   */
  popOptional (type: TokenType, value?: string): Token | undefined {
    if (!this.hasNext()) {
      return undefined
    }
    const token = this.peek()
    if (token.type !== type || (value != null && token.value !== value)) {
      return undefined
    }
    return this.stream.next()
  }

  /**
   * Obtain the next token and advance the stream. The token must be of the given type,
   * otherwise an error will be thrown. Optionally, the token value can be asserted in the same manner.
   *
   * @param {TokenType} type The type of token to pop off.
   * @param {?string} value The value the token is expected to have.
   * @returns {Token} The next token.
   * @throws {EndOfStreamError} If there is no remaining token.
   * @throws {UnexpectedTokenError} If the token type mismatches, or a value was specified and it mismatches.
   */
  pop (type: TokenType, value?: string): Token {
    const optToken = this.popOptional(type, value)
    if (optToken == null) {
      throw new UnexpectedTokenError(this.peek(), type, value)
    }
    return optToken
  }
}
