import { TokenAccessor } from '../../src/parser/token-accessor'
import { Token, TokenType } from '../../src/tokenizer/token'
import { UnexpectedTokenError } from '../../src/parser/errors'
import { TokenStream } from '../../src/tokenizer/token-stream'

import { expect } from 'chai'

describe('src/parser/token-accessor.ts', function () {
  describe('#hasNext()', function () {
    it('returns false for empty stream', function () {
      const stream = new TokenStream([])
      expect(new TokenAccessor(stream).hasNext()).to.be.false
    })

    it('returns true for non-empty stream', function () {
      const stream = new TokenStream([
        new Token(TokenType.WORD, 0, 'test')
      ])
      expect(new TokenAccessor(stream).hasNext()).to.be.true
    })

    it('returns false for streams containing only skipped tokens', function () {
      const stream = new TokenStream([
        new Token(TokenType.COMMENT, 0, '#test'),
        new Token(TokenType.COMMENT, 7, '#test')
      ])
      expect(new TokenAccessor(stream, [TokenType.COMMENT]).hasNext()).to.be.false
    })

    it('returns true for streams containing non-skipped tokens after skipped tokens', function () {
      const stream = new TokenStream([
        new Token(TokenType.COMMENT, 0, '#test'),
        new Token(TokenType.COMMENT, 7, '#test'),
        new Token(TokenType.WORD, 14, 'foo')
      ])
      expect(new TokenAccessor(stream, [TokenType.COMMENT]).hasNext()).to.be.true
    })
  })

  describe('#peek()', function () {
    it('throws an error if called on empty stream', function () {
      const stream = new TokenStream([])
      expect(() => new TokenAccessor(stream).peek()).to.throw()
    })

    it('throws an error if called on streams containing only skipped tokens', function () {
      const stream = new TokenStream([
        new Token(TokenType.COMMENT, 0, '#test'),
        new Token(TokenType.COMMENT, 7, '#test')
      ])
      expect(() => new TokenAccessor(stream, [TokenType.COMMENT]).peek()).to.throw()
    })

    it('returns first token', function () {
      const tokens = [
        new Token(TokenType.WORD, 0, 'test')
      ]
      const stream = new TokenStream(tokens)
      expect(new TokenAccessor(stream).peek()).to.equal(tokens[0])
    })

    it('returns first token after skipping', function () {
      const tokens = [
        new Token(TokenType.COMMENT, 0, '#test'),
        new Token(TokenType.COMMENT, 7, '#test'),
        new Token(TokenType.WORD, 14, 'test')
      ]
      const stream = new TokenStream(tokens)
      expect(new TokenAccessor(stream, [TokenType.COMMENT]).peek()).to.equal(tokens[2])
    })

    it('does not advance the stream (when not skipping)', function () {
      const tokens = [
        new Token(TokenType.WORD, 0, 'test')
      ]
      const stream = new TokenStream(tokens)
      const obj = new TokenAccessor(stream)
      expect(obj.peek()).to.equal(obj.peek())
      expect(obj.hasNext()).to.be.true
    })
  })

  describe('#popOptional()', function () {
    it('throws an error if called on empty stream', function () {
      const stream = new TokenStream([])
      expect(() => new TokenAccessor(stream).popOptional(TokenType.WORD)).to.throw()
    })

    it('throws an error if called on streams containing only skipped tokens', function () {
      const stream = new TokenStream([
        new Token(TokenType.COMMENT, 0, '#test'),
        new Token(TokenType.COMMENT, 7, '#test')
      ])
      expect(() => new TokenAccessor(stream, [TokenType.COMMENT]).popOptional(TokenType.COMMENT)).to.throw()
    })

    it('returns undefined when requesting a skipped token', function () {
      const stream = new TokenStream([
        new Token(TokenType.COMMENT, 0, '#test'),
        new Token(TokenType.COMMENT, 7, '#test'),
        new Token(TokenType.WORD, 14, 'foo')
      ])
      expect(new TokenAccessor(stream, [TokenType.COMMENT]).popOptional(TokenType.COMMENT)).to.be.undefined
    })

    it('returns token if type matches', function () {
      const tokens = [
        new Token(TokenType.WORD, 0, 'test')
      ]
      const stream = new TokenStream(tokens)
      expect(new TokenAccessor(stream).popOptional(TokenType.WORD)).to.equal(tokens[0])
    })

    it('returns undefined if type does not match', function () {
      const tokens = [
        new Token(TokenType.WORD, 0, 'test')
      ]
      const stream = new TokenStream(tokens)
      expect(new TokenAccessor(stream).popOptional(TokenType.PAREN_LEFT)).to.be.undefined
    })

    it('advances the stream, but only on a match', function () {
      const tokens = [
        new Token(TokenType.WORD, 0, 'test')
      ]
      const stream = new TokenStream(tokens)
      const obj = new TokenAccessor(stream)
      obj.popOptional(TokenType.PAREN_LEFT)
      expect(obj.hasNext()).to.be.true
      obj.popOptional(TokenType.WORD)
      expect(obj.hasNext()).to.be.false
    })

    it('works multiple times in a row', function () {
      const tokens = [
        new Token(TokenType.WORD, 0, 'test'),
        new Token(TokenType.PAREN_LEFT, 5, '('),
        new Token(TokenType.PAREN_RIGHT, 6, '(')
      ]
      const stream = new TokenStream(tokens)
      const obj = new TokenAccessor(stream)
      expect(obj.popOptional(TokenType.EQUALS)).to.be.undefined
      expect(obj.popOptional(TokenType.WORD)).to.equal(tokens[0])
      expect(obj.popOptional(TokenType.EQUALS)).to.be.undefined
      expect(obj.popOptional(TokenType.PAREN_LEFT)).to.equal(tokens[1])
      expect(obj.popOptional(TokenType.EQUALS)).to.be.undefined
      expect(obj.popOptional(TokenType.PAREN_RIGHT)).to.equal(tokens[2])
      expect(obj.hasNext()).to.be.false
    })
  })

  describe('#pop()', function () {
    it('throws an error if called on empty stream', function () {
      const stream = new TokenStream([])
      expect(() => new TokenAccessor(stream).pop(TokenType.WORD)).to.throw()
    })

    it('throws an error if called on streams containing only skipped tokens', function () {
      const stream = new TokenStream([
        new Token(TokenType.COMMENT, 0, '#test'),
        new Token(TokenType.COMMENT, 7, '#test')
      ])
      expect(() => new TokenAccessor(stream, [TokenType.COMMENT]).pop(TokenType.COMMENT)).to.throw()
    })

    it('returns token if type matches', function () {
      const tokens = [
        new Token(TokenType.WORD, 0, 'test')
      ]
      const stream = new TokenStream(tokens)
      expect(new TokenAccessor(stream).pop(TokenType.WORD)).to.equal(tokens[0])
    })

    it('returns token if type and value match', function () {
      const tokens = [
        new Token(TokenType.WORD, 0, 'test')
      ]
      const stream = new TokenStream(tokens)
      expect(new TokenAccessor(stream).pop(TokenType.WORD, 'test')).to.equal(tokens[0])
    })

    it('throws if type does not match', function () {
      const tokens = [
        new Token(TokenType.WORD, 0, 'test')
      ]
      const stream = new TokenStream(tokens)
      expect(() => new TokenAccessor(stream).pop(TokenType.PAREN_LEFT)).to.throw(UnexpectedTokenError)
    })

    it('throws if type matches, but value does not', function () {
      const tokens = [
        new Token(TokenType.WORD, 0, 'test')
      ]
      const stream = new TokenStream(tokens)
      expect(() => new TokenAccessor(stream).pop(TokenType.WORD, 'foo')).to.throw(UnexpectedTokenError)
    })

    it('advances the stream on a match', function () {
      const tokens = [
        new Token(TokenType.WORD, 0, 'test')
      ]
      const stream = new TokenStream(tokens)
      const obj = new TokenAccessor(stream)
      obj.pop(TokenType.WORD)
      expect(obj.hasNext()).to.be.false
    })
  })
})
