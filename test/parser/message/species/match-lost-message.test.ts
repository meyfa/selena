import { expect } from 'chai'
import { matchLostMessage } from '../../../../src/parser/message/species/match-lost-message.js'
import { MessageDescription, MessageType } from '../../../../src/parser/message/message-description.js'
import { Entity, EntityType } from '../../../../src/sequence/entity.js'
import { ParserError } from '../../../../src/parser/errors.js'
import { Token, TokenType } from '../../../../src/tokenizer/token.js'
import { Activation } from '../../../../src/sequence/activation.js'
import { MessageStyle } from '../../../../src/sequence/message.js'

describe('src/parser/message/species/match-lost-message.ts', function () {
  const evidenceToken = new Token(TokenType.ARROW, 0, '->')
  const target = new Entity(EntityType.COMPONENT, 'target', 'Target')
  const active = new Entity(EntityType.COMPONENT, 'active', 'Active')

  it('returns undefined if fromOutside is true', function () {
    const desc: MessageDescription = {
      type: MessageType.SYNC,
      fromOutside: true,
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
    expect(matchLostMessage(desc, active)).to.be.undefined
  })

  it('returns undefined if target is not undefined', function () {
    const desc: MessageDescription = {
      type: MessageType.SYNC,
      fromOutside: false,
      target,
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
    expect(matchLostMessage(desc, active)).to.be.undefined
  })

  it('creates activation if everything is valid', function () {
    const desc: MessageDescription = {
      type: MessageType.SYNC,
      fromOutside: false,
      target: undefined,
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
    const result = matchLostMessage(desc, active)
    expect(result).to.be.an('object')
    const activation = result as Activation
    expect(activation.message).to.include({
      style: MessageStyle.LOST,
      from: active,
      to: undefined,
      label: 'label'
    })
  })

  it('throws if type is not SYNC', function () {
    const desc: MessageDescription = {
      type: MessageType.ASYNC,
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
    expect(() => matchLostMessage(desc, active)).to.throw(ParserError)
  })

  it('throws if active is undefined', function () {
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
    expect(() => matchLostMessage(desc, undefined)).to.throw(ParserError)
  })

  it('throws if a block is specified', function () {
    const desc: MessageDescription = {
      type: MessageType.SYNC,
      fromOutside: false,
      target: undefined,
      label: '',
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
    expect(() => matchLostMessage(desc, active)).to.throw(ParserError)
  })
})
