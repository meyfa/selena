import { Message, MessageStyle } from './message.js'

/**
 * Determine whether the given reply is a valid reply to the given original message.
 *
 * @param message The original message.
 * @param reply The assumed reply to that message.
 * @returns Whether the reply makes sense in the context of the given message.
 */
function isReplyValid (message: Message, reply: Message): boolean {
  if (reply.style !== MessageStyle.REPLY) {
    return false
  }
  return reply.from === message.to && reply.to === message.from
}

/**
 * Represents an Activation of an object, based on a message and with an optional reply.
 * Note that not all message types can be replied to in a meaningful way.
 */
export class Activation {
  readonly message: Message
  readonly reply: Message | undefined
  readonly children: Activation[]

  constructor (message: Message, reply: Message | undefined, children: Activation[]) {
    if (reply != null && !isReplyValid(message, reply)) {
      throw new Error('invalid reply message, check message type and from/to')
    }

    this.message = message
    this.reply = reply
    this.children = children
  }
}
