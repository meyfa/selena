import { detectReturn, parseReturn } from '../../../src/parser/message/parse-return'
import { Token, TokenType } from '../../../src/tokenizer/token'
import { TokenStream } from '../../../src/tokenizer/token-stream'
import { TokenAccessor } from '../../../src/parser/token-accessor'
import { ParserError } from '../../../src/parser/errors'

import { expect } from 'chai'

describe('src/parser/message/parse-return.ts', function () {
  describe('detectReturn()', function () {
    it('returns true if given keyword "return"', function () {
      const token = new Token(TokenType.WORD, 0, 'return')
      expect(detectReturn(token)).to.be.true
    })

    it('returns false if given a different keyword', function () {
      const token = new Token(TokenType.WORD, 0, 'foo')
      expect(detectReturn(token)).to.be.false
    })

    it('returns false if given a different token type', function () {
      const token = new Token(TokenType.STRING, 0, '"return"')
      expect(detectReturn(token)).to.be.false
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
