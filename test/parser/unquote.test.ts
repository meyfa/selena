import { expect } from 'chai'
import { unquote } from '../../src/parser/unquote.js'
import { Token, TokenType } from '../../src/tokenizer/token.js'

describe('src/parser/unquote.ts', function () {
  it('throws for tokens that are not strings', function () {
    expect(() => unquote(new Token(TokenType.WORD, 0, '"foo"'))).to.throw()
  })

  it('returns the token value without beginning and end quote', function () {
    expect(unquote(new Token(TokenType.STRING, 0, '"foo"'))).to.equal('foo')
  })

  it('ignores all other quotes', function () {
    expect(unquote(new Token(TokenType.STRING, 0, '"foo " \\" "" "'))).to.equal('foo " \\" "" ')
  })
})
