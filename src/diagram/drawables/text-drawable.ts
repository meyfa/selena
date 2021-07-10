import { Drawable } from './drawable'
import { Point } from '../../util/geometry/point'
import { RenderAttributes, Renderer } from '../../renderer/renderer'
import { Size } from '../../util/geometry/size'
import { FONT_SIZE } from '../config'

/**
 * Enum specifying how to align text around the set position.
 *
 * For example, the text could be fully centered around that point,
 * or only centered on the x-axis but with the baseline located at the point's y coordinate, etc.
 */
export enum TextAlignment {
  CENTER_CENTER,
  CENTER_ABOVE,
  CENTER_BELOW
}

interface Offset {
  x: number
  y: number
}

/**
 * Determine how far the text position should be offset to account for its alignment.
 *
 * @param align The text alignment.
 * @param textSize The size of the text.
 * @returns The computed offset.
 */
function getOffsetForAlignment (align: TextAlignment, textSize: Size): Offset {
  switch (align) {
    case TextAlignment.CENTER_ABOVE:
      return { x: -textSize.width / 2, y: 0 }
    case TextAlignment.CENTER_CENTER:
      return { x: -textSize.width / 2, y: textSize.height / 2 }
    case TextAlignment.CENTER_BELOW:
      return { x: -textSize.width / 2, y: textSize.height }
  }
}

/**
 * A drawable for a piece of text.
 * This includes special alignment logic, so using this is preferred over rendering text manually.
 */
export class TextDrawable implements Drawable {
  private readonly text: string
  private readonly fontSize: number
  private position: Point = Point.ORIGIN
  private align: TextAlignment = TextAlignment.CENTER_CENTER

  constructor (text: string, fontSize: number = FONT_SIZE) {
    this.text = text
    this.fontSize = fontSize
  }

  /**
   * Set the position of this text.
   *
   * The text is positioned relative to the given point, with its offset determined by the given alignment.
   * The alignment might have the text centered around the given point,
   * aligned flush to one of its edges, etc.
   *
   * @param pos The position.
   * @param align The alignment specifier.
   */
  setPosition (pos: Point, align: TextAlignment): void {
    this.position = pos
    this.align = align
  }

  measure (attr: RenderAttributes): Size {
    return attr.measureText(this.text, this.fontSize)
  }

  draw (renderer: Renderer): void {
    const offset = getOffsetForAlignment(this.align, this.measure(renderer))
    const pos = this.position.translate(offset.x, offset.y)
    renderer.renderText(this.text, pos, this.fontSize)
  }
}
