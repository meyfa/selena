import { DiagramPart } from './diagram-part.js'
import { Message, MessageStyle } from '../../sequence/message.js'
import { LineMarker, RenderAttributes, Renderer } from '../../renderer/renderer.js'
import { ArrowDrawable } from '../drawables/arrow-drawable.js'
import { computeArrowPoints } from './compute-arrow-points.js'
import { HorizontalTextAlignment, TextAlignment, VerticalTextAlignment } from '../drawables/text-drawable.js'
import { ACTIVATION_THICKNESS, MESSAGE_FOUND_WIDTH, MESSAGE_PADDING, MESSAGE_SELF_HEIGHT } from '../config.js'

// text alignment specifiers for different types of messages

const SELFCALL_ALIGN: TextAlignment = {
  h: HorizontalTextAlignment.RIGHT,
  v: VerticalTextAlignment.MIDDLE
}

const DEFAULT_ALIGN: TextAlignment = {
  h: HorizontalTextAlignment.CENTER,
  v: VerticalTextAlignment.ABOVE
}

/**
 * Given a message, determine the text alignment that should be used for its label.
 *
 * @param message The message.
 * @returns The optimal label alignment.
 */
function getLabelAlignment (message: Message): TextAlignment {
  if (message.from?.id === message.to?.id) {
    return SELFCALL_ALIGN
  }
  return DEFAULT_ALIGN
}

/**
 * Given a style of message, determine the marker to be used at the arrow's start point.
 *
 * @param messageStyle The style of message.
 * @returns The marker to be used.
 */
function getStartMarker (messageStyle: MessageStyle): LineMarker {
  switch (messageStyle) {
    case MessageStyle.FOUND:
      return LineMarker.CIRCLE_FULL
    default:
      return LineMarker.NONE
  }
}

/**
 * Given a style of message, determine the marker to be used at the arrow's end point.
 *
 * @param messageStyle The style of message.
 * @returns The marker to be used.
 */
function getEndMarker (messageStyle: MessageStyle): LineMarker {
  switch (messageStyle) {
    case MessageStyle.ASYNC:
    case MessageStyle.REPLY:
    case MessageStyle.CREATE:
    case MessageStyle.DESTROY:
      return LineMarker.ARROW_OPEN
    case MessageStyle.LOST:
      return LineMarker.ARROW_INTO_CIRCLE_FULL
    default:
      return LineMarker.ARROW_FULL
  }
}

/**
 * Given a style of message, determine whether the arrow should be dashed.
 *
 * @param messageStyle The style of message.
 * @returns Whether the arrow should be dashed.
 */
function getIsDashed (messageStyle: MessageStyle): boolean {
  return messageStyle === MessageStyle.REPLY || messageStyle === MessageStyle.CREATE
}

/**
 * Create a drawable that correctly renders the given message.
 *
 * @param message The message.
 * @returns The created drawable.
 */
function createDrawable (message: Message): ArrowDrawable {
  const startMarker = getStartMarker(message.style)
  const endMarker = getEndMarker(message.style)
  const dashed = getIsDashed(message.style)

  const drawable = new ArrowDrawable(message.label, startMarker, endMarker, dashed)
  drawable.setLabelAlignment(getLabelAlignment(message))

  return drawable
}

/**
 * A diagram part representing a message event (i.e., a labelled arrow).
 *
 * The message is based on a sequence message object (high-level message description).
 * For layout purposes, it also stores the "activation level" for its source and target entities.
 * The top offset, as well as source/target lifeline coordinates and target head width, should be specified
 * as soon as they are known.
 *
 * Some messages, notably self-calls, have a height associated with them.
 * This height can be queried.
 *
 * Also, before lifeline coordinates are known, the computeMinimumWidth method can be used to retrieve
 * the minimum amount of horizontal space the message will occupy.
 * This distance should be available between the two lifelines at least.
 */
export class MessageDiagramPart implements DiagramPart {
  readonly index: number
  readonly message: Message
  private readonly fromLevel: number
  private readonly toLevel: number
  private readonly hidden: boolean

  private readonly drawable: ArrowDrawable

  private offsetY = 0
  private fromX = 0
  private toX = 0
  private toHeadWidth = 0

  constructor (index: number, message: Message, fromLevel: number, toLevel: number, hidden: boolean) {
    this.index = index
    this.message = message
    this.fromLevel = fromLevel
    this.toLevel = toLevel
    this.hidden = hidden
    this.drawable = createDrawable(message)
  }

  /**
   * If this message is the creator of an entity, returns the entity id that is being created.
   *
   * @returns The entity that this message creates, or undefined if this is not a create message.
   */
  getCreate (): string | undefined {
    if (this.message.style === MessageStyle.CREATE) {
      return this.message.to?.id
    }
    return undefined
  }

  /**
   * Some messages (notably self-calls) take up non-zero vertical space, which can be queried here.
   *
   * @returns The height taken up by this message.
   */
  getHeight (): number {
    // self-calls have height, everything else does not
    if (this.message.from?.id === this.message.to?.id && !this.hidden) {
      return MESSAGE_SELF_HEIGHT
    }
    return 0
  }

  /**
   * Determine the minimum amount of horizontal space required to fully represent the message.
   * This should be used to space out lifelines accordingly.
   * Note that lifelines can always be further apart than this, this is just a minimum.
   *
   * @param attr The rendering attributes.
   * @returns The required horizontal space.
   */
  computeMinimumWidth (attr: RenderAttributes): number {
    if (this.hidden) return 0

    const naturalMinWidth = this.message.style === MessageStyle.LOST || this.message.style === MessageStyle.FOUND
      ? MESSAGE_FOUND_WIDTH
      : 0

    const barLeft = this.fromLevel * (ACTIVATION_THICKNESS / 2)
    const barRight = this.toLevel * (ACTIVATION_THICKNESS / 2)

    const label = this.drawable.measureLabel(attr).width + barLeft + barRight + 2 * MESSAGE_PADDING

    return Math.max(label, naturalMinWidth)
  }

  /**
   * Set the y coordinate where the message should be located.
   *
   * @param offset The vertical offset.
   */
  setTop (offset: number): void {
    this.offsetY = offset
  }

  /**
   * Set the x coordinate of the message source's lifeline.
   *
   * @param x The lifeline position of the message source.
   */
  setSourceLifelineX (x: number): void {
    this.fromX = x
  }

  /**
   * Set the x coordinate of the message target's lifeline.
   *
   * @param x The lifeline position of the message target.
   */
  setTargetLifelineX (x: number): void {
    this.toX = x
  }

  /**
   * Set the head width of the message target.
   * This is required for correctly positioning "create" messages.
   *
   * @param headWidth The head width of the message target.
   */
  setTargetHeadWidth (headWidth: number): void {
    this.toHeadWidth = headWidth
  }

  draw (renderer: Renderer): void {
    if (this.hidden) return

    const fromBar = this.message.from != null ? { x: this.fromX, level: this.fromLevel } : undefined
    const toBar = this.message.to != null ? { x: this.toX, level: this.toLevel } : undefined
    const headWidth = this.message.style === MessageStyle.DESTROY ? 0 : this.toHeadWidth
    const points = computeArrowPoints(this.offsetY, fromBar, toBar, headWidth)
    this.drawable.setPoints(points)

    this.drawable.draw(renderer)
  }
}
