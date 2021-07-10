import { expect } from 'chai'

import { matchFoundMessage } from '../../../../src/parser/message/species/match-found-message'
import { MessageDescription, MessageType } from '../../../../src/parser/message/message-description'
import { Entity, EntityType } from '../../../../src/sequence/entity'
import { ParserError } from '../../../../src/parser/errors'
import { Token, TokenType } from '../../../../src/tokenizer/token'
import { Activation } from '../../../../src/sequence/activation'
import { MessageStyle } from '../../../../src/sequence/message'

describe('src/parser/message/species/match-found-message.ts', function () {
  const evidenceToken = new Token(TokenType.ARROW, 0, '->')
  const target = new Entity(EntityType.COMPONENT, 'target', 'Target')

  it('returns undefined if fromOutside is false', function () {
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
    expect(matchFoundMessage(desc)).to.be.undefined
  })

  it('creates activation if everything is valid', function () {
    const desc: MessageDescription = {
      type: MessageType.SYNC,
      fromOutside: true,
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
    const result = matchFoundMessage(desc)
    expect(result).to.be.an('object')
    const activation = result as Activation
    expect(activation.message).to.include({
      style: MessageStyle.FOUND,
      from: undefined,
      to: target,
      label: 'label'
    })
  })

  it('throws if type is not SYNC', function () {
    const desc: MessageDescription = {
      type: MessageType.ASYNC,
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
    expect(() => matchFoundMessage(desc)).to.throw(ParserError)
  })

  it('throws if target is undefined', function () {
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
    expect(() => matchFoundMessage(desc)).to.throw(ParserError)
  })

  it('throws if a return value is specified', function () {
    const desc: MessageDescription = {
      type: MessageType.SYNC,
      fromOutside: true,
      target: target,
      label: '',
      block: {
        returnValue: 'return',
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
    expect(() => matchFoundMessage(desc)).to.throw(ParserError)
  })
})
