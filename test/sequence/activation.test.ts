import { ReplyMessage, SyncMessage } from '../../src/sequence/message'
import { Entity, EntityType } from '../../src/sequence/entity'
import { Activation } from '../../src/sequence/activation'

import { expect } from 'chai'

describe('src/sequence/activation.ts', function () {
  it('has a working constructor', function () {
    const from = new Entity(EntityType.COMPONENT, 'a', 'A')
    const to = new Entity(EntityType.COMPONENT, 'b', 'B')

    const msg = new SyncMessage(from, to, '')
    const reply = new ReplyMessage(to, from, '')

    const activation = new Activation(msg, reply, [])
    expect(activation.message).to.equal(msg)
    expect(activation.reply).to.equal(reply)
    expect(activation.children).to.deep.equal([])
  })

  it('disallows replies of incorrect type', function () {
    const from = new Entity(EntityType.COMPONENT, 'a', 'A')
    const to = new Entity(EntityType.COMPONENT, 'b', 'B')

    const msg = new SyncMessage(from, to, '')
    const reply = new SyncMessage(to, from, '')

    expect(() => new Activation(msg, reply, [])).to.throw()
  })

  it('disallows replies whose from/to do not match the message\'s from/to inverted', function () {
    const from = new Entity(EntityType.COMPONENT, 'a', 'A')
    const to = new Entity(EntityType.COMPONENT, 'b', 'B')

    const msg = new SyncMessage(from, to, '')
    const reply = new SyncMessage(from, to, '')

    expect(() => new Activation(msg, reply, [])).to.throw()
  })
})
