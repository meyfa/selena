import { detectMessage, parseMessage } from '../../../src/parser/message/parse-message'
import { Token, TokenType } from '../../../src/tokenizer/token'
import { TokenStream } from '../../../src/tokenizer/token-stream'
import { TokenAccessor } from '../../../src/parser/token-accessor'
import { Entity, EntityType } from '../../../src/sequence/entity'
import { EntityLookup } from '../../../src/parser/parser-state'
import { MessageStyle } from '../../../src/sequence/message'

import { expect } from 'chai'

describe('src/parser/message/parse-message.ts', function () {
  describe('detectMessage()', function () {
    it('returns true if given arrow', function () {
      const token = new Token(TokenType.ARROW, 0, '->')
      expect(detectMessage(token)).to.be.true
    })

    it('returns true if given "*"', function () {
      const token = new Token(TokenType.WORD, 0, '*')
      expect(detectMessage(token)).to.be.true
    })

    it('returns false if given a different word', function () {
      const token = new Token(TokenType.WORD, 0, '**')
      expect(detectMessage(token)).to.be.false
    })

    it('returns false if given a different token type', function () {
      const token = new Token(TokenType.STRING, 0, '"->"')
      expect(detectMessage(token)).to.be.false
    })
  })

  describe('parseMessage()', function () {
    const foo = new Entity(EntityType.COMPONENT, 'foo', 'Foo')
    const bar = new Entity(EntityType.COMPONENT, 'bar', 'Bar')
    const entityLookup: EntityLookup = {
      lookupEntity (id: string): Entity | undefined {
        return id === foo.id ? foo : (id === bar.id ? bar : undefined)
      }
    }

    it('parses found message with label', function () {
      const tokens = [
        new Token(TokenType.WORD, 0, '*'),
        new Token(TokenType.ARROW, 1, '->'),
        new Token(TokenType.WORD, 3, 'bar'),
        new Token(TokenType.STRING, 6, '"label"')
      ]
      const tokenAccessor = new TokenAccessor(new TokenStream(tokens))
      const parsed = parseMessage(tokenAccessor, entityLookup, foo)
      expect(parsed.message).to.include({
        style: MessageStyle.FOUND,
        from: undefined,
        to: bar,
        label: 'label'
      })
      expect(parsed.reply).to.be.undefined
    })

    it('parses lost message with label', function () {
      const tokens = [
        new Token(TokenType.ARROW, 0, '->'),
        new Token(TokenType.WORD, 2, '*'),
        new Token(TokenType.STRING, 3, '"label"')
      ]
      const tokenAccessor = new TokenAccessor(new TokenStream(tokens))
      const parsed = parseMessage(tokenAccessor, entityLookup, foo)
      expect(parsed.message).to.include({
        style: MessageStyle.LOST,
        from: foo,
        to: undefined,
        label: 'label'
      })
      expect(parsed.reply).to.be.undefined
    })

    it('parses regular message with type and label', function () {
      const tokens = [
        new Token(TokenType.ARROW, 0, '->'),
        new Token(TokenType.PAREN_LEFT, 2, '('),
        new Token(TokenType.WORD, 3, 'sync'),
        new Token(TokenType.PAREN_RIGHT, 8, ')'),
        new Token(TokenType.WORD, 9, 'bar'),
        new Token(TokenType.STRING, 12, '"label"')
      ]
      const tokenAccessor = new TokenAccessor(new TokenStream(tokens))
      const parsed = parseMessage(tokenAccessor, entityLookup, foo)
      expect(parsed.message).to.include({
        style: MessageStyle.SYNC,
        from: foo,
        to: bar,
        label: 'label'
      })
      expect(parsed.reply).to.include({
        style: MessageStyle.REPLY,
        from: bar,
        to: foo,
        label: ''
      })
    })

    it('parses block contents', function () {
      const tokens = [
        new Token(TokenType.ARROW, 0, '->'),
        new Token(TokenType.PAREN_LEFT, 2, '('),
        new Token(TokenType.WORD, 3, 'sync'),
        new Token(TokenType.PAREN_RIGHT, 8, ')'),
        new Token(TokenType.WORD, 9, 'bar'),
        new Token(TokenType.BLOCK_LEFT, 12, '{'),
        new Token(TokenType.ARROW, 13, '->'),
        new Token(TokenType.WORD, 15, 'foo'),
        new Token(TokenType.WORD, 18, 'return'),
        new Token(TokenType.STRING, 25, '"return value"'),
        new Token(TokenType.BLOCK_RIGHT, 40, '}')
      ]
      const tokenAccessor = new TokenAccessor(new TokenStream(tokens))
      const parsed = parseMessage(tokenAccessor, entityLookup, foo)
      expect(parsed.message).to.include({
        style: MessageStyle.SYNC,
        from: foo,
        to: bar,
        label: ''
      })
      expect(parsed.reply).to.include({
        style: MessageStyle.REPLY,
        from: bar,
        to: foo,
        label: 'return value'
      })
      expect(parsed.children).to.have.lengthOf(1)
      expect(parsed.children[0].message).to.include({
        style: MessageStyle.SYNC,
        from: bar,
        to: foo,
        label: ''
      })
      expect(parsed.children[0].reply).to.include({
        style: MessageStyle.REPLY,
        from: foo,
        to: bar,
        label: ''
      })
    })
  })
})
