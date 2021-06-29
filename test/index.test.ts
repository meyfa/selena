import * as index from '../index'
import { TokenStream } from '../src/tokenizer/token-stream'
import { Token, TokenType } from '../src/tokenizer/token'

import { expect } from 'chai'

describe('index.ts', function () {
  describe('#tokenize()', function () {
    it('is a function', function () {
      expect(index.tokenize).to.be.a('function')
    })

    it('performs tokenization', function () {
      const result = index.tokenize('foo : "bar"')
      expect(result).to.be.an.instanceOf(TokenStream)
      expect(result.pop(TokenType.WORD).value).to.equal('foo')
      expect(result.pop(TokenType.COLON).value).to.equal(':')
      expect(result.pop(TokenType.STRING).value).to.equal('"bar"')
    })
  })

  describe('#parse()', function () {
    it('is a function', function () {
      expect(index.parse).to.be.a('function')
    })

    it('performs parsing', function () {
      const tokens = new TokenStream([
        new Token(TokenType.WORD, 'object'),
        new Token(TokenType.WORD, 'foo'),
        new Token(TokenType.EQUALS, '='),
        new Token(TokenType.STRING, '"bar"')
      ])

      const result = index.parse(tokens)
      expect(result.entities.length).to.equal(1)
      expect(result.entities[0].id).to.equal('foo')
      expect(result.entities[0].name).to.equal('bar')
    })
  })

  describe('#compileToSequence()', function () {
    it('is a function', function () {
      expect(index.compileToSequence).to.be.a('function')
    })

    it('tokenizes and parses', function () {
      const result = index.compileToSequence('object foo = "bar"')
      expect(result.entities.length).to.equal(1)
      expect(result.entities[0].id).to.equal('foo')
      expect(result.entities[0].name).to.equal('bar')
    })
  })
})
