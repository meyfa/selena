import { Renderer } from '../../renderer/renderer.js'
import { ActivationBarDrawable } from '../drawables/activation-bar-drawable.js'
import { ACTIVATION_THICKNESS } from '../config.js'
import { DiagramPart } from './diagram-part.js'

/**
 * A diagram part representing an activation bar.
 *
 * The bar is located on a particular lifeline, at a given level (number of "active activations"; indentation level).
 * Its vertical extent (start and end y coordinates) is defined to be between two messages.
 * The start message id has to be specified during construction, the end message id can be set later.
 * Top and bottom edge positions have to be computed externally, based on this information.
 */
export class ActivationBarDiagramPart implements DiagramPart {
  readonly startMessageId: number
  endMessageId: number | undefined
  readonly entityId: string
  readonly level: number

  private readonly drawable: ActivationBarDrawable

  private top: number = 0
  private bottom: number = 0
  private lifelineX: number = 0

  constructor (startMessageId: number, entityId: string, level: number) {
    this.startMessageId = startMessageId
    this.entityId = entityId
    this.level = level

    this.drawable = new ActivationBarDrawable(ACTIVATION_THICKNESS)
  }

  /**
   * Set the y coordinate of the start message.
   *
   * @param top The y coordinate where the activation bar will be positioned.
   */
  setTop (top: number): void {
    this.top = top
  }

  /**
   * Set the y coordinate of the end message.
   *
   * @param bottom The y coordinate where the activation bar will end.
   */
  setBottom (bottom: number): void {
    this.bottom = bottom
  }

  /**
   * Set the x position of the associated lifeline.
   *
   * @param x The lifeline x coordinate.
   */
  setLifelineX (x: number): void {
    this.lifelineX = x
  }

  draw (renderer: Renderer): void {
    this.drawable.setTopOffset(this.top)
    this.drawable.setHorizontalPosition(this.lifelineX, this.level)
    this.drawable.setLength(this.bottom - this.top)
    this.drawable.draw(renderer)
  }
}
