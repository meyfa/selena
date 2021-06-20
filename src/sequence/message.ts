import { Entity } from './entity'

/**
 * The message style, used for defining which kind of arrow to use.
 */
export enum MessageStyle {
  SYNC,
  ASYNC,
  REPLY,
  LOST,
  FOUND,
  CREATE,
  DESTROY
}

/**
 * A message, usually from one object to another, but may also have just the sender or just the recipient.
 * This can happen for lost/found messages.
 *
 * Messages cannot be constructed directly to aid with parameter validation.
 * Use one of the available subclasses to create a message of the intended type.
 */
export abstract class Message {
  readonly from: Entity | undefined
  readonly to: Entity | undefined
  readonly label: string
  readonly style: MessageStyle

  protected constructor (from: Entity | undefined, to: Entity | undefined, label: string, style: MessageStyle) {
    this.from = from
    this.to = to
    this.label = label
    this.style = style
  }
}

/**
 * A synchronous message.
 */
export class SyncMessage extends Message {
  constructor (from: Entity, to: Entity, label: string) {
    super(from, to, label, MessageStyle.SYNC)
  }
}

/**
 * An asynchronous message.
 */
export class AsyncMessage extends Message {
  constructor (from: Entity, to: Entity, label: string) {
    super(from, to, label, MessageStyle.ASYNC)
  }
}

/**
 * A reply message.
 */
export class ReplyMessage extends Message {
  constructor (from: Entity, to: Entity, label: string) {
    super(from, to, label, MessageStyle.REPLY)
  }
}

/**
 * A lost message (no recipient, just sender).
 */
export class LostMessage extends Message {
  constructor (from: Entity, label: string) {
    super(from, undefined, label, MessageStyle.LOST)
  }
}

/**
 * A found message (no sender, just recipient).
 */
export class FoundMessage extends Message {
  constructor (to: Entity, label: string) {
    super(undefined, to, label, MessageStyle.FOUND)
  }
}

/**
 * A "create" message.
 */
export class CreateMessage extends Message {
  constructor (from: Entity, to: Entity, label: string) {
    super(from, to, label, MessageStyle.CREATE)
  }
}

/**
 * A "destroy" message.
 */
export class DestroyMessage extends Message {
  constructor (from: Entity, to: Entity, label: string) {
    super(from, to, label, MessageStyle.DESTROY)
  }
}
