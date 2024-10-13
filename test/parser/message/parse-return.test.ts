import { expect } from 'chai'
import { detectReturn, parseReturn } from '../../../src/parser/message/parse-return.js'
import { Token, TokenType } from '../../../src/tokenizer/token.js'
import { TokenStream } from '../../../src/tokenizer/token-stream.js'
import { TokenAccessor } from '../../../src/parser/token-accessor.js'
import { ParserError } from '../../../src/parser/errors.js'

describe('src/parser/message/parse-return.ts', function () {
  describe('detectReturn()', function () {
    it('returns true if given keyword "return"', function () {
      const token = new Token(TokenType.WORD, 0, 'return')
      expect(detectReturn(token)).to.equal(true)
    })

    it('returns false if given a different keyword', function () {
      const token = new Token(TokenType.WORD, 0, 'foo')
      expect(detectReturn(token)).to.equal(false)
    })

    it('returns false if given a different token type', function () {
      const token = new Token(TokenType.STRING, 0, '"return"')
      expect(detectReturn(token)).to.equal(false)
    })
  })

  describe('parseReturn()', function () {
    it('parses as a string', function () {
      const tokens = new TokenAccessor(new TokenStream([
        new Token(TokenType.WORD, 0, 'return'),
        new Token(TokenType.STRING, 7, '"return value"')
      ]))
      const parsed = parseReturn(tokens)
      expect(parsed).to.equal('return value')
    })

    it('throws if missing string token', function () {
      const tokens = new TokenAccessor(new TokenStream([
        new Token(TokenType.WORD, 0, 'return'),
        new Token(TokenType.WORD, 7, 'foo')
      ]))
      expect(() => parseReturn(tokens)).to.throw(ParserError)
    })
  })
})
