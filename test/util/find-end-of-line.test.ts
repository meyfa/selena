import { expect } from 'chai'
import { findEndOfLine } from '../../src/util/find-end-of-line.js'

describe('src/util/regexp-index-of.ts', function () {
  describe('findEndOfLine() without position', function () {
    it('returns first position of "\\n"', function () {
      expect(findEndOfLine('asdf\nghj')).to.equal(4)
      expect(findEndOfLine('asdf\ngh\nj')).to.equal(4)
      expect(findEndOfLine('asdf\nghj\n')).to.equal(4)
    })

    it('returns first position of "\\r"', function () {
      expect(findEndOfLine('asdf\rghj')).to.equal(4)
      expect(findEndOfLine('asdf\rgh\rj')).to.equal(4)
      expect(findEndOfLine('asdf\rghj\r')).to.equal(4)
    })

    it('returns minimum position if both "\\n" and "\\r" exist', function () {
      expect(findEndOfLine('a\nsdfghj\rkl')).to.equal(1)
      expect(findEndOfLine('asd\rfghj\nkl')).to.equal(3)
    })

    it('returns string.length if no end-of-line exists', function () {
      expect(findEndOfLine('')).to.equal(0)
      expect(findEndOfLine('012 456')).to.equal(7)
    })
  })

  describe('findEndOfLine() with position', function () {
    it('returns first position of "\\n" or "\\r"', function () {
      expect(findEndOfLine('a\nsdf\rghj\nkl', 0)).to.equal(1)
      expect(findEndOfLine('a\nsdf\rghj\nkl', 1)).to.equal(1)
      expect(findEndOfLine('a\nsdf\rghj\nkl', 2)).to.equal(5)
      expect(findEndOfLine('a\nsdf\rghj\nkl', 7)).to.equal(9)
    })

    it('returns string.length if no end-of-line exists', function () {
      expect(findEndOfLine('', 0)).to.equal(0)
      expect(findEndOfLine('ab', 0)).to.equal(2)
      expect(findEndOfLine('ab', 2)).to.equal(2)
    })
  })

  describe('findEndOfLine() with out-of-bounds positions', function () {
    it('treats negative positions like 0', function () {
      expect(findEndOfLine('a\nsdfghj\rkl', -1)).to.equal(1)
      expect(findEndOfLine('asd\rfghj\nkl', -2000)).to.equal(3)
      expect(findEndOfLine('asdfghjkl', -2000)).to.equal(9)
    })

    it('treats too large positions like string.length', function () {
      expect(findEndOfLine('a\nsdfghj\rkl', 100)).to.equal(11)
      expect(findEndOfLine('asd\rfghj\nkl', 100)).to.equal(11)
      expect(findEndOfLine('asdfghjkl', 100)).to.equal(9)
    })
  })
})
