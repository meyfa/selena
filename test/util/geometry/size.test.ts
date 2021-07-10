import { expect } from 'chai'

import { Size } from '../../../src/util/geometry/size'

describe('src/util/geometry/size.ts', function () {
  describe('ZERO', function () {
    it('is a Size with zero width and zero height', function () {
      expect(Size.ZERO).to.be.an.instanceOf(Size)
      expect(Size.ZERO.width).to.equal(0)
      expect(Size.ZERO.height).to.equal(0)
    })
  })

  describe('constructor', function () {
    it('stores width, height values', function () {
      expect(new Size(42.25, 37.75).width).to.equal(42.25)
      expect(new Size(42.25, 37.75).height).to.equal(37.75)
      expect(new Size(0, 0).width).to.equal(0)
      expect(new Size(0, 0).height).to.equal(0)
    })

    it('sets negative values to 0', function () {
      expect(new Size(0, 37.75).width).to.equal(0)
      expect(new Size(0, 37.75).height).to.equal(37.75)
      expect(new Size(42.25, 0).width).to.equal(42.25)
      expect(new Size(42.25, 0).height).to.equal(0)
    })
  })

  describe('#add()', function () {
    it('adds the given deltas to the dimensions', function () {
      expect(new Size(10, 0).add(3, 7.75).width).to.equal(13)
      expect(new Size(10, 0).add(3, 7.75).height).to.equal(7.75)
      expect(new Size(10, 15).add(-3, -7.75).width).to.equal(7)
      expect(new Size(10, 15).add(-3, -7.75).height).to.equal(7.25)
    })

    it('sets negative result values to 0', function () {
      expect(new Size(10, 0).add(-12.25, 7.75).width).to.equal(0)
      expect(new Size(10, 0).add(-12.25, 7.75).height).to.equal(7.75)
      expect(new Size(10, 15).add(-2.25, -17.75).width).to.equal(7.75)
      expect(new Size(10, 15).add(-2.25, -17.75).height).to.equal(0)
    })

    it('does not modify the original size', function () {
      const obj = new Size(42, 37)
      obj.add(3, 3)
      expect(obj.width).to.equal(42)
      expect(obj.height).to.equal(37)
    })
  })
})
