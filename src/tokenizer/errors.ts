/**
 * Base class for errors that occur during tokenization.
 */
export class TokenizerError extends Error {
  readonly position: number

  constructor (position: number, message: string) {
    super(message)
    this.position = position
  }
}

/**
 * Thrown when an input is given for which a token type cannot be determined.
 */
export class UnknownTokenTypeError extends TokenizerError {
  constructor (position: number) {
    super(position, 'unable to determine token type')
  }
}

/**
 * Thrown when a string token is detected, but there is no closing quote.
 */
export class UnterminatedStringError extends TokenizerError {
  constructor (position: number) {
    super(position, 'unterminated string')
  }
}

/**
 * Thrown when another token is requested from the stream, but no more tokens exist.
 */
export class EndOfStreamError extends TokenizerError {
  constructor (position: number) {
    super(position, 'end of stream reached')
  }
}
