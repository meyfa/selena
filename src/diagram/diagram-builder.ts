import { EntityDiagramPart } from './parts/entity-diagram-part.js'
import { MessageDiagramPart } from './parts/message-diagram-part.js'
import { ActivationBarDiagramPart } from './parts/activation-bar-diagram-part.js'
import { Entity } from '../sequence/entity.js'
import { LostMessage, Message } from '../sequence/message.js'
import { Activation } from '../sequence/activation.js'

/**
 * All of the elements that make up a diagram are contained in objects of this type.
 */
export interface DiagramParts {
  entities: EntityDiagramPart[]
  messages: MessageDiagramPart[]
  activationBars: ActivationBarDiagramPart[]
}

/**
 * Since diagrams are immutable, this builder exists so they can be created in the first place.
 * Entity, message, reply, and activation-bar elements can be added.
 */
export class DiagramBuilder {
  private readonly parts: DiagramParts

  constructor () {
    this.parts = {
      entities: [],
      messages: [],
      activationBars: []
    }
  }

  /**
   * Create a diagram part for an entity and add it.
   *
   * @param entity The entity.
   */
  addEntity (entity: Entity): void {
    this.parts.entities.push(new EntityDiagramPart(entity))
  }

  private doAppendMessage (message: Message, fromLevel: number, toLevel: number, hidden: boolean): MessageDiagramPart {
    const index = this.parts.messages.length
    const msg = new MessageDiagramPart(index, message, fromLevel, toLevel, hidden)
    this.parts.messages.push(msg)
    return msg
  }

  /**
   * Create a diagram part for the message belonging to the given activation, and add it.
   *
   * @param activation The activation.
   * @param fromLevel The number of activations the message source had when sending the message.
   * @param toLevel The number of activations the message target now has due to the message.
   * @returns The created diagram part.
   */
  appendMessage (activation: Activation, fromLevel: number, toLevel: number): MessageDiagramPart {
    return this.doAppendMessage(activation.message, fromLevel, toLevel, false)
  }

  /**
   * Create a diagram part for the reply belonging to the given activation, and add it.
   * If no reply exists, no such element will be created, unless the "required" attribute is true.
   * In that case (provided that a message target exists) a synthetic (hidden) reply will be generated.
   * This can be used to properly space out the activation bar.
   *
   * @param activation The activation.
   * @param fromLevel The number of activations the message source had when sending the message.
   * @param toLevel The number of activations the message target now has due to the original message.
   * @param required Whether to create a synthetic reply even if no real reply exists.
   * @returns The created diagram part, if any.
   */
  appendReply (activation: Activation, fromLevel: number, toLevel: number, required: boolean): MessageDiagramPart | undefined {
    // if a reply exists, use it
    if (activation.reply != null) {
      return this.doAppendMessage(activation.reply, toLevel, fromLevel, false)
    }
    // if no reply exists but the message is part of an activation,
    // add a synthetic reply so that the activation bar can be spaced out properly
    if (activation.message.to != null && required) {
      const syntheticReply = new LostMessage(activation.message.to, '')
      return this.doAppendMessage(syntheticReply, toLevel, fromLevel, true)
    }
  }

  /**
   * Create a diagram part representing an activation bar located on the given entity.
   * The index of the causing message is required for laying out the bar,
   * as well as the level, which indicates how much to shift the bar to the side.
   *
   * @param entity The entity that is activated.
   * @param startMessageIndex The index of the message initiating the activation.
   * @param level The level of activations the bar represents (1 for each child activation on that entity).
   * @returns The created diagram part.
   */
  appendActivationBar (entity: Entity, startMessageIndex: number, level: number): ActivationBarDiagramPart {
    const activation = new ActivationBarDiagramPart(startMessageIndex, entity.id, level)
    this.parts.activationBars.push(activation)
    return activation
  }

  /**
   * Returns all the diagram parts that were created/appended previously.
   *
   * @returns The diagram parts.
   */
  build (): Readonly<DiagramParts> {
    return Object.freeze(this.parts)
  }
}
