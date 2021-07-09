import { Drawable } from './drawable'
import { HeadDrawable } from './head-drawable'
import { Point } from '../../util/geometry/point'
import { RenderAttributes, Renderer } from '../../renderer/renderer'
import { Size } from '../../util/geometry/size'
import { LINE_WIDTH_LIFELINES } from '../config'

/**
 * A drawable for a complete entity lifeline, including a configurable head and the line itself.
 */
export class LifelineDrawable implements Drawable {
  private readonly head: HeadDrawable

  private position: Point = Point.ORIGIN
  private endHeight: number = 0

  constructor (head: HeadDrawable) {
    this.head = head
  }

  /**
   * Set the position of this lifeline.
   *
   * The y coordinate determines the height below which the head (and, later, the lifeline line) appear.
   * The x coordinate determines the center location of the lifeline.
   *
   * @param {Point} position The position.
   */
  setTopCenter (position: Point): void {
    this.position = position
  }

  /**
   * Set the y coordinate at which the lifeline stops. This is an absolute coordinate,
   * independent of the lifeline's anchor position.
   *
   * @param {number} endHeight The absolute height at which the lifeline stops.
   */
  setEndHeight (endHeight: number): void {
    this.endHeight = endHeight
  }

  /**
   * Measure just the head portion of this lifeline.
   * This is useful for laying out the lifeline, because #measure() would include the line length.
   *
   * @param {object} attr The rendering attributes.
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
    renderer.renderLine(lineStart, lineEnd, {
      lineWidth: LINE_WIDTH_LIFELINES,
      dashed: true
    })
  }
}
