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
      expect(result.next()).to.include({ type: TokenType.EQUALS, value: '=' })
      expect(result.next()).to.include({ type: TokenType.PAREN_LEFT, value: '(' })
      expect(result.next()).to.include({ type: TokenType.PAREN_RIGHT, value: ')' })
      expect(result.next()).to.include({ type: TokenType.BLOCK_LEFT, value: '{' })
      expect(result.next()).to.include({ type: TokenType.BLOCK_RIGHT, value: '}' })
      expect(result.next()).to.include({ type: TokenType.COLON, value: ':' })
      expect(result.next()).to.include({ type: TokenType.WORD, value: 'foo' })
      expect(result.next()).to.include({ type: TokenType.STRING, value: '"bar baz"' })
      expect(result.next()).to.include({ type: TokenType.WORD, value: 'word$with.special*chars' })
    })

    it('detects strings', function () {
      const result = tokenize('"foo bar" "baz" "key:value" "call()"')
      expect(result).to.be.an.instanceOf(TokenStream)
      expect(result.next()).to.include({ type: TokenType.STRING, value: '"foo bar"' })
      expect(result.next()).to.include({ type: TokenType.STRING, value: '"baz"' })
      expect(result.next()).to.include({ type: TokenType.STRING, value: '"key:value"' })
      expect(result.next()).to.include({ type: TokenType.STRING, value: '"call()"' })
    })

    it('detects words', function () {
      const result = tokenize('foo foo_bar b*z')
      expect(result).to.be.an.instanceOf(TokenStream)
      expect(result.next()).to.include({ type: TokenType.WORD, value: 'foo' })
      expect(result.next()).to.include({ type: TokenType.WORD, value: 'foo_bar' })
      expect(result.next()).to.include({ type: TokenType.WORD, value: 'b*z' })
    })

    it('detects strings directly following other tokens', function () {
      const result = tokenize('("bar1" foo"bar2" "foo""bar3"')
      expect(result).to.be.an.instanceOf(TokenStream)
      expect(result.next().type).to.equal(TokenType.PAREN_LEFT)
      expect(result.next()).to.include({ type: TokenType.STRING, value: '"bar1"' })
      expect(result.next().type).to.equal(TokenType.WORD)
      expect(result.next()).to.include({ type: TokenType.STRING, value: '"bar2"' })
      expect(result.next().type).to.equal(TokenType.STRING)
      expect(result.next()).to.include({ type: TokenType.STRING, value: '"bar3"' })
    })

    it('throws for unterminated strings', function () {
      expect(() => tokenize('"string" "unterminated string')).to.throw(UnterminatedStringError)
    })

    it('throws for strings broken by newline', function () {
      expect(() => tokenize('"unterminated\nstring"')).to.throw(UnterminatedStringError)
      expect(() => tokenize('"unterminated\rstring"')).to.throw(UnterminatedStringError)
      expect(() => tokenize('"unterminated\r\nstring"')).to.throw(UnterminatedStringError)
    })

    it('detects arrows', function () {
      const result = tokenize('->')
      expect(result).to.be.an.instanceOf(TokenStream)
      expect(result.next()).to.include({ type: TokenType.ARROW, value: '->' })
    })

    it('detects arrows between words', function () {
      const result = tokenize('foo->bar')
      expect(result).to.be.an.instanceOf(TokenStream)
      expect(result.next()).to.include({ type: TokenType.WORD, value: 'foo' })
      expect(result.next()).to.include({ type: TokenType.ARROW, value: '->' })
      expect(result.next()).to.include({ type: TokenType.WORD, value: 'bar' })
    })

    it('detects line comments (only input)', function () {
      const result = tokenize('# line comment')
      expect(result.next()).to.include({ type: TokenType.COMMENT, value: '# line comment' })
      expect(result.hasNext()).to.be.false
    })

    it('detects line comments (after words)', function () {
      const result = tokenize('foo # line comment')
      expect(result.next()).to.include({ type: TokenType.WORD, value: 'foo' })
      expect(result.next()).to.include({ type: TokenType.COMMENT, value: '# line comment' })
      expect(result.hasNext()).to.be.false
    })

    it('detects line comments (after strings)', function () {
      const result = tokenize('"foo bar" # line comment')
      expect(result.next()).to.include({ type: TokenType.STRING, value: '"foo bar"' })
      expect(result.next()).to.include({ type: TokenType.COMMENT, value: '# line comment' })
      expect(result.hasNext()).to.be.false
    })

    it('detects line comments (multiple consecutive)', function () {
      const result = tokenize('# line comment\n  #another\n  #yet another')
      expect(result.next()).to.include({ type: TokenType.COMMENT, value: '# line comment' })
      expect(result.next()).to.include({ type: TokenType.COMMENT, value: '#another' })
      expect(result.next()).to.include({ type: TokenType.COMMENT, value: '#yet another' })
      expect(result.hasNext()).to.be.false
    })

    it('does not include newline characters in comments', function () {
      expect(tokenize('# foo\nbar').next()).to.include({ type: TokenType.COMMENT, value: '# foo' })
      expect(tokenize('# foo\rbar').next()).to.include({ type: TokenType.COMMENT, value: '# foo' })
      expect(tokenize('# foo\r\nbar').next()).to.include({ type: TokenType.COMMENT, value: '# foo' })
    })

    it('detects line comments containing # character', function () {
      const result = tokenize('# foo#bar #')
      expect(result.next()).to.include({ type: TokenType.COMMENT, value: '# foo#bar #' })
      expect(result.hasNext()).to.be.false
    })
  })
})
