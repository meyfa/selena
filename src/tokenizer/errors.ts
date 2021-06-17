import { Token, TokenType } from './token'

/**
 * Thrown when an input is given for which a token type cannot be determined.
 */
export class UnknownTokenTypeError extends Error {
  constructor () {
    super('unable to determine token type')
  }
}

/**
 * Thrown when a string token is detected, but there is no closing quote.
 */
export class UnterminatedStringError extends Error {
  constructor () {
    super('unterminated string')
  }
}

/**
 * Thrown when another token is requested from the stream, but no more tokens exist.
 */
export class EndOfStreamError extends Error {
  constructor () {
    super('end of stream reached')
  }
}

/**
 * Thrown when a token of a different type was requested than is currently present in the stream.
 */
export class UnexpectedTokenTypeError extends Error {
  readonly actual: Token
  readonly expectedType: TokenType

  constructor (actual: Token, expectedType: TokenType) {
    super(`unexpected token <${actual.type}>, expected <${expectedType}>`)
    this.actual = actual
    this.expectedType = expectedType
  }
}

/**
 * Thrown when a token with a different value was requested than is currently present in the stream.
 */
export class UnexpectedTokenValueError extends Error {
  readonly actual: Token
  readonly expectedValue: string

  constructor (actual: Token, expectedValue: string) {
    super(`unexpected token value '${actual.value}', expected '${expectedValue}'`)
    this.actual = actual
    this.expectedValue = expectedValue
  }
}
