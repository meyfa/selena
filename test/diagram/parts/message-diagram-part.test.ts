import { expect } from 'chai'

import {
  AsyncMessage,
  CreateMessage, DestroyMessage, FoundMessage,
  LostMessage,
  Message,
  ReplyMessage,
  SyncMessage
} from '../../../src/sequence/message'
import { Entity, EntityType } from '../../../src/sequence/entity'
import { MessageDiagramPart } from '../../../src/diagram/parts/message-diagram-part'
import { LineMarker, RenderAttributes, Renderer } from '../../../src/renderer/renderer'
import { Size } from '../../../src/util/geometry/size'

describe('src/diagram/parts/message-diagram-part.ts', function () {
  const foo = new Entity(EntityType.COMPONENT, 'foo', 'Foo')
  const bar = new Entity(EntityType.COMPONENT, 'bar', 'Bar')

  describe('#getCreate()', function () {
    it('returns message target id for create messages', function () {
      const msg = new CreateMessage(foo, bar, '')
      const part = new MessageDiagramPart(0, msg, 1, 0, false)
      expect(part.getCreate()).to.equal(bar.id)
    })

    it('returns undefined for other message styles', function () {
      const msg = new SyncMessage(foo, bar, '')
      const part = new MessageDiagramPart(0, msg, 1, 0, false)
      expect(part.getCreate()).to.be.undefined
    })
  })

  describe('#getHeight()', function () {
    it('returns a non-zero value for self-calls', function () {
      const msg = new SyncMessage(foo, foo, '')
      const part = new MessageDiagramPart(0, msg, 1, 2, false)
      expect(part.getHeight()).to.be.greaterThan(0)
    })

    it('returns 0 for self-calls that are hidden', function () {
      const msg = new SyncMessage(foo, foo, '')
      const part = new MessageDiagramPart(0, msg, 1, 2, true)
      expect(part.getHeight()).to.equal(0)
    })

    it('returns 0 for other types of messages', function () {
      const msg = new SyncMessage(foo, bar, '')
      const part = new MessageDiagramPart(0, msg, 1, 2, false)
      expect(part.getHeight()).to.equal(0)
    })
  })

  describe('#computeMinimumWidth()', function () {
    it('includes constant amount for arrow itself', function () {
      const msg = new SyncMessage(foo, bar, '')
      const part = new MessageDiagramPart(0, msg, 1, 2, false)
      const attr: RenderAttributes = {
        measureText: () => Size.ZERO
      }
      expect(part.computeMinimumWidth(attr)).to.be.greaterThan(0)
    })

    it('includes size of label', function () {
      const msg = new SyncMessage(foo, bar, 'aaa')
      const part = new MessageDiagramPart(0, msg, 1, 2, false)
      const attr: RenderAttributes = {
        measureText: (text) => {
          expect(text).to.equal('aaa')
          return new Size(2000, 30)
        }
      }
      expect(part.computeMinimumWidth(attr)).to.be.greaterThan(2000)
    })

    it('returns 0 for hidden messages', function () {
      const msg = new SyncMessage(foo, bar, '')
      const part = new MessageDiagramPart(0, msg, 1, 2, true)
      const attr: RenderAttributes = {
        measureText: () => new Size(42, 37)
      }
      expect(part.computeMinimumWidth(attr)).to.equal(0)
    })
  })

  describe('#draw()', function () {
    it('does not draw hidden messages', function () {
      const msg = new SyncMessage(foo, bar, 'label')
      const part = new MessageDiagramPart(0, msg, 1, 2, true)
      const renderer: Renderer = {
        renderBox: () => expect.fail(),
        renderPolyline: () => expect.fail(),
        renderPath: () => expect.fail(),
        renderText: () => expect.fail(),
        measureText: () => Size.ZERO
      }
      part.setTop(100)
      part.setSourceLifelineX(500)
      part.setTargetLifelineX(1000)
      part.setTargetHeadWidth(90)
      part.draw(renderer)
    })

    it('draws correct arrows', function () {
      function check (msg: Message, marker1: LineMarker, marker2: LineMarker, dash: boolean): void {
        const part = new MessageDiagramPart(0, msg, 1, 2, false)
        const renderer: Renderer = {
          renderBox: () => expect.fail(),
          renderPolyline: (points, end1, end2, options) => {
            expect(points).to.have.lengthOf(2)
            points.forEach(p => expect(p.y).to.equal(100))
            expect(end1).to.equal(marker1)
            expect(end2).to.equal(marker2)
            expect(options?.dashed).to.equal(dash)
          },
          renderPath: () => expect.fail(),
          renderText: () => {},
          measureText: () => Size.ZERO
        }
        part.setTop(100)
        part.setSourceLifelineX(500)
        part.setTargetLifelineX(1000)
        part.setTargetHeadWidth(90)
        part.draw(renderer)
      }
      check(new SyncMessage(foo, bar, ''), LineMarker.NONE, LineMarker.ARROW_FULL, false)
      check(new AsyncMessage(foo, bar, ''), LineMarker.NONE, LineMarker.ARROW_OPEN, false)
      check(new ReplyMessage(foo, bar, ''), LineMarker.NONE, LineMarker.ARROW_OPEN, true)
      check(new LostMessage(foo, ''), LineMarker.NONE, LineMarker.ARROW_INTO_CIRCLE_FULL, false)
      check(new FoundMessage(foo, ''), LineMarker.CIRCLE_FULL, LineMarker.ARROW_FULL, false)
      check(new CreateMessage(foo, bar, ''), LineMarker.NONE, LineMarker.ARROW_OPEN, true)
      check(new DestroyMessage(foo, bar, ''), LineMarker.NONE, LineMarker.ARROW_OPEN, false)
    })
  })
})
