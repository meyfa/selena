import { Message, MessageStyle } from './message'

/**
 * Represents an Activation of an object, based on a message and with an optional reply.
 * Note that not all message types can be replied to in a meaningful way.
 */
export class Activation {
  readonly message: Message
  readonly reply: Message | undefined
  readonly children: Activation[]

  constructor (message: Message, reply: Message | undefined, children: Activation[]) {
    if (reply != null) {
      if (reply.style !== MessageStyle.REPLY) {
        throw new Error('reply message does not have reply style')
      }
      if (reply.from !== message.to || reply.to !== message.from) {
        throw new Error('invalid source or target of reply, does not match message')
      }
    }

    this.message = message
    this.reply = reply
    this.children = children
  }
}
