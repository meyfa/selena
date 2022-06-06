import { expect } from 'chai'
import { Diagram } from '../../src/diagram/diagram.js'
import { Sequence } from '../../src/sequence/sequence.js'
import { Renderer } from '../../src/renderer/renderer.js'
import { Size } from '../../src/util/geometry/size.js'
import { Entity, EntityType } from '../../src/sequence/entity.js'
import { Point } from '../../src/util/geometry/point.js'
import { Activation } from '../../src/sequence/activation.js'
import { AsyncMessage, LostMessage, SyncMessage } from '../../src/sequence/message.js'

describe('src/diagram/diagram.ts', function () {
  describe('#layout()', function () {
    it('enables size and draw methods', function () {
      const diag = Diagram.create(new Sequence([], []))
      const renderer: Renderer = {
        measureText: () => Size.ZERO,
        renderPolyline: () => {},
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
        renderPolyline: () => {},
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
        renderPolyline: () => {},
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

    it('draws messages and activation bars', function () {
      const foo = new Entity(EntityType.ACTOR, 'foo', 'Foo')
      const bar = new Entity(EntityType.ACTOR, 'bar', 'Bar')
      const diag = Diagram.create(new Sequence([foo, bar], [
        new Activation(new SyncMessage(foo, bar, '0'), undefined, [
          new Activation(new AsyncMessage(bar, foo, '1'), undefined, [])
        ]),
        new Activation(new LostMessage(foo, '2'), undefined, [])
      ]))
      let lineCount = 0
      let barCount = 0
      const renderer: Renderer = {
        measureText: () => Size.ZERO,
        renderPolyline: () => {
          ++lineCount
        },
        renderBox: () => {
          ++barCount
        },
        renderPath: () => {},
        renderText: () => {}
      }
      diag.layout(renderer)
      diag.draw(renderer)
      expect(lineCount).to.equal(3 + 2) // arrows + lifelines
      expect(barCount).to.equal(2)
    })
  })
})
