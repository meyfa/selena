import { expect } from 'chai'
import { detectMessageDescription, parseMessageDescription } from '../../../src/parser/message/parse-message-description.js'
import { Token, TokenType } from '../../../src/tokenizer/token.js'
import { TokenStream } from '../../../src/tokenizer/token-stream.js'
import { TokenAccessor } from '../../../src/parser/token-accessor.js'
import { Entity, EntityType } from '../../../src/sequence/entity.js'
import { EntityLookup } from '../../../src/parser/parser-state.js'
import { MessageType } from '../../../src/parser/message/message-description.js'
import { ParserError } from '../../../src/parser/errors.js'

describe('src/parser/message/parse-message-description.ts', function () {
  describe('detectMessageDescription()', function () {
    it('returns true if given arrow', function () {
      const token = new Token(TokenType.ARROW, 0, '->')
      expect(detectMessageDescription(token)).to.equal(true)
    })

    it('returns true if given "*"', function () {
      const token = new Token(TokenType.WORD, 0, '*')
      expect(detectMessageDescription(token)).to.equal(true)
    })

    it('returns false if given a different word', function () {
      const token = new Token(TokenType.WORD, 0, '**')
      expect(detectMessageDescription(token)).to.equal(false)
    })

    it('returns false if given a different token type', function () {
      const token = new Token(TokenType.STRING, 0, '"->"')
      expect(detectMessageDescription(token)).to.equal(false)
    })
  })

  describe('parseMessageDescription()', function () {
    const foo = new Entity(EntityType.COMPONENT, 'foo', 'Foo')
    const bar = new Entity(EntityType.COMPONENT, 'bar', 'Bar')
    const entityLookup: EntityLookup = {
      lookupEntity (id: string): Entity | undefined {
        return id === foo.id ? foo : (id === bar.id ? bar : undefined)
      }
    }

    it('parses found message', function () {
      const tokens = [
        new Token(TokenType.WORD, 0, '*'),
        new Token(TokenType.ARROW, 1, '->'),
        new Token(TokenType.WORD, 3, 'foo')
      ]
      const tokenAccessor = new TokenAccessor(new TokenStream(tokens))
      const parsed = parseMessageDescription(tokenAccessor, entityLookup)
      expect(parsed).to.include({
        type: MessageType.SYNC,
        fromOutside: true,
        target: foo,
        label: '',
        block: undefined
      })
    })

    it('parses found message with label', function () {
      const tokens = [
        new Token(TokenType.WORD, 0, '*'),
        new Token(TokenType.ARROW, 1, '->'),
        new Token(TokenType.WORD, 3, 'foo'),
        new Token(TokenType.STRING, 6, '"label"')
      ]
      const tokenAccessor = new TokenAccessor(new TokenStream(tokens))
      const parsed = parseMessageDescription(tokenAccessor, entityLookup)
      expect(parsed).to.include({
        type: MessageType.SYNC,
        fromOutside: true,
        target: foo,
        label: 'label',
        block: undefined
      })
    })

    it('parses lost message', function () {
      const tokens = [
        new Token(TokenType.ARROW, 0, '->'),
        new Token(TokenType.WORD, 2, '*')
      ]
      const tokenAccessor = new TokenAccessor(new TokenStream(tokens))
      const parsed = parseMessageDescription(tokenAccessor, entityLookup)
      expect(parsed).to.include({
        type: MessageType.SYNC,
        fromOutside: false,
        target: undefined,
        label: '',
        block: undefined
      })
    })

    it('parses lost message with label', function () {
      const tokens = [
        new Token(TokenType.ARROW, 0, '->'),
        new Token(TokenType.WORD, 2, '*'),
        new Token(TokenType.STRING, 3, '"label"')
      ]
      const tokenAccessor = new TokenAccessor(new TokenStream(tokens))
      const parsed = parseMessageDescription(tokenAccessor, entityLookup)
      expect(parsed).to.include({
        type: MessageType.SYNC,
        fromOutside: false,
        target: undefined,
        label: 'label',
        block: undefined
      })
    })

    it('throws if detecting found message with no target', function () {
      const tokens = [
        new Token(TokenType.WORD, 0, '*'),
        new Token(TokenType.ARROW, 1, '->'),
        new Token(TokenType.WORD, 3, '*')
      ]
      const tokenAccessor = new TokenAccessor(new TokenStream(tokens))
      expect(() => parseMessageDescription(tokenAccessor, entityLookup)).to.throw(ParserError)
    })

    it('throws if missing target entirely', function () {
      const tokens = [
        new Token(TokenType.ARROW, 0, '->'),
        new Token(TokenType.STRING, 2, '"label"')
      ]
      const tokenAccessor = new TokenAccessor(new TokenStream(tokens))
      expect(() => parseMessageDescription(tokenAccessor, entityLookup)).to.throw(ParserError)
    })

    it('throws if target does not exist', function () {
      const tokens = [
        new Token(TokenType.ARROW, 0, '->'),
        new Token(TokenType.WORD, 2, 'asdf')
      ]
      const tokenAccessor = new TokenAccessor(new TokenStream(tokens))
      expect(() => parseMessageDescription(tokenAccessor, entityLookup)).to.throw(ParserError)
    })

    it('throws if block is specified for lost message', function () {
      const tokens = [
        new Token(TokenType.ARROW, 0, '->'),
        new Token(TokenType.WORD, 2, '*'),
        new Token(TokenType.BLOCK_LEFT, 3, '{'),
        new Token(TokenType.BLOCK_RIGHT, 4, '}')
      ]
      const tokenAccessor = new TokenAccessor(new TokenStream(tokens))
      expect(() => parseMessageDescription(tokenAccessor, entityLookup)).to.throw(ParserError)
    })

    it('detects type if specified', function () {
      const tokens = [
        new Token(TokenType.ARROW, 0, '->'),
        new Token(TokenType.PAREN_LEFT, 2, '('),
        new Token(TokenType.WORD, 3, 'async'),
        new Token(TokenType.PAREN_RIGHT, 8, ')'),
        new Token(TokenType.WORD, 9, 'foo')
      ]
      const tokenAccessor = new TokenAccessor(new TokenStream(tokens))
      const parsed = parseMessageDescription(tokenAccessor, entityLookup)
      expect(parsed).to.include({
        type: MessageType.ASYNC,
        fromOutside: false,
        target: foo,
        label: '',
        block: undefined
      })
    })

    it('throws if parentheses exist but no type is specified', function () {
      const tokens = [
        new Token(TokenType.ARROW, 0, '->'),
        new Token(TokenType.PAREN_LEFT, 2, '('),
        new Token(TokenType.PAREN_RIGHT, 3, ')'),
        new Token(TokenType.WORD, 4, 'foo')
      ]
      const tokenAccessor = new TokenAccessor(new TokenStream(tokens))
      expect(() => parseMessageDescription(tokenAccessor, entityLookup)).to.throw(ParserError)
    })

    it('throws if invalid type is specified', function () {
      const tokens = [
        new Token(TokenType.ARROW, 0, '->'),
        new Token(TokenType.PAREN_LEFT, 2, '('),
        new Token(TokenType.WORD, 3, 'asdf'),
        new Token(TokenType.PAREN_RIGHT, 7, ')'),
        new Token(TokenType.WORD, 8, 'foo')
      ]
      const tokenAccessor = new TokenAccessor(new TokenStream(tokens))
      expect(() => parseMessageDescription(tokenAccessor, entityLookup)).to.throw(ParserError)
    })

    it('parses block contents', function () {
      const tokens = [
        new Token(TokenType.ARROW, 0, '->'),
        new Token(TokenType.WORD, 10, 'foo'),
        new Token(TokenType.BLOCK_LEFT, 20, '{'),
        new Token(TokenType.ARROW, 30, '->'),
        new Token(TokenType.WORD, 40, 'bar'),
        new Token(TokenType.WORD, 50, 'return'),
        new Token(TokenType.STRING, 60, '"ret"'),
        new Token(TokenType.BLOCK_RIGHT, 70, '}')
      ]
      const tokenAccessor = new TokenAccessor(new TokenStream(tokens))
      const parsed = parseMessageDescription(tokenAccessor, entityLookup)
      expect(parsed).to.include({
        type: MessageType.SYNC,
        fromOutside: false,
        target: foo,
        label: ''
      })
      expect(parsed.block).to.be.an('object')
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const block = parsed.block!
      expect(block.returnValue).to.equal('ret')
      expect(block.activations).to.have.lengthOf(1)
      expect(block.activations[0].message.from).to.equal(foo)
      expect(block.activations[0].message.to).to.equal(bar)
    })
  })
})
