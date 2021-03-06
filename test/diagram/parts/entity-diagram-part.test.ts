import { expect } from 'chai'
import { EntityDiagramPart } from '../../../src/diagram/parts/entity-diagram-part.js'
import { Entity, EntityType } from '../../../src/sequence/entity.js'
import { RenderAttributes, Renderer } from '../../../src/renderer/renderer.js'
import { Size } from '../../../src/util/geometry/size.js'
import { Point } from '../../../src/util/geometry/point.js'

describe('src/diagram/parts/entity-diagram-part.ts', function () {
  describe('#measureHead()', function () {
    it('measures differently depending on entity type', function () {
      // this is not very exact, but it's better than nothing
      const componentPart = new EntityDiagramPart(new Entity(EntityType.COMPONENT, 'id', 'name'))
      const actorPart = new EntityDiagramPart(new Entity(EntityType.ACTOR, 'id', 'name'))
      const attr: RenderAttributes = {
        measureText: () => Size.ZERO
      }
      expect(componentPart.measureHead(attr)).to.not.deep.equal(actorPart.measureHead(attr))
    })

    it('measures differently depending on entity name', function () {
      // this is not very exact, but it's better than nothing
      const part1 = new EntityDiagramPart(new Entity(EntityType.COMPONENT, 'id', 'short'))
      const part2 = new EntityDiagramPart(new Entity(EntityType.COMPONENT, 'id', 'very very very long name'))
      const attr: RenderAttributes = {
        measureText: (str, fontSize) => new Size(str.length * fontSize, fontSize)
      }
      expect(part2.measureHead(attr).width).to.be.greaterThan(part1.measureHead(attr).width)
    })
  })

  describe('#draw()', function () {
    it('draws lifeline at correct position', function () {
      const renderer: Renderer = {
        measureText: () => Size.ZERO,
        renderBox: () => {},
        renderPolyline: (points) => {
          expect(points).to.have.lengthOf(2)
          expect(points[0].x).to.equal(150)
          expect(points[0].y).to.be.greaterThan(200).and.lessThan(300)
          expect(points[1].x).to.equal(150)
          expect(points[1].y).to.equal(700)
        },
        renderPath: () => {},
        renderText: () => {}
      }
      const part = new EntityDiagramPart(new Entity(EntityType.COMPONENT, 'id', 'name'))
      part.setTopCenter(new Point(150, 200))
      part.setLifelineEnd(700, false)
      part.draw(renderer)
    })
  })
})
