/**
 * Options for vertical layouts.
 */
export interface VerticalLayoutOptions {
  messageSpacing: number
}

/**
 * Holds the information relevant to computing vertical entity positions.
 * This includes the height of the entity's head.
 * If the entity is being created by a "create" message, this also includes the message index.
 */
interface VerticalEntityInfo {
  index: number

  headHeight: number
  creator: number | undefined
}

/**
 * Holds the information relevant to computing vertical message positions.
 * This includes the height of the message.
 * If the message is a "create" message, this also includes the id of the entity being created.
 */
interface VerticalMessageInfo {
  index: number

  height: number
  creating: string | undefined
}

/**
 * Result of vertical layout computation.
 * It contains the overall height occupied by everything (starting at y coordinate 0),
 * as well as vertical positions for all messages and vertical offsets for entities.
 */
export interface ComputedVerticalLayout {
  readonly totalHeight: number

  readonly messagePositions: MessagePosition[]
  readonly entityOffsets: ReadonlyMap<string, number>
}

/**
 * Vertical offset of top and bottom edges for a single message item, as computed by a vertical layout.
 */
export interface MessagePosition {
  top: number
  bottom: number
}

/**
 * This class enables computing vertical offsets of messages (and therefore also activation bars).
 * Since messages can "create" entities, this will also compute vertical offsets for the entities being created
 * (so that they are moved downwards to where the creating message is located).
 *
 * It is expected that the caller defines all values for all the entities and messages.
 * As soon as this is done, the layout can be computed.
 */
export class VerticalLayout {
  private readonly entityInfo = new Map<string, VerticalEntityInfo>()
  private readonly messageInfo: VerticalMessageInfo[] = []

  private readonly messageSpacing: number

  constructor (entityIds: string[], messageCount: number, options: VerticalLayoutOptions) {
    for (let i = 0; i < entityIds.length; ++i) {
      this.entityInfo.set(entityIds[i], { index: i, headHeight: 0, creator: undefined })
    }
    for (let i = 0; i < messageCount; ++i) {
      this.messageInfo.push({ index: i, height: 0, creating: undefined })
    }

    this.messageSpacing = options.messageSpacing
  }

  /**
   * Specify the head height of an entity. The head height is the distance between the entity's top edge
   * and the beginning of its lifeline.
   *
   * @param entityId The id of the entity.
   * @param height The height of the entity's head.
   */
  applyHeadHeight (entityId: string, height: number): void {
    const info = this.entityInfo.get(entityId)
    if (info != null) {
      info.headHeight = height
    }
  }

  /**
   * Specify that an entity is created by a particular message.
   * This will result in the entity shifting downwards to where the creator message is located.
   * Behavior will be undefined if this is called multiple times.
   *
   * @param entityId The id of the entity that is being created.
   * @param creatorId The id of the message creating the entity.
   */
  applyCreator (entityId: string, creatorId: number): void {
    const info = this.entityInfo.get(entityId)
    if (info != null) {
      info.creator = creatorId
      this.messageInfo[creatorId].creating = entityId
    }
  }

  /**
   * Specify that the given message occupies the given amount of vertical space.
   *
   * @param messageId The id of the message.
   * @param height The height occupied by the message.
   */
  applyMessageHeight (messageId: number, height: number): void {
    this.messageInfo[messageId].height = height
  }

  private getEntityHeadHeight (id: string | undefined): number {
    const info = id != null ? this.entityInfo.get(id) : undefined
    return info != null ? info.headHeight : 0
  }

  private computeFirstMessageY (): number {
    // determine height of first message based on height of pre-existing entities
    let y = 0
    for (const info of this.entityInfo.values()) {
      if (info.creator == null) {
        y = Math.max(y, info.headHeight)
      }
    }
    return y + this.messageSpacing
  }

  private computeEntityOffsets (messagePositions: MessagePosition[]): Map<string, number> {
    const result = new Map<string, number>()
    for (const [id, info] of this.entityInfo) {
      const y = info.creator != null
        ? messagePositions[info.creator].top - info.headHeight / 2
        : 0
      result.set(id, y)
    }
    return result
  }

  private computeMessagePositions (offsetY: number): MessagePosition[] {
    const result: MessagePosition[] = []

    let y = offsetY
    for (const info of this.messageInfo) {
      const headHeight = this.getEntityHeadHeight(info.creating)
      result.push({
        top: y + headHeight / 2,
        bottom: y + headHeight / 2 + info.height
      })
      y += headHeight + info.height + this.messageSpacing
    }

    return result
  }

  private computeTotalHeight (messagePositions: MessagePosition[], entityOffsets: Map<string, number>): number {
    // total height is at least the bottom edge of the largest entity
    let max = 0
    for (const entityId of this.entityInfo.keys()) {
      max = Math.max(max, (entityOffsets.get(entityId) ?? 0) + this.getEntityHeadHeight(entityId))
    }
    // if messages are present, the final message might be further down than any entity
    // (the case where the last message is a CREATE message is already handled by the loop above)
    if (messagePositions.length > 0) {
      const last = messagePositions[messagePositions.length - 1]
      max = Math.max(max, last.bottom)
    }
    return max
  }

  /**
   * Compute the final vertical offsets for all messages and entities, based on the values previously defined.
   *
   * @returns The layout result.
   */
  compute (): ComputedVerticalLayout {
    const messageY = this.computeFirstMessageY()
    const messagePositions = this.computeMessagePositions(messageY)
    const entityOffsets = this.computeEntityOffsets(messagePositions)

    const totalHeight = Math.max(messageY, this.computeTotalHeight(messagePositions, entityOffsets))

    return { totalHeight, messagePositions, entityOffsets }
  }
}
