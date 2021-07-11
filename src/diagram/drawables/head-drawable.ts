import { Drawable } from './drawable'
import { Point } from '../../util/geometry/point'

/**
 * An extension to the drawable interface for methods specific to entity heads
 * (the boxes/pictograms and names sitting atop the actual line part of a lifeline).
 */
export interface HeadDrawable extends Drawable {
  /**
   * Set the position of this head.
   *
   * The given point (x, y) determines the height y at which the head starts, expanding downwards,
   * and the horizontal center x (i.e., the x coordinate of the lifeline line).
   *
   * This does not affect measurement but it does affect drawing.
   *
   * @param topCenter The position of this head.
   */
  setTopCenter: (topCenter: Point) => void
}
