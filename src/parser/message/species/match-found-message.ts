import { MessageDescription, MessageType } from '../message-description.js'
import { MissingTargetError, UnsupportedOptionError, UnsupportedReturnError } from '../../errors.js'
import { messageOptions } from '../../strings.js'
import { Activation } from '../../../sequence/activation.js'
import { FoundMessage } from '../../../sequence/message.js'

/**
 * Try to match a "found message" from the given description.
 * This will match exactly iff the message comes from the outside.
 * Errors will be thrown if further constraints are violated.
 * If it does not match (message has no source or has a target), undefined will be returned.
 *
 * @param desc The message description to match.
 * @returns The activation created as a result of the match, or undefined.
 */
export function matchFoundMessage (desc: MessageDescription): Activation | undefined {
  const { type, fromOutside, target, label, block, evidence } = desc
  if (!fromOutside) {
    return undefined
  }

  if (type !== MessageType.SYNC) {
    throw new UnsupportedOptionError(evidence.type, evidence.type.value, [messageOptions.sync])
  }
  if (target == null) {
    throw new MissingTargetError(evidence.target)
  }
  if (block?.returnValue != null) {
    throw new UnsupportedReturnError(block.evidence.returnValue)
  }

  const msg = new FoundMessage(target, label)
  return new Activation(msg, undefined, block?.activations ?? [])
}
