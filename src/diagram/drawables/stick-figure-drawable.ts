import { Drawable } from './drawable.js'
import { Point } from '../../util/geometry/point.js'
import { RenderAttributes, Renderer } from '../../renderer/renderer.js'
import { Size } from '../../util/geometry/size.js'

const STICK_FIGURE_PATH = 'M0,0 a8,8,0,1,0,0,16  M0,0 a8,8,0,1,1,0,16  M0,16 v20  M-15,22 h30  M-10,46 l10,-10 l10,10'

/**
 * A stick figure pictogram as a Drawable.
 */
export class StickFigureDrawable implements Drawable {
  private topCenter: Point = Point.ORIGIN

  /**
   * Sets the position of this pictogram.
   * The position specifies the y-height for the top edge of the pictogram
   * and the x position for the center of the pictogram.
   *
   * @param topCenter The position.
   */
  setTopCenter (topCenter: Point): void {
    this.topCenter = topCenter
  }

  measure (_attr: RenderAttributes): Size {
    return new Size(30, 46)
  }

  draw (renderer: Renderer): void {
    renderer.renderPath(STICK_FIGURE_PATH, this.topCenter, {
      lineWidth: 2
    })
  }
}
