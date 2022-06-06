import { MessageDescription, MessageType } from '../message-description.js'
import { UnexpectedMessageBlockError, UnexpectedTokenError, UnsupportedOptionError } from '../../errors.js'
import { Activation } from '../../../sequence/activation.js'
import { LostMessage } from '../../../sequence/message.js'
import { Entity } from '../../../sequence/entity.js'
import { messageOptions } from '../../strings.js'

/**
 * Try to match a "lost message" from the given description.
 * This will match exactly iff the message does not come from the outside AND it does not have a target.
 * Errors will be thrown if further constraints are violated.
 * If it does not match (message has no source or has a target), undefined will be returned.
 *
 * @param desc The message description to match.
 * @param active The entity that is the target of the parent message, if any.
 * @returns The activation created as a result of the match, or undefined.
 */
export function matchLostMessage (desc: MessageDescription, active: Entity | undefined): Activation | undefined {
  const { type, fromOutside, target, label, block, evidence } = desc
  if (fromOutside || target != null) {
    return undefined
  }

  if (type !== MessageType.SYNC) {
    throw new UnsupportedOptionError(evidence.type, evidence.type.value, [messageOptions.sync])
  }
  if (active == null) {
    throw new UnexpectedTokenError(evidence.fromOutside)
  }
  if (block != null) {
    throw new UnexpectedMessageBlockError(evidence.block)
  }

  const msg = new LostMessage(active, label)
  return new Activation(msg, undefined, [])
}
