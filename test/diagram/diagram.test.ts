import { expect } from 'chai'

import { Diagram } from '../../src/diagram/diagram'
import { Sequence } from '../../src/sequence/sequence'
import { Renderer } from '../../src/renderer/renderer'
import { Size } from '../../src/util/geometry/size'
import { Entity, EntityType } from '../../src/sequence/entity'
import { Point } from '../../src/util/geometry/point'

describe('src/diagram/diagram.ts', function () {
  describe('#layout()', function () {
    it('enables size and draw methods', function () {
      const diag = Diagram.create(new Sequence([], []))
      const renderer: Renderer = {
        measureText: () => Size.ZERO,
        renderLine: () => {},
        renderBox: () => {},
        renderPath: () => {},
        renderText: () => {}
      }
      diag.layout(renderer)
      expect(() => diag.getComputedSize()).to.not.throw()
      expect(() => diag.draw(renderer)).to.not.throw()
    })
  })

  describe('#getComputedSize()', function () {
    it('throws if layout was not called', function () {
      const diag = Diagram.create(new Sequence([], []))
      expect(() => diag.getComputedSize()).to.throw()
    })
  })

  describe('#draw()', function () {
    it('throws if layout was not called', function () {
      const diag = Diagram.create(new Sequence([], []))
      const renderer: Renderer = {
        measureText: () => Size.ZERO,
        renderLine: () => {},
        renderBox: () => {},
        renderPath: () => {},
        renderText: () => {}
      }
      expect(() => diag.draw(renderer)).to.throw()
    })

    it('draws all entities in order, with distance between them', function (done) {
      const names = ['foo', 'bar', 'baz']
      const entities = names.map((name, i) => new Entity(EntityType.COMPONENT, `e${i}`, name))
      const diag = Diagram.create(new Sequence(entities, []))
      let prevX = 0
      const renderer: Renderer = {
        measureText: () => Size.ZERO,
        renderLine: () => {},
        renderBox: () => {},
        renderPath: () => {},
        renderText: (text: string, position: Point) => {
          expect(text).to.equal(names.shift())
          expect(position.x).to.be.greaterThan(prevX)
          prevX = position.x + 30 // minimum 30 pixels between entities
          if (names.length === 0) done()
        }
      }
      diag.layout(renderer)
      diag.draw(renderer)
    })
  })
})
