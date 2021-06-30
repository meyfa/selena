import { detectEntity, parseEntity } from '../../../src/parser/entity/parse-entity'
import { Token, TokenType } from '../../../src/tokenizer/token'
import { TokenStream } from '../../../src/tokenizer/token-stream'
import { EntityType } from '../../../src/sequence/entity'

import { expect } from 'chai'
import { TokenAccessor } from '../../../src/parser/token-accessor'

describe('src/parser/entity/parse-entity.ts', function () {
  describe('detectEntity()', function () {
    it('returns true if given keyword "object"', function () {
      const token = new Token(TokenType.WORD, 0, 'object')
      expect(detectEntity(token)).to.be.true
    })

    it('returns false if given a different keyword', function () {
      const token = new Token(TokenType.WORD, 0, 'foo')
      expect(detectEntity(token)).to.be.false
    })

    it('returns false if given a different token type', function () {
      const token = new Token(TokenType.STRING, 0, '"object"')
      expect(detectEntity(token)).to.be.false
    })
  })

  describe('parseEntity()', function () {
    it('parses entities without options', function () {
      const tokens = new TokenAccessor(new TokenStream([
        new Token(TokenType.WORD, 0, 'object'),
        new Token(TokenType.WORD, 7, 'foo'),
        new Token(TokenType.EQUALS, 10, '='),
        new Token(TokenType.STRING, 11, '"Foo"')
      ]))
      const parsed = parseEntity(tokens)
      expect(parsed.id).to.equal('foo')
      expect(parsed.name).to.equal('Foo')
      expect(parsed.type).to.equal(EntityType.COMPONENT)
    })

    it('parses entities with empty options', function () {
      const tokens = new TokenAccessor(new TokenStream([
        new Token(TokenType.WORD, 0, 'object'),
        new Token(TokenType.PAREN_LEFT, 7, '('),
        new Token(TokenType.PAREN_RIGHT, 8, ')'),
        new Token(TokenType.WORD, 9, 'foo'),
        new Token(TokenType.EQUALS, 12, '='),
        new Token(TokenType.STRING, 13, '"Foo"')
      ]))
      const parsed = parseEntity(tokens)
      expect(parsed.id).to.equal('foo')
      expect(parsed.name).to.equal('Foo')
      expect(parsed.type).to.equal(EntityType.COMPONENT)
    })

    it('parses entities with option "actor"', function () {
      const tokens = new TokenAccessor(new TokenStream([
        new Token(TokenType.WORD, 0, 'object'),
        new Token(TokenType.PAREN_LEFT, 7, '('),
        new Token(TokenType.WORD, 8, 'actor'),
        new Token(TokenType.PAREN_RIGHT, 13, ')'),
        new Token(TokenType.WORD, 14, 'foo'),
        new Token(TokenType.EQUALS, 17, '='),
        new Token(TokenType.STRING, 18, '"Foo"')
      ]))
      const parsed = parseEntity(tokens)
      expect(parsed.id).to.equal('foo')
      expect(parsed.name).to.equal('Foo')
      expect(parsed.type).to.equal(EntityType.ACTOR)
    })
  })
})
