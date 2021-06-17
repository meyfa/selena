import { TokenStream } from '../../src/tokenizer/token-stream'
import { Token, TokenType } from '../../src/tokenizer/token'
import { UnexpectedTokenTypeError, UnexpectedTokenValueError } from '../../src/tokenizer/errors'

import { expect } from 'chai'

describe('src/tokenizer/token-stream.ts', function () {
  describe('#hasNext()', function () {
    it('returns false for empty stream', function () {
      expect(new TokenStream([]).hasNext()).to.be.false
    })

    it('returns true for non-empty stream', function () {
      const tokens = [
        new Token(TokenType.WORD, 'test')
      ]
      expect(new TokenStream(tokens).hasNext()).to.be.true
    })
  })

  describe('#peek()', function () {
    it('throws an error if called on empty stream', function () {
      expect(() => new TokenStream([]).peek()).to.throw()
    })

    it('returns first token', function () {
      const tokens = [
        new Token(TokenType.WORD, 'test')
      ]
      expect(new TokenStream(tokens).peek()).to.equal(tokens[0])
    })

    it('does not advance the stream', function () {
      const tokens = [
        new Token(TokenType.WORD, 'test')
      ]
      const obj = new TokenStream(tokens)
      expect(obj.peek()).to.equal(obj.peek())
      expect(obj.hasNext()).to.be.true
    })
  })

  describe('#popOptional()', function () {
    it('throws an error if called on empty stream', function () {
      expect(() => new TokenStream([]).popOptional(TokenType.WORD)).to.throw()
    })

    it('returns token if type matches', function () {
      const tokens = [
        new Token(TokenType.WORD, 'test')
      ]
      expect(new TokenStream(tokens).popOptional(TokenType.WORD)).to.equal(tokens[0])
    })

    it('returns undefined if type does not match', function () {
      const tokens = [
        new Token(TokenType.WORD, 'test')
      ]
      expect(new TokenStream(tokens).popOptional(TokenType.PAREN_LEFT)).to.be.undefined
    })

    it('advances the stream, but only on a match', function () {
      const tokens = [
        new Token(TokenType.WORD, 'test')
      ]
      const stream = new TokenStream(tokens)
      stream.popOptional(TokenType.PAREN_LEFT)
      expect(stream.hasNext()).to.be.true
      stream.popOptional(TokenType.WORD)
      expect(stream.hasNext()).to.be.false
    })

    it('works multiple times in a row', function () {
      const tokens = [
        new Token(TokenType.WORD, 'test'),
        new Token(TokenType.PAREN_LEFT, '('),
        new Token(TokenType.PAREN_RIGHT, '(')
      ]
      const stream = new TokenStream(tokens)
      expect(stream.popOptional(TokenType.EQUALS)).to.be.undefined
      expect(stream.popOptional(TokenType.WORD)).to.equal(tokens[0])
      expect(stream.popOptional(TokenType.EQUALS)).to.be.undefined
      expect(stream.popOptional(TokenType.PAREN_LEFT)).to.equal(tokens[1])
      expect(stream.popOptional(TokenType.EQUALS)).to.be.undefined
      expect(stream.popOptional(TokenType.PAREN_RIGHT)).to.equal(tokens[2])
      expect(stream.hasNext()).to.be.false
    })
  })

  describe('#pop()', function () {
    it('throws an error if called on empty stream', function () {
      expect(() => new TokenStream([]).pop(TokenType.WORD)).to.throw()
    })

    it('returns token if type matches', function () {
      const tokens = [
        new Token(TokenType.WORD, 'test')
      ]
      expect(new TokenStream(tokens).pop(TokenType.WORD)).to.equal(tokens[0])
    })

    it('returns token if type and value match', function () {
      const tokens = [
        new Token(TokenType.WORD, 'test')
      ]
      expect(new TokenStream(tokens).pop(TokenType.WORD, 'test')).to.equal(tokens[0])
    })

    it('throws if type does not match', function () {
      const tokens = [
        new Token(TokenType.WORD, 'test')
      ]
      expect(() => new TokenStream(tokens).pop(TokenType.PAREN_LEFT)).to.throw(UnexpectedTokenTypeError)
    })

    it('throws if type matches, but value does not', function () {
      const tokens = [
        new Token(TokenType.WORD, 'test')
      ]
      expect(() => new TokenStream(tokens).pop(TokenType.WORD, 'foo')).to.throw(UnexpectedTokenValueError)
    })

    it('advances the stream on a match', function () {
      const tokens = [
        new Token(TokenType.WORD, 'test')
      ]
      const stream = new TokenStream(tokens)
      stream.pop(TokenType.WORD)
      expect(stream.hasNext()).to.be.false
    })
  })
})
