import { expect } from 'chai'

import { ActorHeadDrawable } from '../../../src/diagram/drawables/actor-head-drawable'
import { Size } from '../../../src/util/geometry/size'
import { RenderAttributes, Renderer } from '../../../src/renderer/renderer'
import { Point } from '../../../src/util/geometry/point'

describe('src/diagram/drawables/actor-head-drawable.ts', function () {
  describe('#measure()', function () {
    it('returns size depending on name text size', function () {
      // This is an extremely imprecise test. I did not have the patience to make this more thorough.
      function check (textSize: Size, minWidth: number, maxWidth: number, minHeight: number): void {
        const attr: RenderAttributes = {
          measureText: (text: string) => {
            expect(text).to.equal(' foo bar ')
            return textSize
          }
        }
        const result = new ActorHeadDrawable(' foo bar ').measure(attr)
        expect(result.width).to.be.within(minWidth, maxWidth)
        expect(result.height).to.be.greaterThan(minHeight)
      }
      check(new Size(5, 5), 5, 100, 10)
      check(new Size(500, 500), 500, 600, 505)
    })
  })

  describe('#draw()', function () {
    it('calls renderPath followed by renderText with name', function (done) {
      let pathCalled = false
      const renderer: Renderer = {
        renderBox: () => expect.fail(),
        renderLine: () => expect.fail(),
        renderPolyline: () => expect.fail(),
        renderPath: () => {
          expect(pathCalled).to.be.false
          pathCalled = true
        },
        renderText: (text: string) => {
          expect(pathCalled).to.be.true
          expect(text).to.equal(' foo bar ')
          done()
        },
        measureText: () => new Size(40, 15)
      }
      const obj = new ActorHeadDrawable(' foo bar ')
      obj.draw(renderer)
    })

    it('renders at correct position', function () {
      const position = new Point(50, 100)

      const renderer: Renderer = {
        renderBox: () => expect.fail(),
        renderLine: () => expect.fail(),
        renderPolyline: () => expect.fail(),
        renderPath: (data, pos) => {
          expect(pos).to.deep.equal(position)
        },
        renderText: (text: string, pos) => {
          expect(pos.y).to.be.greaterThan(position.y)
        },
        measureText: () => Size.ZERO
      }
      const obj = new ActorHeadDrawable('')
      obj.setTopCenter(position)
      obj.draw(renderer)
    })
  })
})
