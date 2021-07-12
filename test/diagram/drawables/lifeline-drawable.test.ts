import { expect } from 'chai'

import { LifelineDrawable } from '../../../src/diagram/drawables/lifeline-drawable'
import { Size } from '../../../src/util/geometry/size'
import { RenderAttributes, Renderer } from '../../../src/renderer/renderer'
import { Point } from '../../../src/util/geometry/point'
import { HeadDrawable } from '../../../src/diagram/drawables/head-drawable'

describe('src/diagram/drawables/lifeline-drawable.ts', function () {
  describe('#measure()', function () {
    it('returns combined size of head and lifeline length', function () {
      const head: HeadDrawable = {
        setTopCenter: () => expect.fail(),
        measure: () => new Size(40, 15),
        draw: () => expect.fail()
      }
      const obj = new LifelineDrawable(head)
      obj.setTopCenter(new Point(25, 75))
      obj.setEndHeight(175)
      const attr: RenderAttributes = {
        measureText: () => Size.ZERO
      }
      expect(obj.measure(attr)).to.deep.equal(new Size(40, 100))
    })
  })

  describe('#draw()', function () {
    it('renders the head followed by lifeline line', function (done) {
      let headCalled = false
      const head: HeadDrawable = {
        setTopCenter: () => {},
        measure: () => new Size(40, 15),
        draw: () => {
          expect(headCalled).to.be.false
          headCalled = true
        }
      }
      const renderer: Renderer = {
        renderBox: () => expect.fail(),
        renderLine: () => {
          expect(headCalled).to.be.true
          done()
        },
        renderPolyline: () => expect.fail(),
        renderPath: () => expect.fail(),
        renderText: () => expect.fail(),
        measureText: () => Size.ZERO
      }
      const obj = new LifelineDrawable(head)
      obj.draw(renderer)
    })

    it('renders at correct position', function () {
      let topCenterCalled = false

      const head: HeadDrawable = {
        setTopCenter: (topCenter) => {
          expect(topCenter).to.deep.equal(new Point(50, 100))
          topCenterCalled = true
        },
        measure: () => new Size(40, 15),
        draw: () => {
          expect(topCenterCalled).to.be.true
        }
      }
      const renderer: Renderer = {
        renderBox: () => expect.fail(),
        renderLine: (pos1, pos2) => {
          expect(pos1).to.deep.equal(new Point(50, 115))
          expect(pos2).to.deep.equal(new Point(50, 185))
        },
        renderPolyline: () => expect.fail(),
        renderPath: () => expect.fail(),
        renderText: () => expect.fail(),
        measureText: () => Size.ZERO
      }
      const obj = new LifelineDrawable(head)
      obj.setTopCenter(new Point(50, 100))
      obj.setEndHeight(185)
      obj.draw(renderer)
    })
  })

  describe('#measureHead()', function () {
    it('returns size of head', function () {
      const attr: RenderAttributes = {
        measureText: () => Size.ZERO
      }
      const size = new Size(40, 15)
      const head: HeadDrawable = {
        setTopCenter: () => expect.fail(),
        measure: (a) => {
          expect(a).to.equal(attr)
          return size
        },
        draw: () => expect.fail()
      }
      expect(new LifelineDrawable(head).measureHead(attr)).to.deep.equal(size)
    })
  })
})
