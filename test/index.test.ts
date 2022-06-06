import { expect } from 'chai'
import * as index from '../src/index.js'

describe('index.ts', function () {
  const { Token, TokenStream, TokenType } = index

  describe('#tokenize()', function () {
    it('is a function', function () {
      expect(index.tokenize).to.be.a('function')
    })

    it('performs tokenization', function () {
      const result = index.tokenize('foo : "bar"')
      expect(result).to.be.an.instanceOf(TokenStream)
      expect(result.next()).to.include({ type: TokenType.WORD, value: 'foo' })
      expect(result.next()).to.include({ type: TokenType.COLON, value: ':' })
      expect(result.next()).to.include({ type: TokenType.STRING, value: '"bar"' })
    })
  })

  describe('#parse()', function () {
    it('is a function', function () {
      expect(index.parse).to.be.a('function')
    })

    it('performs parsing', function () {
      const tokens = new TokenStream([
        new Token(TokenType.WORD, 0, 'object'),
        new Token(TokenType.WORD, 7, 'foo'),
        new Token(TokenType.EQUALS, 10, '='),
        new Token(TokenType.STRING, 11, '"bar"')
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
