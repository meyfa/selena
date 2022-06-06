import { EntityDiagramPart } from '../parts/entity-diagram-part.js'
import { RenderAttributes } from '../../renderer/renderer.js'
import { ComputedVerticalLayout, VerticalLayout } from './vertical-layout.js'
import { MessageDiagramPart } from '../parts/message-diagram-part.js'
import { ActivationBarDiagramPart } from '../parts/activation-bar-diagram-part.js'
import { Size } from '../../util/geometry/size.js'
import { TypedConstraintLayout } from './typed-constraint-layout.js'
import { ComputedConstraints, ComputedConstraintsItem, ConstraintLayout } from './constraint-layout.js'
import { Point } from '../../util/geometry/point.js'
import { Message, MessageStyle } from '../../sequence/message.js'

/**
 * Options for a layout manager.
 */
export interface LayoutManagerOptions {
  entityMargin: number
  messageSpacing: number
}

/**
 * A layout manager orchestrates horizontal and vertical layouts.
 * It takes in the collection of entities, activation bars and messages and applies the necessary steps
 * for computing a 2D layout.
 * The resulting offsets are set directly on the input parts, so that after invoking the layout manager,
 * the parts can be drawn.
 * The overall canvas size required for drawing all the parts can be queried on the layout manager instance.
 */
export class LayoutManager {
  private readonly horizontal: ConstraintLayout<string>
  private readonly vertical: VerticalLayout

  private computed: { h: ComputedConstraints<string>, v: ComputedVerticalLayout } | undefined

  /**
   * Prepare a layout manager for the given collection of entity ids and a particular number of messages.
   * The specific instances of entities and messages are not required yet.
   *
   * @param entityIds The ids of the entities that will be laid out.
   * @param messageCount The number of messages participating in the layout.
   * @param options Options for this layout manager.
   */
  constructor (entityIds: string[], messageCount: number, options: LayoutManagerOptions) {
    this.horizontal = new TypedConstraintLayout<string>(entityIds, {
      itemMargin: options.entityMargin
    })
    this.vertical = new VerticalLayout(entityIds, messageCount, {
      messageSpacing: options.messageSpacing
    })
  }

  /**
   * Compute the 2D layout and apply it to the given diagram parts.
   * After this completes, the given parts are ready to be drawn and the required canvas size can also be queried.
   *
   * @param attr The render attributes.
   * @param entities The participating entities.
   * @param messages The participating messages.
   * @param activations The participating activation bars.
   */
  layout (attr: RenderAttributes, entities: EntityDiagramPart[], messages: MessageDiagramPart[], activations: ActivationBarDiagramPart[]): void {
    // first specify all layout parameters, then compute the layouts, then apply the result to the parts

    this.layoutEntities(attr, entities)
    this.layoutMessages(attr, messages)

    this.computed = {
      h: this.horizontal.compute(),
      v: this.vertical.compute()
    }

    this.applyToEntities(entities, messages)
    this.applyToMessages(messages)
    this.applyToActivations(activations)
  }

  private requireComputed (): { h: ComputedConstraints<string>, v: ComputedVerticalLayout } {
    if (this.computed == null) {
      throw new Error('layout not yet computed')
    }
    return this.computed
  }

  /**
   * After a layout has been computed, this can be used to obtain the overall dimensions of all the
   * diagram parts (i.e., the canvas size required to fit everything).
   *
   * @returns The diagram size.
   */
  getComputedSize (): Size {
    const { h, v } = this.requireComputed()
    return new Size(h.totalDimensions, v.totalHeight)
  }

  /**
   * Determine whether the layout has been computed (and parts can be drawn, and the total size can be queried).
   *
   * @returns Whether the layout has been computed.
   */
  isComputed (): boolean {
    return this.computed != null
  }

  private layoutEntities (attr: RenderAttributes, entities: EntityDiagramPart[]): void {
    for (const entity of entities) {
      const head = entity.measureHead(attr)
      this.horizontal.applyDimension(entity.entity.id, head.width)
      this.vertical.applyHeadHeight(entity.entity.id, head.height)
    }
  }

  private layoutMessages (attr: RenderAttributes, messages: MessageDiagramPart[]): void {
    for (const message of messages) {
      this.vertical.applyMessageHeight(message.index, message.getHeight())
      const create = message.getCreate()
      if (create != null) {
        this.vertical.applyCreator(create, message.index)
      }
      this.applySpacingFromMessage(message.message, message.computeMinimumWidth(attr))
    }
  }

  private applySpacingFromMessage (msg: Message, minWidth: number): void {
    if (msg.from != null && msg.to != null) {
      this.horizontal.applyBetween(msg.from.id, msg.to.id, minWidth)
    } else if (msg.to != null) {
      this.horizontal.applyBefore(msg.to.id, minWidth)
    } else if (msg.from != null) {
      this.horizontal.applyBefore(msg.from.id, minWidth)
    }
  }

  private applyToEntities (entities: EntityDiagramPart[], messages: MessageDiagramPart[]): void {
    const { h, v } = this.requireComputed()

    for (const e of entities) {
      const posH = h.items.get(e.entity.id) as ComputedConstraintsItem
      const posV = v.entityOffsets.get(e.entity.id) ?? 0
      const destroyedAt = this.findDestroyHeight(messages, e.entity.id)
      e.setTopCenter(new Point(posH.center, posV))
      e.setLifelineEnd(destroyedAt ?? v.totalHeight, destroyedAt != null)
    }
  }

  private findDestroyHeight (messages: MessageDiagramPart[], entityId: string): number | undefined {
    const { v } = this.requireComputed()
    for (const msg of messages) {
      if (msg.message.style === MessageStyle.DESTROY && msg.message.to?.id === entityId) {
        return v.messagePositions[msg.index].bottom
      }
    }
    return undefined
  }

  private applyToMessages (messages: MessageDiagramPart[]): void {
    const { h, v } = this.requireComputed()

    for (const m of messages) {
      m.setTop(v.messagePositions[m.index].top)
      if (m.message.from != null) {
        const pos = h.items.get(m.message.from.id) as ComputedConstraintsItem
        m.setSourceLifelineX(pos.center)
      }
      if (m.message.to != null) {
        const pos = h.items.get(m.message.to.id) as ComputedConstraintsItem
        m.setTargetLifelineX(pos.center)
        m.setTargetHeadWidth(pos.dimension)
      }
    }
  }

  private applyToActivations (activations: ActivationBarDiagramPart[]): void {
    const { h, v } = this.requireComputed()

    for (const a of activations) {
      const pos = h.items.get(a.entityId) as ComputedConstraintsItem
      a.setLifelineX(pos.center)
      a.setTop(v.messagePositions[a.startMessageId].bottom)
      if (a.endMessageId != null) {
        a.setBottom(v.messagePositions[a.endMessageId].top)
      }
    }
  }
}
