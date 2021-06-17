import { tokenize } from '../../src/tokenizer/tokenizer'
import { TokenStream } from '../../src/tokenizer/token-stream'
import { TokenType } from '../../src/tokenizer/token'
import { UnterminatedStringError } from '../../src/tokenizer/errors'

import { expect } from 'chai'

describe('src/tokenizer/tokenizer.ts', function () {
  describe('tokenize()', function () {
    it('returns empty stream for empty input', function () {
      const result = tokenize('')
      expect(result).to.be.an.instanceOf(TokenStream)
      expect(result.hasNext()).to.be.false
    })

    it('returns empty stream for whitespace', function () {
      const result = tokenize('   \n   ')
      expect(result).to.be.an.instanceOf(TokenStream)
      expect(result.hasNext()).to.be.false
    })

    it('detects all token types correctly if placed in sequence', function () {
      const result = tokenize('= ( ) { } : foo "bar baz" word$with.special*chars')
      expect(result).to.be.an.instanceOf(TokenStream)
      expect(result.pop(TokenType.EQUALS).value).to.equal('=')
      expect(result.pop(TokenType.PAREN_LEFT).value).to.equal('(')
      expect(result.pop(TokenType.PAREN_RIGHT).value).to.equal(')')
      expect(result.pop(TokenType.BLOCK_LEFT).value).to.equal('{')
      expect(result.pop(TokenType.BLOCK_RIGHT).value).to.equal('}')
      expect(result.pop(TokenType.COLON).value).to.equal(':')
      expect(result.pop(TokenType.WORD).value).to.equal('foo')
      expect(result.pop(TokenType.STRING).value).to.equal('"bar baz"')
      expect(result.pop(TokenType.WORD).value).to.equal('word$with.special*chars')
    })

    it('detects strings', function () {
      const result = tokenize('"foo bar" "baz" "key:value" "call()"')
      expect(result).to.be.an.instanceOf(TokenStream)
      expect(result.pop(TokenType.STRING).value).to.equal('"foo bar"')
      expect(result.pop(TokenType.STRING).value).to.equal('"baz"')
      expect(result.pop(TokenType.STRING).value).to.equal('"key:value"')
      expect(result.pop(TokenType.STRING).value).to.equal('"call()"')
    })

    it('detects words', function () {
      const result = tokenize('foo foo_bar b*z')
      expect(result).to.be.an.instanceOf(TokenStream)
      expect(result.pop(TokenType.WORD).value).to.equal('foo')
      expect(result.pop(TokenType.WORD).value).to.equal('foo_bar')
      expect(result.pop(TokenType.WORD).value).to.equal('b*z')
    })

    it('detects strings directly following other tokens', function () {
      const result = tokenize('("bar1" foo"bar2" "foo""bar3"')
      expect(result).to.be.an.instanceOf(TokenStream)
      result.pop(TokenType.PAREN_LEFT)
      expect(result.pop(TokenType.STRING).value).to.equal('"bar1"')
      result.pop(TokenType.WORD)
      expect(result.pop(TokenType.STRING).value).to.equal('"bar2"')
      result.pop(TokenType.STRING)
      expect(result.pop(TokenType.STRING).value).to.equal('"bar3"')
    })

    it('throws for unterminated strings', function () {
      expect(() => tokenize('"string" "unterminated string')).to.throw(UnterminatedStringError)
    })

    it('detects arrows', function () {
      const result = tokenize('->')
      expect(result).to.be.an.instanceOf(TokenStream)
      expect(result.pop(TokenType.ARROW).value).to.equal('->')
    })

    it('detects arrows between words', function () {
      const result = tokenize('foo->bar')
      expect(result).to.be.an.instanceOf(TokenStream)
      expect(result.pop(TokenType.WORD).value).to.equal('foo')
      expect(result.pop(TokenType.ARROW).value).to.equal('->')
      expect(result.pop(TokenType.WORD).value).to.equal('bar')
    })
  })
})
