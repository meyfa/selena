import {
  AsyncMessage, CreateMessage, DestroyMessage,
  FoundMessage,
  LostMessage,
  Message,
  MessageStyle,
  ReplyMessage,
  SyncMessage
} from '../../src/sequence/message'
import { Entity, EntityType } from '../../src/sequence/entity'

import { expect } from 'chai'

function assertMessage (msg: Message, expected: { from: any, to: any, label: any, style: any }): void {
  expect(msg.from).to.equal(expected.from)
  expect(msg.to).to.equal(expected.to)
  expect(msg.label).to.equal(expected.label)
  expect(msg.style).to.equal(expected.style)
}

describe('src/sequence/message.ts', function () {
  const entityA = new Entity(EntityType.COMPONENT, 'a', 'A')
  const entityB = new Entity(EntityType.COMPONENT, 'b', 'B')

  describe('SyncMessage', function () {
    it('constructs correctly', function () {
      assertMessage(new SyncMessage(entityA, entityB, 'foo'), {
        from: entityA,
        to: entityB,
        label: 'foo',
        style: MessageStyle.SYNC
      })
    })
  })

  describe('AsyncMessage', function () {
    it('constructs correctly', function () {
      assertMessage(new AsyncMessage(entityA, entityB, 'foo'), {
        from: entityA,
        to: entityB,
        label: 'foo',
        style: MessageStyle.ASYNC
      })
    })
  })

  describe('ReplyMessage', function () {
    it('constructs correctly', function () {
      assertMessage(new ReplyMessage(entityA, entityB, 'foo'), {
        from: entityA,
        to: entityB,
        label: 'foo',
        style: MessageStyle.REPLY
      })
    })
  })

  describe('LostMessage', function () {
    it('constructs correctly', function () {
      assertMessage(new LostMessage(entityA, 'foo'), {
        from: entityA,
        to: undefined,
        label: 'foo',
        style: MessageStyle.LOST
      })
    })
  })

  describe('FoundMessage', function () {
    it('constructs correctly', function () {
      assertMessage(new FoundMessage(entityA, 'foo'), {
        from: undefined,
        to: entityA,
        label: 'foo',
        style: MessageStyle.FOUND
      })
    })
  })

  describe('CreateMessage', function () {
    it('constructs correctly', function () {
      assertMessage(new CreateMessage(entityA, entityB, 'foo'), {
        from: entityA,
        to: entityB,
        label: 'foo',
        style: MessageStyle.CREATE
      })
    })
  })

  describe('DestroyMessage', function () {
    it('constructs correctly', function () {
      assertMessage(new DestroyMessage(entityA, entityB, 'foo'), {
        from: entityA,
        to: entityB,
        label: 'foo',
        style: MessageStyle.DESTROY
      })
    })
  })
})
