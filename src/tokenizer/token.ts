export enum TokenType {
  WORD = 'word',
  EQUALS = 'equals',
  COLON = 'colon',
  PAREN_LEFT = 'paren_left',
  PAREN_RIGHT = 'paren_right',
  BLOCK_LEFT = 'block_left',
  BLOCK_RIGHT = 'block_right',
  ARROW = 'arrow',
  STRING = 'string'
}

/**
 * A single token, split from an input string.
 */
export class Token {
  readonly type: TokenType
  readonly value: string

  constructor (type: TokenType, value: string) {
    this.type = type
    this.value = value
  }
}
