import { expect } from 'chai'

import { DiagramActivationWalker } from '../../src/diagram/diagram-activation-walker'
import { Entity, EntityType } from '../../src/sequence/entity'
import { Activation } from '../../src/sequence/activation'
import { CreateMessage, DestroyMessage, LostMessage, ReplyMessage, SyncMessage } from '../../src/sequence/message'
import { DiagramBuilder } from '../../src/diagram/diagram-builder'

describe('src/diagram/diagram-activation-walker.ts', function () {
  const foo = new Entity(EntityType.COMPONENT, 'foo', 'Foo')
  const bar = new Entity(EntityType.COMPONENT, 'bar', 'Bar')

  it('appends messages and activation bars (replies present)', function () {
    const msg0 = new SyncMessage(foo, bar, '0')
    const reply0 = new ReplyMessage(bar, foo, 'r0')
    const msg1 = new SyncMessage(bar, foo, '1')
    const reply1 = new ReplyMessage(foo, bar, 'r1')
    const msg2 = new SyncMessage(bar, foo, '2')
    const reply2 = new ReplyMessage(foo, bar, 'r2')

    const builder = new DiagramBuilder()
    const walker = new DiagramActivationWalker(builder)
    walker.walk(new Activation(msg0, reply0, [
      new Activation(msg1, reply1, [])
    ]))
    walker.walk(new Activation(msg2, reply2, []))

    const { messages, activationBars } = builder.build()

    expect(messages).to.have.lengthOf(6)
    expect(messages[0].message).to.equal(msg0)
    expect(messages[1].message).to.equal(msg1)
    expect(messages[2].message).to.equal(reply1)
    expect(messages[3].message).to.equal(reply0)
    expect(messages[4].message).to.equal(msg2)
    expect(messages[5].message).to.equal(reply2)

    expect(activationBars).to.have.lengthOf(3)
    expect(activationBars[0]).to.include({ startMessageId: 0, endMessageId: 3 })
    expect(activationBars[1]).to.include({ startMessageId: 1, endMessageId: 2 })
    expect(activationBars[2]).to.include({ startMessageId: 4, endMessageId: 5 })
  })

  it('does not append activation bars for LOST, CREATE, DESTROY messages', function () {
    const builder = new DiagramBuilder()
    const walker = new DiagramActivationWalker(builder)

    walker.walk(new Activation(new LostMessage(foo, ''), undefined, []))
    walker.walk(new Activation(new CreateMessage(foo, bar, ''), undefined, []))
    walker.walk(new Activation(new DestroyMessage(foo, bar, ''), undefined, []))

    const { activationBars } = builder.build()
    expect(activationBars).to.have.lengthOf(0)
  })

  it('generates synthetic replies if needed', function () {
    const msg0 = new SyncMessage(foo, bar, '0')
    const msg1 = new SyncMessage(bar, foo, '1')

    const builder = new DiagramBuilder()
    const walker = new DiagramActivationWalker(builder)
    walker.walk(new Activation(msg0, undefined, [
      new Activation(msg1, undefined, [])
    ]))

    const { messages, activationBars } = builder.build()

    expect(messages).to.have.lengthOf(4)
    expect(messages[0].message).to.equal(msg0)
    expect(messages[1].message).to.equal(msg1)
    expect(messages[2].message.from).to.equal(foo)
    expect(messages[3].message.from).to.equal(bar)

    expect(activationBars).to.have.lengthOf(2)
    expect(activationBars[0]).to.include({ startMessageId: 0, endMessageId: 3 })
    expect(activationBars[1]).to.include({ startMessageId: 1, endMessageId: 2 })
  })
})
