import { expect } from 'chai'

import {
  HorizontalTextAlignment,
  TextAlignment,
  TextDrawable,
  VerticalTextAlignment
} from '../../../src/diagram/drawables/text-drawable'
import { Size } from '../../../src/util/geometry/size'
import { RenderAttributes, Renderer } from '../../../src/renderer/renderer'
import { Point } from '../../../src/util/geometry/point'

describe('src/diagram/drawables/text-drawable.ts', function () {
  describe('#measure()', function () {
    it('calls measureText with defined string and font size', function (done) {
      const attr: RenderAttributes = {
        measureText: (text: string, fontSize: number) => {
          expect(text).to.equal(' foo bar ')
          expect(fontSize).to.equal(14.5)
          done()
          return Size.ZERO
        }
      }
      const obj = new TextDrawable(' foo bar ', 14.5)
      obj.measure(attr)
    })

    it('returns the measured value', function () {
      const size = new Size(42.25, 37.75)
      const attr: RenderAttributes = {
        measureText: () => size
      }
      expect(new TextDrawable(' foo bar ', 14.5).measure(attr)).to.deep.equal(size)
    })
  })

  describe('#draw()', function () {
    it('calls renderText and nothing else', function (done) {
      const renderer: Renderer = {
        renderBox: () => expect.fail(),
        renderPolyline: () => expect.fail(),
        renderPath: () => expect.fail(),
        renderText: (text: string, position: Point, fontSize: number) => {
          expect(text).to.equal(' foo bar ')
          expect(fontSize).to.equal(14.5)
          done()
        },
        measureText: () => new Size(40, 15)
      }
      const obj = new TextDrawable(' foo bar ', 14.5)
      obj.draw(renderer)
    })

    it('renders at correct position', function () {
      const check = (align: TextAlignment, expected: Point): void => {
        const renderer: Renderer = {
          renderBox: () => expect.fail(),
          renderPolyline: () => expect.fail(),
          renderPath: () => expect.fail(),
          renderText: (text: string, position: Point) => {
            expect(position).to.deep.equal(expected)
          },
          measureText: () => new Size(40, 15)
        }
        const obj = new TextDrawable('', 12)
        obj.setPosition(new Point(50, 100), align)
        obj.draw(renderer)
      }
      check({ h: HorizontalTextAlignment.CENTER, v: VerticalTextAlignment.MIDDLE }, new Point(30, 107.5))
      check({ h: HorizontalTextAlignment.CENTER, v: VerticalTextAlignment.ABOVE }, new Point(30, 100))
      check({ h: HorizontalTextAlignment.CENTER, v: VerticalTextAlignment.BELOW }, new Point(30, 115))
      check({ h: HorizontalTextAlignment.LEFT, v: VerticalTextAlignment.MIDDLE }, new Point(10, 107.5))
      check({ h: HorizontalTextAlignment.LEFT, v: VerticalTextAlignment.ABOVE }, new Point(10, 100))
      check({ h: HorizontalTextAlignment.LEFT, v: VerticalTextAlignment.BELOW }, new Point(10, 115))
      check({ h: HorizontalTextAlignment.RIGHT, v: VerticalTextAlignment.MIDDLE }, new Point(50, 107.5))
      check({ h: HorizontalTextAlignment.RIGHT, v: VerticalTextAlignment.ABOVE }, new Point(50, 100))
      check({ h: HorizontalTextAlignment.RIGHT, v: VerticalTextAlignment.BELOW }, new Point(50, 115))
    })
  })
})
