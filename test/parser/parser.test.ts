import { expect } from 'chai'

import { parse } from '../../src/parser/parser'
import { TokenStream } from '../../src/tokenizer/token-stream'
import { Token, TokenType } from '../../src/tokenizer/token'

describe('src/parser/parser.ts', function () {
  it('parses empty token stream as empty sequence', function () {
    const tokens = new TokenStream([])
    const parsed = parse(tokens)
    expect(parsed.entities).to.have.lengthOf(0)
    expect(parsed.activations).to.have.lengthOf(0)
  })

  it('parses objects into entities', function () {
    const tokens = new TokenStream([
      new Token(TokenType.WORD, 0, 'object'),
      new Token(TokenType.WORD, 7, 'foo'),
      new Token(TokenType.EQUALS, 10, '='),
      new Token(TokenType.STRING, 11, '"Foo"'),
      new Token(TokenType.WORD, 16, 'object'),
      new Token(TokenType.WORD, 24, 'bar'),
      new Token(TokenType.EQUALS, 27, '='),
      new Token(TokenType.STRING, 28, '"Bar"')
    ])
    const parsed = parse(tokens)
    expect(parsed.entities).to.have.lengthOf(2)
    expect(parsed.entities[0]).to.include({ id: 'foo', name: 'Foo' })
    expect(parsed.entities[1]).to.include({ id: 'bar', name: 'Bar' })
  })

  it('parses found messages', function () {
    const tokens = new TokenStream([
      new Token(TokenType.WORD, 0, 'object'),
      new Token(TokenType.WORD, 7, 'foo'),
      new Token(TokenType.EQUALS, 10, '='),
      new Token(TokenType.STRING, 11, '"Foo"'),
      new Token(TokenType.WORD, 18, '*'),
      new Token(TokenType.ARROW, 19, '->'),
      new Token(TokenType.WORD, 21, 'foo'),
      new Token(TokenType.STRING, 25, '"message"')
    ])
    const parsed = parse(tokens)
    expect(parsed.entities).to.have.lengthOf(1)
    expect(parsed.entities[0].id).to.equal('foo')
    expect(parsed.activations).to.have.lengthOf(1)
    expect(parsed.activations[0].message.from).to.be.undefined
    expect(parsed.activations[0].message.to).to.equal(parsed.entities[0])
    expect(parsed.activations[0].message.label).to.equal('message')
  })

  it('throws for unexpected token (global level)', function () {
    const tokens = new TokenStream([
      new Token(TokenType.WORD, 0, '"hello world"')
    ])
    expect(() => parse(tokens)).to.throw()
  })

  it('ignores comments', function () {
    const tokens = new TokenStream([
      new Token(TokenType.COMMENT, 0, '# comment'),
      new Token(TokenType.WORD, 12, 'object'),
      new Token(TokenType.WORD, 19, 'foo'),
      new Token(TokenType.COMMENT, 22, '# comment'),
      new Token(TokenType.EQUALS, 30, '='),
      new Token(TokenType.STRING, 31, '"Foo"')
    ])
    const parsed = parse(tokens)
    expect(parsed.entities).to.have.lengthOf(1)
    expect(parsed.entities[0].id).to.equal('foo')
    expect(parsed.activations).to.have.lengthOf(0)
  })
})
