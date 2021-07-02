import { MessageDescription, MessageType } from '../message-description'
import { UnexpectedMessageBlockError, UnexpectedTokenError } from '../../errors'
import { Activation } from '../../../sequence/activation'
import {
  AsyncMessage,
  CreateMessage,
  DestroyMessage,
  Message,
  ReplyMessage,
  SyncMessage
} from '../../../sequence/message'
import { Entity } from '../../../sequence/entity'

/**
 * Regular messages follow a general schema, but they differ in a few aspects.
 * This interface encapsulates those differences and makes each type of message easily constructable.
 */
interface ActivationDefinition {
  allowBlock: boolean
  defaultLabel: string
  constructor: new (from: Entity, to: Entity, label: string) => Message
  includeReply: (active: Entity, target: Entity, returnValue?: string) => boolean
}

// definition for SYNC messages
const syncDefinition: ActivationDefinition = {
  allowBlock: true,
  defaultLabel: '',
  constructor: SyncMessage,
  includeReply (active: Entity, target: Entity, returnValue?: string) {
    // do not include a reply for self-calls unless they have an explicit return value,
    // but do include replies for everything else even without return value
    return target.id !== active.id || returnValue != null
  }
}

// definition for ASYNC messages
const asyncDefinition: ActivationDefinition = {
  allowBlock: true,
  defaultLabel: '',
  constructor: AsyncMessage,
  includeReply (active: Entity, target: Entity, returnValue?: string) {
    // do not include a reply for async unless they have an explicit return value
    return returnValue != null
  }
}

// definition for CREATE messages
const createDefinition: ActivationDefinition = {
  allowBlock: false,
  defaultLabel: '«create»',
  constructor: CreateMessage,
  includeReply: () => false
}

// definition for DESTROY messages
const destroyDefinition: ActivationDefinition = {
  allowBlock: false,
  defaultLabel: '«destroy»',
  constructor: DestroyMessage,
  includeReply: () => false
}

/**
 * Depending on the message type, activations have to be created differently.
 * This function chooses the correct definition for the given type.
 *
 * @param {MessageType} messageType The message type.
 * @returns {object} The definition for that type.
 */
function lookupDefinition (messageType: MessageType): ActivationDefinition {
  // this switch is complete, otherwise TypeScript would complain
  switch (messageType) {
    case MessageType.SYNC:
      return syncDefinition
    case MessageType.ASYNC:
      return asyncDefinition
    case MessageType.CREATE:
      return createDefinition
    case MessageType.DESTROY:
      return destroyDefinition
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

  // find the appropriate definition for the type of message (sync, async, ...)
  // and construct the activation
  const definition = lookupDefinition(type)
  if (!definition.allowBlock && block != null) {
    throw new UnexpectedMessageBlockError(evidence.block)
  }

  const msg = new definition.constructor(active, target, label !== '' ? label : definition.defaultLabel)
  const reply = definition.includeReply(active, target, block?.returnValue)
    ? new ReplyMessage(target, active, block?.returnValue ?? '')
    : undefined
  return new Activation(msg, reply, block?.activations ?? [])
}
