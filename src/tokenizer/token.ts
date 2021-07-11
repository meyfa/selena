/**
 * Specifies the different kinds of tokens that can be lexed.
 */
export enum TokenType {
  COMMENT = 'comment',
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
  readonly position: number
  readonly value: string

  constructor (type: TokenType, position: number, value: string) {
    this.type = type
    this.position = position
    this.value = value
  }
}
