import { Token, TokenType } from '../tokenizer/token'

/**
 * A generic error type for everything related to parsing.
 * This contains a token attribute that stores the token causing the error (or a token roughly in the vicinity).
 */
export class ParserError extends Error {
  readonly token: Token

  constructor (token: Token, message: string) {
    super(message)
    this.token = token
  }
}

/**
 * Thrown when a token of a different type, or with a different value, was requested
 * than the token currently present in the stream.
 */
export class UnexpectedTokenError extends ParserError {
  readonly expectedType: TokenType | undefined

  constructor (actual: Token, expectedType?: TokenType, expectedValue?: string) {
    super(actual, UnexpectedTokenError.formatMessage(actual, expectedType, expectedValue))
    this.expectedType = expectedType
  }

  private static formatMessage (actual: Token, expectedType?: TokenType, expectedValue?: string): string {
    if (expectedValue == null) {
      if (expectedType == null) {
        return `unexpected token <${actual.type}>`
      }
      return `unexpected token <${actual.type}>, expected <${expectedType}>`
    }
    const expType = expectedType == null ? actual.type : expectedType
    return `unexpected token <${actual.type}> '${actual.value}', expected <${expType}> '${expectedValue}'`
  }
}

/**
 * Thrown when an invalid option is encountered.
 */
export class UnsupportedOptionError extends ParserError {
  constructor (token: Token, option: string, supported: string[]) {
    super(token, `unsupported option ${option}, valid options are: ${supported.join(', ')}`)
  }
}

/**
 * Thrown when an option is named twice.
 */
export class DuplicateOptionError extends ParserError {
  constructor (token: Token, option: string) {
    super(token, `duplicate option ${option}`)
  }
}
