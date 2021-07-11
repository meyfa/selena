import { expect } from 'chai'

import { BoxDrawable } from '../../../src/diagram/drawables/box-drawable'
import { Size } from '../../../src/util/geometry/size'
import { RenderAttributes, Renderer } from '../../../src/renderer/renderer'
import { Point } from '../../../src/util/geometry/point'

describe('src/diagram/drawables/box-drawable.ts', function () {
  describe('#measure()', function () {
    it('returns size set in constructor', function () {
      const attr: RenderAttributes = {
        measureText: () => Size.ZERO
      }
      expect(new BoxDrawable().measure(attr)).to.include({
        width: 0,
        height: 0
      })
      const size = new Size(42.25, 37.75)
      expect(new BoxDrawable(size).measure(attr)).to.deep.equal(size)
    })

    it('allows overriding size via #setSize()', function () {
      const attr: RenderAttributes = {
        measureText: () => Size.ZERO
      }
      const size = new Size(42.25, 37.75)
      const obj = new BoxDrawable()
      obj.setSize(size)
      expect(obj.measure(attr)).to.deep.equal(size)
    })
  })

  describe('#draw()', function () {
    it('calls renderBox and nothing else', function (done) {
      const renderer: Renderer = {
        renderBox: () => done(),
        renderLine: () => expect.fail(),
        renderPath: () => expect.fail(),
        renderText: () => expect.fail(),
        measureText: () => Size.ZERO
      }
      const obj = new BoxDrawable()
      obj.draw(renderer)
    })

    it('renders at correct position', function () {
      const check = (position: Point): void => {
        const renderer: Renderer = {
          renderBox: (start) => {
            expect(start).to.deep.equal(position)
          },
          renderLine: () => expect.fail(),
          renderPath: () => expect.fail(),
          renderText: () => expect.fail(),
          measureText: () => Size.ZERO
        }
        const obj = new BoxDrawable()
        obj.setTopLeft(position)
        obj.draw(renderer)
      }
      check(new Point(0, 0))
      check(new Point(-10, 15))
      check(new Point(42.25, 37.75))
    })
  })
})
