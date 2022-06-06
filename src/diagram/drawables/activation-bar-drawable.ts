import { Size } from '../../util/geometry/size.js'
import { RenderAttributes, Renderer } from '../../renderer/renderer.js'
import { Drawable } from './drawable.js'
import { BoxDrawable } from './box-drawable.js'
import { Point } from '../../util/geometry/point.js'

/**
 * A Drawable that draws a simple box, but offers easier configuration for purposes of rendering activation bars
 * as compared to a regular box drawable.
 */
export class ActivationBarDrawable implements Drawable {
  private readonly thickness: number
  private topLeft: Point = Point.ORIGIN

  private readonly box: BoxDrawable

  constructor (thickness: number) {
    this.thickness = thickness
    this.box = new BoxDrawable(new Size(this.thickness, 0))
  }

  /**
   * Position the drawable horizontally, based on the lifeline coordinate and an activation level.
   * The level specifies how far to "indent" the activation bar.
   *
   * @param x The lifeline x coordinate.
   * @param level The number of activations of the lifeline at this moment.
   */
  setHorizontalPosition (x: number, level: number): void {
    const boxX = x + (level - 2) * (this.thickness / 2)
    this.topLeft = this.topLeft.withX(boxX)
  }

  /**
   * Set the vertical start coordinate of this drawable.
   *
   * @param y The start coordinate.
   */
  setTopOffset (y: number): void {
    this.topLeft = this.topLeft.withY(y)
  }

  /**
   * Set the (vertical) length of this drawable.
   *
   * @param length The length (y extension from top edge).
   */
  setLength (length: number): void {
    this.box.setSize(new Size(this.thickness, length))
  }

  draw (renderer: Renderer): void {
    this.box.setTopLeft(this.topLeft)
    this.box.draw(renderer)
  }

  measure (attr: RenderAttributes): Size {
    return this.box.measure(attr)
  }
}
