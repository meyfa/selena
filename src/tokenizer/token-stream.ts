import { Token } from './token.js'
import { EndOfStreamError } from './errors.js'

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
   * @returns Whether there are any more tokens left.
   */
  hasNext (): boolean {
    return this.nextPointer < this.tokens.length
  }

  /**
   * Retrieve the next token without advancing the stream.
   *
   * @returns The next token in the stream.
   * @throws {EndOfStreamError} If there is no remaining token.
   */
  peek (): Token {
    if (!this.hasNext()) {
      throw new EndOfStreamError(0)
    }
    return this.tokens[this.nextPointer]
  }

  /**
   * Obtain the next token in the stream, consuming it.
   *
   * @returns The next token in the stream.
   * @throws {EndOfStreamError} If there is no remaining token.
   */
  next (): Token {
    const token = this.peek()
    ++this.nextPointer
    return token
  }
}
