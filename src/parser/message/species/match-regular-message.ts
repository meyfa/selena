import { MessageBlock, MessageDescription, MessageType } from '../message-description'
import { UnexpectedMessageBlockError, UnexpectedTokenError } from '../../errors'
import { Activation } from '../../../sequence/activation'
import { AsyncMessage, CreateMessage, DestroyMessage, ReplyMessage, SyncMessage } from '../../../sequence/message'
import { Entity } from '../../../sequence/entity'

const DEFAULT_CREATE_MESSAGE = '«create»'
const DEFAULT_DESTROY_MESSAGE = '«destroy»'

interface ActivationConstructor {
  allowBlock: boolean
  construct: (active: Entity, target: Entity, label: string, block?: MessageBlock) => Activation
}

// constructor for SYNC messages
const syncConstructor: ActivationConstructor = {
  allowBlock: true,
  construct (active: Entity, target: Entity, label: string, block?: MessageBlock): Activation {
    const msg = new SyncMessage(active, target, label)
    // do not include a reply for self-calls unless they have an explicit return value
    const reply = target.id !== active.id || block?.returnValue != null
      ? new ReplyMessage(target, active, block?.returnValue ?? '')
      : undefined
    return new Activation(msg, reply, block?.activations ?? [])
  }
}

// constructor for ASYNC messages
const asyncConstructor: ActivationConstructor = {
  allowBlock: true,
  construct (active: Entity, target: Entity, label: string, block?: MessageBlock): Activation {
    const msg = new AsyncMessage(active, target, label)
    // do not include a reply for async unless they have an explicit return value
    const reply = block?.returnValue != null
      ? new ReplyMessage(target, active, block?.returnValue ?? '')
      : undefined
    return new Activation(msg, reply, block?.activations ?? [])
  }
}

// constructor for CREATE messages
const createConstructor: ActivationConstructor = {
  allowBlock: false,
  construct (active: Entity, target: Entity, label: string): Activation {
    const msg = new CreateMessage(active, target, label !== '' ? label : DEFAULT_CREATE_MESSAGE)
    return new Activation(msg, undefined, [])
  }
}

// constructor for DESTROY messages
const destroyConstructor: ActivationConstructor = {
  allowBlock: false,
  construct (active: Entity, target: Entity, label: string): Activation {
    const msg = new DestroyMessage(active, target, label !== '' ? label : DEFAULT_DESTROY_MESSAGE)
    return new Activation(msg, undefined, [])
  }
}

/**
 * Depending on the message type, activations have to be created differently.
 * This function chooses the correct constructor for the given type.
 *
 * @param {MessageType} messageType The message type.
 * @returns {object} The constructor for that type.
 */
function lookupConstructor (messageType: MessageType): ActivationConstructor {
  // this switch is complete, otherwise TypeScript would complain
  switch (messageType) {
    case MessageType.SYNC:
      return syncConstructor
    case MessageType.ASYNC:
      return asyncConstructor
    case MessageType.CREATE:
      return createConstructor
    case MessageType.DESTROY:
      return destroyConstructor
  }
}

/**
 * Try to match a "regular message" (message having two participating entities) from the given description.
 * This will match exactly iff the message does not come from the outside AND it has a target.
 * Errors will be thrown if further constraints are violated.
 * If it does not match (message has no source or no target), undefined will be returned.
 *
 * @param {object} desc The message description to match.
 * @param {Entity} active The entity that is the target of the parent message, if any.
 * @returns {Activation | undefined} The activation created as a result of the match, or undefined.
 */
export function matchRegularMessage (desc: MessageDescription, active: Entity | undefined): Activation | undefined {
  const { type, fromOutside, target, label, block, evidence } = desc
  // message is "regular" iff it has both source and target
  if (fromOutside || target == null) {
    return undefined
  }

  // since the message does not come from the outside, expect a source to be active
  if (active == null) {
    throw new UnexpectedTokenError(evidence.fromOutside)
  }

  // find the appropriate constructor for the type of message (sync, async, ...)
  const constructor = lookupConstructor(type)
  if (!constructor.allowBlock && block != null) {
    throw new UnexpectedMessageBlockError(evidence.block)
  }
  return constructor.construct(active, target, label, block)
}
