import { expect } from 'chai'
import { detectEntityOptions, parseEntityOptions } from '../../../src/parser/entity/parse-entity-options.js'
import { Token, TokenType } from '../../../src/tokenizer/token.js'
import { TokenStream } from '../../../src/tokenizer/token-stream.js'
import { TokenAccessor } from '../../../src/parser/token-accessor.js'

describe('src/parser/entity/parse-entity-options.ts', function () {
  describe('detectEntityOptions()', function () {
    it('returns true if given left paren', function () {
      const token = new Token(TokenType.PAREN_LEFT, 0, '(')
      expect(detectEntityOptions(token)).to.be.true
    })

    it('returns false if given a different token type', function () {
      const token = new Token(TokenType.WORD, 0, 'foo')
      expect(detectEntityOptions(token)).to.be.false
    })
  })

  describe('parseEntityOptions()', function () {
    it('returns defaults for empty options', function () {
      const tokens = new TokenAccessor(new TokenStream([
        new Token(TokenType.PAREN_LEFT, 0, '('),
        new Token(TokenType.PAREN_RIGHT, 1, ')')
      ]))
      const parsed = parseEntityOptions(tokens)
      expect(parsed.isActor).to.be.false
    })

    it('parses actor option', function () {
      const tokens = new TokenAccessor(new TokenStream([
        new Token(TokenType.PAREN_LEFT, 0, '('),
        new Token(TokenType.WORD, 1, 'actor'),
        new Token(TokenType.PAREN_RIGHT, 6, ')')
      ]))
      const parsed = parseEntityOptions(tokens)
      expect(parsed.isActor).to.be.true
    })

    it('throws for invalid option', function () {
      const tokens = new TokenAccessor(new TokenStream([
        new Token(TokenType.PAREN_LEFT, 0, '('),
        new Token(TokenType.WORD, 1, 'foo'),
        new Token(TokenType.PAREN_RIGHT, 4, ')')
      ]))
      expect(() => parseEntityOptions(tokens)).to.throw()
    })
  })
})
