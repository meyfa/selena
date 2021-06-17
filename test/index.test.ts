import * as index from '../index'

import { expect } from 'chai'
import { TokenStream } from '../src/tokenizer/token-stream'
import { TokenType } from '../src/tokenizer/token'

describe('index.ts', function () {
  describe('#tokenize()', function () {
    it('is a function', function () {
      expect(index.tokenize).to.be.a('function')
    })

    it('performs tokenization', function () {
      const result = index.tokenize('foo : "bar"')
      expect(result).to.be.an.instanceOf(TokenStream)
      expect(result.pop(TokenType.WORD).value).to.equal('foo')
      expect(result.pop(TokenType.COLON).value).to.equal(':')
      expect(result.pop(TokenType.STRING).value).to.equal('"bar"')
    })
  })

  describe('#parse()', function () {
    it('is a function', function () {
      expect(index.parse).to.be.a('function')
    })
  })
})
