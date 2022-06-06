import { expect } from 'chai'
import { detectMessageBlock, parseMessageBlock } from '../../../src/parser/message/parse-message-block.js'
import { Token, TokenType } from '../../../src/tokenizer/token.js'
import { TokenStream } from '../../../src/tokenizer/token-stream.js'
import { TokenAccessor } from '../../../src/parser/token-accessor.js'
import { ParserError } from '../../../src/parser/errors.js'
import { Entity, EntityType } from '../../../src/sequence/entity.js'
import { EntityLookup } from '../../../src/parser/parser-state.js'

describe('src/parser/message/parse-message-block.ts', function () {
  describe('detectMessageBlock()', function () {
    it('returns true if given block_left', function () {
      const token = new Token(TokenType.BLOCK_LEFT, 0, '{')
      expect(detectMessageBlock(token)).to.be.true
    })

    it('returns false if given a different token type', function () {
      const token = new Token(TokenType.STRING, 0, '"{"')
      expect(detectMessageBlock(token)).to.be.false
    })
  })

  describe('parseMessageBlock()', function () {
    const foo = new Entity(EntityType.COMPONENT, 'foo', 'Foo')
    const bar = new Entity(EntityType.COMPONENT, 'bar', 'Bar')
    const entityLookup: EntityLookup = {
      lookupEntity (id: string): Entity | undefined {
        return id === foo.id ? foo : (id === bar.id ? bar : undefined)
      }
    }

    it('parses empty block', function () {
      const tokens = [
        new Token(TokenType.BLOCK_LEFT, 0, '{'),
        new Token(TokenType.BLOCK_RIGHT, 1, '}')
      ]
      const tokenAccessor = new TokenAccessor(new TokenStream(tokens))
      const parsed = parseMessageBlock(tokenAccessor, entityLookup, foo)
      expect(parsed).to.deep.equal({
        activations: [],
        returnValue: undefined,
        evidence: {
          returnValue: tokens[1]
        }
      })
    })

    it('parses block with child messages', function () {
      const tokens = [
        new Token(TokenType.BLOCK_LEFT, 0, '{'),
        new Token(TokenType.ARROW, 10, '->'),
        new Token(TokenType.WORD, 20, 'foo'),
        new Token(TokenType.ARROW, 10, '->'),
        new Token(TokenType.WORD, 20, 'bar'),
        new Token(TokenType.WORD, 30, '*'),
        new Token(TokenType.ARROW, 40, '->'),
        new Token(TokenType.WORD, 50, 'bar'),
        new Token(TokenType.BLOCK_RIGHT, 60, '}')
      ]
      const tokenAccessor = new TokenAccessor(new TokenStream(tokens))
      const parsed = parseMessageBlock(tokenAccessor, entityLookup, foo)
      expect(parsed.activations).to.have.lengthOf(3)
      expect(parsed.activations[0].message.from).to.equal(foo)
      expect(parsed.activations[0].message.to).to.equal(foo)
      expect(parsed.activations[1].message.from).to.equal(foo)
      expect(parsed.activations[1].message.to).to.equal(bar)
      expect(parsed.activations[2].message.from).to.be.undefined
      expect(parsed.activations[2].message.to).to.equal(bar)
      expect(parsed.returnValue).to.be.undefined
    })

    it('parses block with return statement', function () {
      const tokens = [
        new Token(TokenType.BLOCK_LEFT, 0, '{'),
        new Token(TokenType.WORD, 10, 'return'),
        new Token(TokenType.STRING, 20, '"foo"'),
        new Token(TokenType.BLOCK_RIGHT, 30, '}')
      ]
      const tokenAccessor = new TokenAccessor(new TokenStream(tokens))
      const parsed = parseMessageBlock(tokenAccessor, entityLookup, foo)
      expect(parsed).to.deep.equal({
        activations: [],
        returnValue: 'foo',
        evidence: {
          returnValue: tokens[1]
        }
      })
    })

    it('throws for multiple return statements', function () {
      const tokens = [
        new Token(TokenType.BLOCK_LEFT, 0, '{'),
        new Token(TokenType.WORD, 10, 'return'),
        new Token(TokenType.STRING, 20, '"foo"'),
        new Token(TokenType.WORD, 10, 'return'),
        new Token(TokenType.STRING, 20, '"bar"'),
        new Token(TokenType.BLOCK_RIGHT, 30, '}')
      ]
      const tokenAccessor = new TokenAccessor(new TokenStream(tokens))
      expect(() => parseMessageBlock(tokenAccessor, entityLookup, foo)).to.throw(ParserError)
    })

    it('throws for message after return statement', function () {
      const tokens = [
        new Token(TokenType.BLOCK_LEFT, 0, '{'),
        new Token(TokenType.WORD, 10, 'return'),
        new Token(TokenType.STRING, 20, '"foo"'),
        new Token(TokenType.WORD, 10, '->bar'),
        new Token(TokenType.BLOCK_RIGHT, 30, '}')
      ]
      const tokenAccessor = new TokenAccessor(new TokenStream(tokens))
      expect(() => parseMessageBlock(tokenAccessor, entityLookup, foo)).to.throw(ParserError)
    })

    it('throws for invalid token', function () {
      const tokens = [
        new Token(TokenType.BLOCK_LEFT, 0, '{'),
        new Token(TokenType.WORD, 10, 'asdf'),
        new Token(TokenType.BLOCK_RIGHT, 30, '}')
      ]
      const tokenAccessor = new TokenAccessor(new TokenStream(tokens))
      expect(() => parseMessageBlock(tokenAccessor, entityLookup, foo)).to.throw(ParserError)
    })
  })
})
