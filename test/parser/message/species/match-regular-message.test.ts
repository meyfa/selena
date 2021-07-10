import { expect } from 'chai'

import { matchRegularMessage } from '../../../../src/parser/message/species/match-regular-message'
import { MessageDescription, MessageType } from '../../../../src/parser/message/message-description'
import { Entity, EntityType } from '../../../../src/sequence/entity'
import { ParserError } from '../../../../src/parser/errors'
import { Token, TokenType } from '../../../../src/tokenizer/token'
import { Activation } from '../../../../src/sequence/activation'
import { MessageStyle, SyncMessage } from '../../../../src/sequence/message'

describe('src/parser/message/species/match-regular-message.ts', function () {
  const evidenceToken = new Token(TokenType.ARROW, 0, '->')
  const target = new Entity(EntityType.COMPONENT, 'target', 'Target')
  const active = new Entity(EntityType.COMPONENT, 'active', 'Active')

  it('returns undefined if fromOutside is true', function () {
    const desc: MessageDescription = {
      type: MessageType.SYNC,
      fromOutside: true,
      target: target,
      label: '',
      block: undefined,
      evidence: {
        type: evidenceToken,
        fromOutside: evidenceToken,
        target: evidenceToken,
        label: evidenceToken,
        block: evidenceToken
      }
    }
    expect(matchRegularMessage(desc, active)).to.be.undefined
  })

  it('returns undefined if target is undefined', function () {
    const desc: MessageDescription = {
      type: MessageType.SYNC,
      fromOutside: false,
      target: undefined,
      label: '',
      block: undefined,
      evidence: {
        type: evidenceToken,
        fromOutside: evidenceToken,
        target: evidenceToken,
        label: evidenceToken,
        block: evidenceToken
      }
    }
    expect(matchRegularMessage(desc, active)).to.be.undefined
  })

  it('creates activation if everything is valid (no block)', function () {
    const check = (type: MessageType, expectedStyle: MessageStyle): void => {
      const desc: MessageDescription = {
        type: type,
        fromOutside: false,
        target: target,
        label: 'label',
        block: undefined,
        evidence: {
          type: evidenceToken,
          fromOutside: evidenceToken,
          target: evidenceToken,
          label: evidenceToken,
          block: evidenceToken
        }
      }
      const result = matchRegularMessage(desc, active)
      expect(result).to.be.an('object')
      const activation = result as Activation
      expect(activation.message).to.include({
        style: expectedStyle,
        from: active,
        to: target,
        label: 'label'
      })
    }
    check(MessageType.SYNC, MessageStyle.SYNC)
    check(MessageType.ASYNC, MessageStyle.ASYNC)
    check(MessageType.CREATE, MessageStyle.CREATE)
    check(MessageType.DESTROY, MessageStyle.DESTROY)
  })

  it('includes block for SYNC and ASYNC', function () {
    const check = (type: MessageType, expectedStyle: MessageStyle): void => {
      const child = new Activation(new SyncMessage(target, active, 'child'), undefined, [])
      const desc: MessageDescription = {
        type: type,
        fromOutside: false,
        target: target,
        label: 'label',
        block: {
          returnValue: 'return value',
          activations: [child],
          evidence: {
            returnValue: evidenceToken
          }
        },
        evidence: {
          type: evidenceToken,
          fromOutside: evidenceToken,
          target: evidenceToken,
          label: evidenceToken,
          block: evidenceToken
        }
      }
      const result = matchRegularMessage(desc, active)
      expect(result).to.be.an('object')
      const activation = result as Activation
      expect(activation.message).to.include({
        style: expectedStyle,
        from: active,
        to: target,
        label: 'label'
      })
      expect(activation.reply).to.include({
        style: MessageStyle.REPLY,
        from: target,
        to: active,
        label: 'return value'
      })
      expect(activation.children).to.deep.equal([child])
    }
    check(MessageType.SYNC, MessageStyle.SYNC)
    check(MessageType.ASYNC, MessageStyle.ASYNC)
  })

  it('throws if block exists for CREATE or DESTROY', function () {
    const check = (type: MessageType): void => {
      const desc: MessageDescription = {
        type: type,
        fromOutside: false,
        target: target,
        label: 'label',
        block: {
          returnValue: undefined,
          activations: [],
          evidence: {
            returnValue: evidenceToken
          }
        },
        evidence: {
          type: evidenceToken,
          fromOutside: evidenceToken,
          target: evidenceToken,
          label: evidenceToken,
          block: evidenceToken
        }
      }
      expect(() => matchRegularMessage(desc, active)).to.throw()
    }
    check(MessageType.CREATE)
    check(MessageType.DESTROY)
  })

  it('applies default label for CREATE and DESTROY if none specified', function () {
    const check = (type: MessageType, expectedLabel: string): void => {
      const desc: MessageDescription = {
        type: type,
        fromOutside: false,
        target: target,
        label: '',
        block: undefined,
        evidence: {
          type: evidenceToken,
          fromOutside: evidenceToken,
          target: evidenceToken,
          label: evidenceToken,
          block: evidenceToken
        }
      }
      const result = matchRegularMessage(desc, active)
      expect(result).to.be.an('object')
      const activation = result as Activation
      expect(activation.message.label).to.equal(expectedLabel)
    }
    check(MessageType.CREATE, '«create»')
    check(MessageType.DESTROY, '«destroy»')
  })

  it('throws if active is undefined', function () {
    const evidenceToken = new Token(TokenType.ARROW, 0, '->')
    const desc: MessageDescription = {
      type: MessageType.SYNC,
      fromOutside: false,
      target: target,
      label: '',
      block: undefined,
      evidence: {
        type: evidenceToken,
        fromOutside: evidenceToken,
        target: evidenceToken,
        label: evidenceToken,
        block: evidenceToken
      }
    }
    expect(() => matchRegularMessage(desc, undefined)).to.throw(ParserError)
  })
})
