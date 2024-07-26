import { Token, TokenType } from '../tokenizer/token.js'

/**
 * A generic error type for everything related to parsing.
 * This contains a token attribute that stores the token causing the error (or a token roughly in the vicinity).
 */
export class ParserError extends Error {
  readonly token: Token

  constructor (token: Token, message: string) {
    super(message)
    this.name = 'ParserError'
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
    this.name = 'UnexpectedTokenError'
    this.expectedType = expectedType
  }

  private static formatMessage (actual: Token, expectedType?: TokenType, expectedValue?: string): string {
    if (expectedValue == null) {
      if (expectedType == null) {
        return `unexpected token <${actual.type}>`
      }
      return `unexpected token <${actual.type}>, expected <${expectedType}>`
    }
    const expType = expectedType ?? actual.type
    return `unexpected token <${actual.type}> '${actual.value}', expected <${expType}> '${expectedValue}'`
  }
}

/**
 * Thrown when an invalid option is encountered.
 */
export class UnsupportedOptionError extends ParserError {
  constructor (token: Token, option: string, supported: string[]) {
    super(token, `unsupported option ${option}, valid options are: ${supported.join(', ')}`)
    this.name = 'UnsupportedOptionError'
  }
}

/**
 * Thrown when an option is named twice.
 */
export class DuplicateOptionError extends ParserError {
  constructor (token: Token, option: string) {
    super(token, `duplicate option ${option}`)
    this.name = 'DuplicateOptionError'
  }
}

/**
 * Thrown when a message block is specified for a message that cannot have one.
 */
export class UnexpectedMessageBlockError extends ParserError {
  constructor (token: Token) {
    super(token, 'this message type cannot have a message block')
    this.name = 'UnexpectedMessageBlockError'
  }
}

/**
 * Thrown when a message requires a target entity to be specified but none was given.
 */
export class MissingTargetError extends ParserError {
  constructor (token: Token) {
    super(token, 'expected object target for this message')
    this.name = 'MissingTargetError'
  }
}

/**
 * Thrown when an entity is referenced that was not defined.
 */
export class UnknownObjectError extends ParserError {
  constructor (token: Token, objectId: string) {
    super(token, `object "${objectId}" not defined`)
    this.name = 'UnknownObjectError'
  }
}

/**
 * Thrown when a message block was already returned from, yet there is more code in it.
 */
export class AlreadyReturnedError extends ParserError {
  constructor (token: Token) {
    super(token, 'there cannot be any code after a return statement')
    this.name = 'AlreadyReturnedError'
  }
}

/**
 * Thrown when a return value is specified on a message that cannot have one.
 */
export class UnsupportedReturnError extends ParserError {
  constructor (token: Token) {
    super(token, 'return is not supported on this message')
    this.name = 'UnsupportedReturnError'
  }
}
