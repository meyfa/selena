import { expect } from 'chai'

import { ActivationBarDrawable } from '../../../src/diagram/drawables/activation-bar-drawable'
import { Size } from '../../../src/util/geometry/size'
import { RenderAttributes, Renderer } from '../../../src/renderer/renderer'

describe('src/diagram/drawables/activation-bar-drawable.ts', function () {
  describe('#measure()', function () {
    it('returns correct size as set', function () {
      const attr: RenderAttributes = {
        measureText: () => Size.ZERO
      }
      const obj = new ActivationBarDrawable(23)
      obj.setLength(234)
      expect(obj.measure(attr)).to.deep.equal(new Size(23, 234))
    })
  })

  describe('#draw()', function () {
    it('renders box at correct position', function (done) {
      const renderer: Renderer = {
        renderBox: (start, size) => {
          // lifelineX - barWidth/2 + (barLevel - 1) * barWidth/2
          expect(start.x).to.equal(400 - 23 / 2 + (4 - 1) * 23 / 2)
          expect(start.y).to.equal(70)
          expect(size).to.deep.equal(new Size(23, 90))
          done()
        },
        renderPolyline: () => expect.fail(),
        renderPath: () => expect.fail(),
        renderText: () => expect.fail(),
        measureText: () => Size.ZERO
      }
      const obj = new ActivationBarDrawable(23)
      obj.setTopOffset(70)
      obj.setLength(90)
      obj.setHorizontalPosition(400, 4)
      obj.draw(renderer)
    })
  })
})
