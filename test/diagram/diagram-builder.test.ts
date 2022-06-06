import { expect } from 'chai'
import { DiagramBuilder } from '../../src/diagram/diagram-builder.js'
import { Entity, EntityType } from '../../src/sequence/entity.js'
import { Activation } from '../../src/sequence/activation.js'
import { AsyncMessage, CreateMessage, LostMessage, ReplyMessage, SyncMessage } from '../../src/sequence/message.js'

describe('src/diagram/diagram-builder.ts', function () {
  const foo = new Entity(EntityType.COMPONENT, 'foo', 'Foo')
  const bar = new Entity(EntityType.COMPONENT, 'bar', 'Bar')

  describe('#addEntity()', function () {
    it('constructs entity parts and adds them in order', function () {
      const builder = new DiagramBuilder()
      builder.addEntity(foo)
      builder.addEntity(bar)

      const { entities } = builder.build()
      expect(entities).to.have.lengthOf(2)
      expect(entities[0].entity).to.equal(foo)
      expect(entities[1].entity).to.equal(bar)
    })
  })

  describe('#appendActivationBar()', function () {
    it('constructs activation bar parts and adds them in order', function () {
      const builder = new DiagramBuilder()
      builder.appendActivationBar(foo, 42, 5)
      builder.appendActivationBar(foo, 51, 2)
      builder.appendActivationBar(bar, 63, 4)

      const { activationBars } = builder.build()
      expect(activationBars).to.have.lengthOf(3)
      expect(activationBars[0]).to.include({
        entityId: foo.id,
        startMessageId: 42,
        level: 5
      })
      expect(activationBars[1]).to.include({
        entityId: foo.id,
        startMessageId: 51,
        level: 2
      })
      expect(activationBars[2]).to.include({
        entityId: bar.id,
        startMessageId: 63,
        level: 4
      })
    })
  })

  describe('#appendMessage()', function () {
    it('constructs message parts and adds them in order', function () {
      const builder = new DiagramBuilder()
      const msg0 = new SyncMessage(foo, bar, '0')
      builder.appendMessage(new Activation(msg0, undefined, []), 2, 2)
      const msg1 = new AsyncMessage(foo, foo, '1')
      builder.appendMessage(new Activation(msg1, undefined, []), 1, 2)
      const msg2 = new CreateMessage(bar, foo, '2')
      builder.appendMessage(new Activation(msg2, undefined, []), 3, 2)

      const { messages } = builder.build()
      expect(messages).to.have.lengthOf(3)
      expect(messages[0]).to.include({
        index: 0,
        message: msg0
      })
      expect(messages[1]).to.include({
        index: 1,
        message: msg1
      })
      expect(messages[2]).to.include({
        index: 2,
        message: msg2
      })
    })
  })

  describe('#appendReply()', function () {
    it('appends reply', function () {
      const builder = new DiagramBuilder()
      const msg0 = new SyncMessage(foo, bar, '0')
      const reply0 = new ReplyMessage(bar, foo, 'r0')
      builder.appendReply(new Activation(msg0, reply0, []), 2, 2, false)

      const { messages } = builder.build()
      expect(messages).to.have.lengthOf(1)
      expect(messages[0]).to.include({
        index: 0,
        message: reply0
      })
    })

    it('does not append if no reply present', function () {
      const builder = new DiagramBuilder()
      const msg0 = new SyncMessage(foo, bar, '0')
      builder.appendReply(new Activation(msg0, undefined, []), 2, 2, false)

      const { messages } = builder.build()
      expect(messages).to.have.lengthOf(0)
    })

    it('does not append if no reply present and target missing (required=true)', function () {
      const builder = new DiagramBuilder()
      const msg0 = new LostMessage(foo, '0')
      builder.appendReply(new Activation(msg0, undefined, []), 2, 2, true)

      const { messages } = builder.build()
      expect(messages).to.have.lengthOf(0)
    })

    it('appends synthetic reply if no reply present but target exists (required=true)', function () {
      const builder = new DiagramBuilder()
      const msg0 = new AsyncMessage(foo, bar, '0')
      builder.appendReply(new Activation(msg0, undefined, []), 2, 2, true)

      const { messages } = builder.build()
      expect(messages).to.have.lengthOf(1)
      expect(messages[0].index).to.equal(0)
      expect(messages[0].message.from).to.equal(bar)
    })
  })
})
