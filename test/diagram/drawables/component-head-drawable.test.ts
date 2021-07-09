import { ComponentHeadDrawable } from '../../../src/diagram/drawables/component-head-drawable'
import { Size } from '../../../src/util/geometry/size'
import { RenderAttributes, Renderer } from '../../../src/renderer/renderer'
import { Point } from '../../../src/util/geometry/point'
import { COMPONENT_HEAD_PADDING_H, COMPONENT_HEAD_PADDING_V } from '../../../src/diagram/config'

import { expect } from 'chai'

describe('src/diagram/drawables/component-head-drawable.ts', function () {
  describe('#measure()', function () {
    it('returns size of name plus padding', function () {
      const textSize = new Size(42.25, 37.75)
      const expectedSize = new Size(42.25 + 2 * COMPONENT_HEAD_PADDING_H, 37.75 + 2 * COMPONENT_HEAD_PADDING_V)
      const attr: RenderAttributes = {
        measureText: (text: string) => {
          expect(text).to.equal(' foo bar ')
          return textSize
        }
      }
      expect(new ComponentHeadDrawable(' foo bar ').measure(attr)).to.deep.equal(expectedSize)
    })
  })

  describe('#draw()', function () {
    it('calls renderBox followed by renderText with name', function (done) {
      let boxCalled = false
      const renderer: Renderer = {
        renderBox: () => {
          expect(boxCalled).to.be.false
          boxCalled = true
        },
        renderLine: () => expect.fail(),
        renderPath: () => expect.fail(),
        renderText: (text: string) => {
          expect(boxCalled).to.be.true
          expect(text).to.equal(' foo bar ')
          done()
        },
        measureText: () => new Size(40, 15)
      }
      const obj = new ComponentHeadDrawable(' foo bar ')
      obj.draw(renderer)
    })

    it('renders at correct position and with correct size', function () {
      const position = new Point(50, 100)

      const textSize = new Size(40, 15)
      const expectedSize = new Size(40 + 2 * COMPONENT_HEAD_PADDING_H, 15 + 2 * COMPONENT_HEAD_PADDING_V)

      const expectedTextPosition = new Point(50 - textSize.width / 2, 100 + COMPONENT_HEAD_PADDING_V + textSize.height)

      const renderer: Renderer = {
        renderBox: (pos, size) => {
          expect(pos.x).to.equal(position.x - expectedSize.width / 2)
          expect(pos.y).to.equal(position.y)
          expect(size).to.deep.equal(expectedSize)
        },
        renderLine: () => expect.fail(),
        renderPath: () => expect.fail(),
        renderText: (text: string, pos: Point) => {
          expect(pos).to.deep.equal(expectedTextPosition)
        },
        measureText: () => textSize
      }
      const obj = new ComponentHeadDrawable('')
      obj.setTopCenter(position)
      obj.draw(renderer)
    })
  })
})
