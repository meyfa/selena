import { StickFigureDrawable } from '../../../src/diagram/drawables/stick-figure-drawable'
import { Size } from '../../../src/util/geometry/size'
import { RenderAttributes, Renderer } from '../../../src/renderer/renderer'
import { Point } from '../../../src/util/geometry/point'

import { expect } from 'chai'

describe('src/diagram/drawables/stick-figure-drawable.ts', function () {
  describe('#measure()', function () {
    it('returns non-zero size', function () {
      const attr: RenderAttributes = {
        measureText: () => Size.ZERO
      }
      const result = new StickFigureDrawable().measure(attr)
      expect(result.width).to.be.greaterThan(0)
      expect(result.height).to.be.greaterThan(0)
    })
  })

  describe('#draw()', function () {
    it('calls renderPath and nothing else', function (done) {
      const renderer: Renderer = {
        renderBox: () => expect.fail(),
        renderLine: () => expect.fail(),
        renderPath: (data) => {
          expect(data).to.be.a('string').with.length.greaterThan(0)
          done()
        },
        renderText: () => expect.fail(),
        measureText: () => Size.ZERO
      }
      const obj = new StickFigureDrawable()
      obj.draw(renderer)
    })

    it('renders at correct position set by #setTopCenter()', function () {
      const position = new Point(42.25, 37.75)
      // eslint-disable-next-line prefer-const
      const renderer: Renderer = {
        renderBox: () => expect.fail(),
        renderLine: () => expect.fail(),
        renderPath: (data, pos) => {
          expect(pos).to.deep.equal(position)
        },
        renderText: () => expect.fail(),
        measureText: () => Size.ZERO
      }
      const obj = new StickFigureDrawable()
      obj.setTopCenter(position)
      obj.draw(renderer)
    })
  })
})
