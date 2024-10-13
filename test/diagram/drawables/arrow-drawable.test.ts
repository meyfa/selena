import { expect } from 'chai'
import { ArrowDrawable } from '../../../src/diagram/drawables/arrow-drawable.js'
import { Size } from '../../../src/util/geometry/size.js'
import { LineMarker, RenderAttributes, Renderer } from '../../../src/renderer/renderer.js'
import { Point } from '../../../src/util/geometry/point.js'

describe('src/diagram/drawables/arrow-drawable.ts', function () {
  describe('#measure()', function () {
    it('returns size of polyline area', function () {
      const attr: RenderAttributes = {
        measureText: () => Size.ZERO
      }
      const obj = new ArrowDrawable('', LineMarker.NONE, LineMarker.NONE, false)
      obj.setPoints([
        new Point(100, 50),
        new Point(200, 50),
        new Point(200, 150),
        new Point(100, 170)
      ])
      expect(obj.measure(attr)).to.deep.equal(new Size(100, 120))
    })
  })

  describe('#measureLabel()', function () {
    it('returns size of label text', function () {
      const size = new Size(42, 37)
      const attr: RenderAttributes = {
        measureText: (text) => {
          expect(text).to.equal('hello world')
          return size
        }
      }
      const obj = new ArrowDrawable('hello world', LineMarker.NONE, LineMarker.NONE, false)
      expect(obj.measureLabel(attr)).to.deep.equal(size)
    })

    it('returns 0 for empty string', function () {
      const attr: RenderAttributes = {
        measureText: () => new Size(42, 37)
      }
      const obj = new ArrowDrawable('', LineMarker.NONE, LineMarker.NONE, false)
      expect(obj.measureLabel(attr)).to.deep.equal(Size.ZERO)
    })
  })

  describe('#draw()', function () {
    it('renders polyline with defined points and markers', function (done) {
      const expectedPoints = [
        new Point(100, 50),
        new Point(200, 50),
        new Point(200, 150),
        new Point(100, 170)
      ]
      const renderer: Renderer = {
        renderBox: () => expect.fail(),
        renderPolyline: (points, end1, end2, stroke) => {
          expect(points).to.deep.equal(expectedPoints)
          expect(end1).to.equal(LineMarker.ARROW_FULL)
          expect(end2).to.equal(LineMarker.CIRCLE_FULL)
          expect(stroke?.dashed).to.equal(false)
          done()
        },
        renderPath: () => expect.fail(),
        renderText: () => {},
        measureText: () => Size.ZERO
      }
      const obj = new ArrowDrawable('foo', LineMarker.ARROW_FULL, LineMarker.CIRCLE_FULL, false)
      obj.setPoints(expectedPoints)
      obj.draw(renderer)
    })

    it('renders text', function (done) {
      const renderer: Renderer = {
        renderBox: () => expect.fail(),
        renderPolyline: () => {},
        renderPath: () => expect.fail(),
        renderText: (text, position, fontSize) => {
          expect(text).to.equal('hello world')
          expect(position.x).to.equal(150)
          expect(position.y).to.be.lessThan(50)
          expect(fontSize).to.be.greaterThan(0)
          done()
        },
        measureText: () => Size.ZERO
      }
      const obj = new ArrowDrawable('hello world', LineMarker.NONE, LineMarker.NONE, false)
      obj.setPoints([
        new Point(100, 50),
        new Point(200, 50)
      ])
      obj.draw(renderer)
    })

    it('renders dashed if configured', function (done) {
      const renderer: Renderer = {
        renderBox: () => expect.fail(),
        renderPolyline: (points, end1, end2, stroke) => {
          expect(stroke?.dashed).to.equal(true)
          done()
        },
        renderPath: () => expect.fail(),
        renderText: () => {},
        measureText: () => Size.ZERO
      }
      const obj = new ArrowDrawable('foo', LineMarker.NONE, LineMarker.NONE, true)
      obj.setPoints([
        new Point(100, 50),
        new Point(200, 50)
      ])
      obj.draw(renderer)
    })

    it('does not render if no points specified', function () {
      const renderer: Renderer = {
        renderBox: () => expect.fail(),
        renderPolyline: () => expect.fail(),
        renderPath: () => expect.fail(),
        renderText: () => expect.fail(),
        measureText: () => Size.ZERO
      }
      const obj = new ArrowDrawable('foo', LineMarker.ARROW_FULL, LineMarker.CIRCLE_FULL, false)
      obj.draw(renderer)
    })
  })
})
