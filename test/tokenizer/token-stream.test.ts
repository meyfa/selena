import { expect } from 'chai'
import { TokenStream } from '../../src/tokenizer/token-stream.js'
import { Token, TokenType } from '../../src/tokenizer/token.js'
import { EndOfStreamError } from '../../src/tokenizer/errors.js'

describe('src/tokenizer/token-stream.ts', function () {
  describe('#hasNext()', function () {
    it('returns false for empty stream', function () {
      expect(new TokenStream([]).hasNext()).to.be.false
    })

    it('returns true for non-empty stream', function () {
      const tokens = [
        new Token(TokenType.WORD, 0, 'test')
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
        new Token(TokenType.WORD, 0, 'test')
      ]
      expect(new TokenStream(tokens).peek()).to.equal(tokens[0])
    })

    it('does not advance the stream', function () {
      const tokens = [
        new Token(TokenType.WORD, 0, 'test')
      ]
      const obj = new TokenStream(tokens)
      expect(obj.peek()).to.equal(obj.peek())
      expect(obj.hasNext()).to.be.true
    })
  })

  describe('#next()', function () {
    it('throws an error if called on empty stream', function () {
      expect(() => new TokenStream([]).next()).to.throw()
    })

    it('returns token', function () {
      const tokens = [
        new Token(TokenType.WORD, 0, 'test')
      ]
      expect(new TokenStream(tokens).next()).to.equal(tokens[0])
    })

    it('advances the stream on a match', function () {
      const tokens = [
        new Token(TokenType.WORD, 0, 'test'),
        new Token(TokenType.STRING, 4, '"foo"')
      ]
      const stream = new TokenStream(tokens)
      expect(stream.next()).to.equal(tokens[0])
      expect(stream.next()).to.equal(tokens[1])
      expect(stream.hasNext()).to.be.false
      expect(() => stream.next()).to.throw(EndOfStreamError)
    })
  })
})
