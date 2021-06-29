import { detectEntityOptions, parseEntityOptions } from '../../../src/parser/entity/parse-entity-options'
import { Token, TokenType } from '../../../src/tokenizer/token'
import { TokenStream } from '../../../src/tokenizer/token-stream'

import { expect } from 'chai'

describe('src/parser/entity/parse-entity-options.ts', function () {
  describe('detectEntityOptions()', function () {
    it('returns true if given left paren', function () {
      const token = new Token(TokenType.PAREN_LEFT, '(')
      expect(detectEntityOptions(token)).to.be.true
    })

    it('returns false if given a different token type', function () {
      const token = new Token(TokenType.WORD, 'foo')
      expect(detectEntityOptions(token)).to.be.false
    })
  })

  describe('parseEntityOptions()', function () {
    it('returns defaults for empty options', function () {
      const tokens = new TokenStream([
        new Token(TokenType.PAREN_LEFT, '('),
        new Token(TokenType.PAREN_RIGHT, ')')
      ])
      const parsed = parseEntityOptions(tokens)
      expect(parsed.isActor).to.be.false
    })

    it('parses actor option', function () {
      const tokens = new TokenStream([
        new Token(TokenType.PAREN_LEFT, '('),
        new Token(TokenType.WORD, 'actor'),
        new Token(TokenType.PAREN_RIGHT, ')')
      ])
      const parsed = parseEntityOptions(tokens)
      expect(parsed.isActor).to.be.true
    })

    it('throws for invalid option', function () {
      const tokens = new TokenStream([
        new Token(TokenType.PAREN_LEFT, '('),
        new Token(TokenType.WORD, 'foo'),
        new Token(TokenType.PAREN_RIGHT, ')')
      ])
      expect(() => parseEntityOptions(tokens)).to.throw()
    })
  })
})
