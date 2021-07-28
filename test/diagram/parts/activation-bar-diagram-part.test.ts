import { expect } from 'chai'

import { ActivationBarDiagramPart } from '../../../src/diagram/parts/activation-bar-diagram-part'
import { Renderer } from '../../../src/renderer/renderer'
import { Size } from '../../../src/util/geometry/size'

describe('src/diagram/parts/activation-bar-diagram-part.ts', function () {
  describe('#draw()', function () {
    it('draws bar at correct position', function (done) {
      const renderer: Renderer = {
        measureText: () => Size.ZERO,
        renderBox: (start, size) => {
          expect(start.x).to.be.approximately(450, 30)
          expect(start.y).to.equal(70)
          expect(size.width).to.be.greaterThan(0).and.lessThan(50)
          expect(size.height).to.equal(90)
          done()
        },
        renderPolyline: () => {},
        renderPath: () => {},
        renderText: () => {}
      }
      const part = new ActivationBarDiagramPart(42, 'foo', 1)
      part.setTop(70)
      part.setBottom(70 + 90)
      part.setLifelineX(450)
      part.draw(renderer)
    })
  })
})
