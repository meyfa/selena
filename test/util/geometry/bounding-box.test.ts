import { expect } from 'chai'

import { BoundingBox } from '../../../src/util/geometry/bounding-box'
import { Point } from '../../../src/util/geometry/point'
import { Size } from '../../../src/util/geometry/size'

describe('src/util/geometry/bounding-box.ts', function () {
  describe('constructor', function () {
    it('stores minX, maxX, minY, maxY values as given if correctly ordered', function () {
      const obj = new BoundingBox(-42, 37, 5, 55)
      expect(obj).to.include({ minX: -42, maxX: 37, minY: 5, maxY: 55 })
    })

    it('reorders values if necessary', function () {
      const obj = new BoundingBox(37, -42, 55, 5)
      expect(obj).to.include({ minX: -42, maxX: 37, minY: 5, maxY: 55 })
    })

    it('allows zero size', function () {
      const obj = new BoundingBox(37, 37, 42, 42)
      expect(obj).to.include({ minX: 37, maxX: 37, minY: 42, maxY: 42 })
    })
  })

  describe('containingPoints()', function () {
    it('returns (0,0,0,0) if given empty array', function () {
      const obj = BoundingBox.containingPoints([])
      expect(obj).to.include({ minX: 0, maxX: 0, minY: 0, maxY: 0 })
    })

    it('returns (x,x,y,y) if given single point (x,y)', function () {
      const obj = BoundingBox.containingPoints([new Point(-42, 37)])
      expect(obj).to.include({ minX: -42, maxX: -42, minY: 37, maxY: 37 })
    })

    it('computes span of 2 points', function () {
      const obj = BoundingBox.containingPoints([
        new Point(-42, 37),
        new Point(5, -10)
      ])
      expect(obj).to.include({ minX: -42, maxX: 5, minY: -10, maxY: 37 })
    })

    it('computes span of many points', function () {
      const obj = BoundingBox.containingPoints([
        new Point(45, -4),
        new Point(50, 31),
        new Point(-48, 30),
        new Point(3, -39),
        new Point(-15, 25)
      ])
      expect(obj).to.include({ minX: -48, maxX: 50, minY: -39, maxY: 31 })
    })
  })

  describe('#size()', function () {
    it('returns difference between min and max x/y', function () {
      expect(new BoundingBox(0, 0, 0, 0).size()).to.deep.equal(Size.ZERO)
      expect(new BoundingBox(0, 10, 0, 12).size()).to.deep.equal(new Size(10, 12))
      expect(new BoundingBox(-27, 10, -30, 12).size()).to.deep.equal(new Size(37, 42))
    })
  })

  describe('#centerX()', function () {
    it('returns average of minX and maxX', function () {
      expect(new BoundingBox(0, 0, 0, 0).centerX()).to.equal(0)
      expect(new BoundingBox(0, 10, 0, 12).centerX()).to.equal(5)
      expect(new BoundingBox(-27, 10, -30, 12).centerX()).to.equal(-8.5)
    })
  })

  describe('#centerY()', function () {
    it('returns average of minY and maxY', function () {
      expect(new BoundingBox(0, 0, 0, 0).centerY()).to.equal(0)
      expect(new BoundingBox(0, 10, 0, 12).centerY()).to.equal(6)
      expect(new BoundingBox(-27, 10, -30, 12).centerY()).to.equal(-9)
    })
  })

  describe('#center()', function () {
    it('returns a point marking both centerX and centerY', function () {
      expect(new BoundingBox(0, 0, 0, 0).center()).to.deep.equal(Point.ORIGIN)
      expect(new BoundingBox(0, 10, 0, 12).center()).to.deep.equal(new Point(5, 6))
      expect(new BoundingBox(-27, 10, -30, 12).center()).to.deep.equal(new Point(-8.5, -9))
    })
  })
})
