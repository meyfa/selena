import { expect } from 'chai'
import { Point } from '../../../src/util/geometry/point.js'

describe('src/util/geometry/point.ts', function () {
  describe('ORIGIN', function () {
    it('is the point (0,0)', function () {
      expect(Point.ORIGIN).to.be.an.instanceOf(Point)
      expect(Point.ORIGIN.x).to.equal(0)
      expect(Point.ORIGIN.y).to.equal(0)
    })
  })

  describe('constructor', function () {
    it('stores x, y values as given', function () {
      expect(new Point(42.25, 37.75).x).to.equal(42.25)
      expect(new Point(42.25, 37.75).y).to.equal(37.75)
      expect(new Point(-42.25, 37.75).x).to.equal(-42.25)
      expect(new Point(42.25, -37.75).y).to.equal(-37.75)
    })
  })

  describe('#translate()', function () {
    it('adds the given deltas to the coordinates', function () {
      expect(new Point(10, -15).translate(12.25, 17.75).x).to.equal(22.25)
      expect(new Point(10, -15).translate(12.25, 17.75).y).to.equal(2.75)
      expect(new Point(10, 15).translate(-12.25, -17.75).x).to.equal(-2.25)
      expect(new Point(10, 15).translate(-12.25, -17.75).y).to.equal(-2.75)
    })

    it('does not modify the original point', function () {
      const obj = new Point(42, 37)
      obj.translate(3, 3)
      expect(obj.x).to.equal(42)
      expect(obj.y).to.equal(37)
    })
  })

  describe('#withX()', function () {
    it('sets the x coordinate', function () {
      expect(new Point(10, -15).withX(42).x).to.equal(42)
      expect(new Point(10, -15).withX(-42).x).to.equal(-42)
    })

    it('keeps the y coordinate', function () {
      expect(new Point(10, -15).withX(42).y).to.equal(-15)
      expect(new Point(10, -15).withX(-42).y).to.equal(-15)
    })

    it('does not modify the original point', function () {
      const obj = new Point(42, 37)
      obj.withX(3)
      expect(obj.x).to.equal(42)
      expect(obj.y).to.equal(37)
    })
  })

  describe('#withY()', function () {
    it('sets the y coordinate', function () {
      expect(new Point(10, -15).withY(42).y).to.equal(42)
      expect(new Point(10, -15).withY(-42).y).to.equal(-42)
    })

    it('keeps the x coordinate', function () {
      expect(new Point(10, -15).withY(42).x).to.equal(10)
      expect(new Point(10, -15).withY(-42).x).to.equal(10)
    })

    it('does not modify the original point', function () {
      const obj = new Point(42, 37)
      obj.withY(3)
      expect(obj.x).to.equal(42)
      expect(obj.y).to.equal(37)
    })
  })
})
