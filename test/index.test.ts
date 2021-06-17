import * as index from '../index'

import { expect } from 'chai'

describe('index.ts', function () {
  describe('#parse()', function () {
    it('is a function', function () {
      expect(index.parse).to.be.a('function')
    })
  })
})
