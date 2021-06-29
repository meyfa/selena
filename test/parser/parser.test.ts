import { parse } from '../../src/parser/parser'
import { TokenStream } from '../../src/tokenizer/token-stream'
import { Token, TokenType } from '../../src/tokenizer/token'

import { expect } from 'chai'

describe('src/parser/parser.ts', function () {
  it('parses empty token stream as empty sequence', function () {
    const tokens = new TokenStream([])
    const parsed = parse(tokens)
    expect(parsed.entities).to.have.lengthOf(0)
    expect(parsed.activations).to.have.lengthOf(0)
  })

  it('parses objects into entities', function () {
    const tokens = new TokenStream([
      new Token(TokenType.WORD, 'object'),
      new Token(TokenType.WORD, 'foo'),
      new Token(TokenType.EQUALS, '='),
      new Token(TokenType.STRING, '"Foo"'),
      new Token(TokenType.WORD, 'object'),
      new Token(TokenType.WORD, 'bar'),
      new Token(TokenType.EQUALS, '='),
      new Token(TokenType.STRING, '"Bar"')
    ])
    const parsed = parse(tokens)
    expect(parsed.entities).to.have.lengthOf(2)
    expect(parsed.entities[0].id).to.equal('foo')
    expect(parsed.entities[1].id).to.equal('bar')
  })

  it('throws for unexpected token (global level)', function () {
    const tokens = new TokenStream([
      new Token(TokenType.WORD, '"hello world"')
    ])
    expect(() => parse(tokens)).to.throw()
  })
})
