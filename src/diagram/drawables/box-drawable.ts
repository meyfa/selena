import { Drawable } from './drawable.js'
import { Size } from '../../util/geometry/size.js'
import { Point } from '../../util/geometry/point.js'
import { RenderAttributes, Renderer } from '../../renderer/renderer.js'

/**
 * A Drawable that draws a rectangular box with a strong outline.
 */
export class BoxDrawable implements Drawable {
  private size: Size = Size.ZERO
  private start: Point = Point.ORIGIN

  constructor (size?: Size, start?: Point) {
    if (size != null) this.size = size
    if (start != null) this.start = start
  }

  /**
   * Set the size of the rectangle.
   * This needs to be called before measurement.
   *
   * @param size The size.
   */
  setSize (size: Size): void {
    this.size = size
  }

  /**
   * Set the position of this rectangle via the top-left corner.
   * The box expands downwards and to the right from this location.
   *
   * @param start The position.
   */
  setTopLeft (start: Point): void {
    this.start = start
  }

  measure (_attr: RenderAttributes): Size {
    return this.size
  }

  draw (renderer: Renderer): void {
    renderer.renderBox(this.start, this.size, {
      lineWidth: 2
    })
  }
}
