import { Drawable } from './drawable.js'
import { HeadDrawable } from './head-drawable.js'
import { Point } from '../../util/geometry/point.js'
import { LineMarker, RenderAttributes, Renderer } from '../../renderer/renderer.js'
import { Size } from '../../util/geometry/size.js'
import { LINE_WIDTH_LIFELINES } from '../config.js'
import { DestructionDrawable } from './destruction-drawable.js'

/**
 * A drawable for a complete entity lifeline, including a configurable head and the line itself.
 */
export class LifelineDrawable implements Drawable {
  private readonly head: HeadDrawable

  private position: Point = Point.ORIGIN
  private endHeight: number = 0
  private endDrawable: DestructionDrawable | undefined

  constructor (head: HeadDrawable) {
    this.head = head
  }

  /**
   * Set the position of this lifeline.
   *
   * The y coordinate determines the height below which the head (and, later, the lifeline line) appear.
   * The x coordinate determines the center location of the lifeline.
   *
   * @param position The position.
   */
  setTopCenter (position: Point): void {
    this.position = position
  }

  /**
   * Set the y coordinate at which the lifeline stops, and the mode of stopping.
   * The coordinate is absolute, independent of the lifeline's anchor position.
   *
   * @param endHeight The absolute height at which the lifeline stops.
   * @param destroy Whether the lifeline ends with a destruction, or simply ends.
   */
  setEnd (endHeight: number, destroy: boolean): void {
    this.endHeight = endHeight
    this.endDrawable = destroy ? new DestructionDrawable() : undefined
  }

  /**
   * Measure just the head portion of this lifeline.
   * This is useful for laying out the lifeline, because #measure() would include the line length.
   *
   * @param attr The rendering attributes.
   * @returns The head size.
   */
  measureHead (attr: RenderAttributes): Size {
    return this.head.measure(attr)
  }

  measure (attr: RenderAttributes): Size {
    const headSize = this.head.measure(attr)

    const width = headSize.width
    const height = Math.max(headSize.height, this.endHeight - this.position.y)

    return new Size(width, height)
  }

  draw (renderer: Renderer): void {
    const headSize = this.head.measure(renderer)

    this.head.setTopCenter(this.position)
    this.head.draw(renderer)

    const lineStart = this.position.translate(0, headSize.height)
    const lineEnd = this.position.withY(this.endHeight)
    renderer.renderPolyline([lineStart, lineEnd], LineMarker.NONE, LineMarker.NONE, {
      lineWidth: LINE_WIDTH_LIFELINES,
      dashed: true
    })

    if (this.endDrawable != null) {
      this.endDrawable.setPosition(lineEnd)
      this.endDrawable.draw(renderer)
    }
  }
}
