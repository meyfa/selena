import { expect } from 'chai'

import { regexpIndexOf } from '../../src/util/regexp-index-of.js'

describe('src/util/regexp-index-of.ts', function () {
  describe('regexpIndexOf() without position', function () {
    it('returns position of first match, if it exists', function () {
      expect(regexpIndexOf('hello world', /h/)).to.equal(0)
      expect(regexpIndexOf('hello world', /world/)).to.equal(6)
      expect(regexpIndexOf('hello world', /./)).to.equal(0)
      expect(regexpIndexOf('hello world', /\s+/)).to.equal(5)
    })

    it('returns -1 if RegExp does not match', function () {
      expect(regexpIndexOf('hello world', /x/)).to.equal(-1)
      expect(regexpIndexOf('hello world', /\s{2,}/)).to.equal(-1)
    })
  })

  describe('regexpIndexOf() with position', function () {
    it('returns position of first match, if it exists', function () {
      expect(regexpIndexOf('hello world', /h/, 0)).to.equal(0)
      expect(regexpIndexOf('hello world', /world/, 6)).to.equal(6)
      expect(regexpIndexOf('hello world', /./, 3)).to.equal(3)
      expect(regexpIndexOf('hello world', /\s+/, 1)).to.equal(5)
    })

    it('returns -1 if RegExp does not match', function () {
      expect(regexpIndexOf('hello world', /x/)).to.equal(-1)
      expect(regexpIndexOf('hello world', /\s{2,}/)).to.equal(-1)
      expect(regexpIndexOf('hello world', /h/, 1)).to.equal(-1)
      expect(regexpIndexOf('hello world', /world/, 8)).to.equal(-1)
      expect(regexpIndexOf('hello world', /./, 11)).to.equal(-1)
      expect(regexpIndexOf('hello world', /\s+/, 7)).to.equal(-1)
    })
  })

  describe('regexpIndexOf() with out-of-bounds positions', function () {
    it('treats negative positions like 0', function () {
      expect(regexpIndexOf('hello world', /h/, -3)).to.equal(0)
      expect(regexpIndexOf('hello world', /world/, -3)).to.equal(6)
      expect(regexpIndexOf('hello world', /./, -3)).to.equal(0)
      expect(regexpIndexOf('hello world', /\s+/, -3)).to.equal(5)
    })

    it('treats too large positions like string.length', function () {
      expect(regexpIndexOf('hello world', /x/, 100)).to.equal(-1)
      expect(regexpIndexOf('hello world', /\s*/, 100)).to.equal(11)
      expect(regexpIndexOf('hello world', /h/, 100)).to.equal(-1)
    })
  })
})
