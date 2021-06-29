import { detectEntity, parseEntity } from '../../../src/parser/entity/parse-entity'
import { Token, TokenType } from '../../../src/tokenizer/token'
import { TokenStream } from '../../../src/tokenizer/token-stream'
import { EntityType } from '../../../src/sequence/entity'

import { expect } from 'chai'

describe('src/parser/entity/parse-entity.ts', function () {
  describe('detectEntity()', function () {
    it('returns true if given keyword "object"', function () {
      const token = new Token(TokenType.WORD, 'object')
      expect(detectEntity(token)).to.be.true
    })

    it('returns false if given a different keyword', function () {
      const token = new Token(TokenType.WORD, 'foo')
      expect(detectEntity(token)).to.be.false
    })

    it('returns false if given a different token type', function () {
      const token = new Token(TokenType.STRING, '"object"')
      expect(detectEntity(token)).to.be.false
    })
  })

  describe('parseEntity()', function () {
    it('parses entities without options', function () {
      const tokens = new TokenStream([
        new Token(TokenType.WORD, 'object'),
        new Token(TokenType.WORD, 'foo'),
        new Token(TokenType.EQUALS, '='),
        new Token(TokenType.STRING, '"Foo"')
      ])
      const parsed = parseEntity(tokens)
      expect(parsed.id).to.equal('foo')
      expect(parsed.name).to.equal('Foo')
      expect(parsed.type).to.equal(EntityType.COMPONENT)
    })

    it('parses entities with empty options', function () {
      const tokens = new TokenStream([
        new Token(TokenType.WORD, 'object'),
        new Token(TokenType.PAREN_LEFT, '('),
        new Token(TokenType.PAREN_RIGHT, ')'),
        new Token(TokenType.WORD, 'foo'),
        new Token(TokenType.EQUALS, '='),
        new Token(TokenType.STRING, '"Foo"')
      ])
      const parsed = parseEntity(tokens)
      expect(parsed.id).to.equal('foo')
      expect(parsed.name).to.equal('Foo')
      expect(parsed.type).to.equal(EntityType.COMPONENT)
    })

    it('parses entities with option "actor"', function () {
      const tokens = new TokenStream([
        new Token(TokenType.WORD, 'object'),
        new Token(TokenType.PAREN_LEFT, '('),
        new Token(TokenType.WORD, 'actor'),
        new Token(TokenType.PAREN_RIGHT, ')'),
        new Token(TokenType.WORD, 'foo'),
        new Token(TokenType.EQUALS, '='),
        new Token(TokenType.STRING, '"Foo"')
      ])
      const parsed = parseEntity(tokens)
      expect(parsed.id).to.equal('foo')
      expect(parsed.name).to.equal('Foo')
      expect(parsed.type).to.equal(EntityType.ACTOR)
    })
  })
})
