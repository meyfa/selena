import { Token } from '../tokenizer/token'

export class UnexpectedTokenError extends Error {
  constructor (token: Token) {
    super(`unexpected token <${token.type}> '${token.value}'`)
  }
}

export class UnsupportedOptionError extends Error {
  constructor (option: string, supported: string[]) {
    super(`unsupported option ${option}, valid options are: ${supported.join(', ')}`)
  }
}

export class DuplicateOptionError extends Error {
  constructor (option: string) {
    super(`duplicate option ${option}`)
  }
}
