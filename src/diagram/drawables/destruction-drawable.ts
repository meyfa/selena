import { Drawable } from './drawable'
import { Point } from '../../util/geometry/point'
import { RenderAttributes, Renderer } from '../../renderer/renderer'
import { Size } from '../../util/geometry/size'

const DESTRUCTION_PATH = 'M-13,-13 L13,13 M-13,13 L13,-13'

/**
 * A cross-shaped object destruction pictogram.
 */
export class DestructionDrawable implements Drawable {
  private position: Point = Point.ORIGIN

  /**
   * Sets the position of this pictogram.
   * The position specifies the center point of the cross.
   *
   * @param position The position.
   */
  setPosition (position: Point): void {
    this.position = position
  }

  measure (_attr: RenderAttributes): Size {
    return new Size(26, 26)
  }

  draw (renderer: Renderer): void {
    renderer.renderPath(DESTRUCTION_PATH, this.position, {
      lineWidth: 3
    })
  }
}
