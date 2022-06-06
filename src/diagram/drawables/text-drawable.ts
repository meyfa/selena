import { Drawable } from './drawable.js'
import { Point } from '../../util/geometry/point.js'
import { RenderAttributes, Renderer } from '../../renderer/renderer.js'
import { Size } from '../../util/geometry/size.js'
import { FONT_SIZE } from '../config.js'

/**
 * Enum specifying horizontal positioning of text relative to a given point.
 * "Left" means the text will extend only to the left of the point (i.e., the text's
 * right edge will be at the point's x coordinate).
 * "Right" means the text will extend only to the right of the point.
 * "Center" means the text will extend to the left and right in equal amounts.
 */
export enum HorizontalTextAlignment {
  LEFT,
  CENTER,
  RIGHT
}

/**
 * Enum specifying vertical positioning of text relative to a given point.
 * "Above" means the text's baseline will be at the point (the text will extend upwards from there).
 * "Below" means the baseline will be shifted downwards so that the text stays just below the point.
 * "Middle" means the baseline will be located right between "above" and "below" positions.
 */
export enum VerticalTextAlignment {
  ABOVE,
  MIDDLE,
  BELOW
}

/**
 * Interface for objects specifying how to align text around the set position.
 *
 * For example, the text could be fully centered around that point,
 * or only centered on the x-axis but with the baseline located at the point's y coordinate, etc.
 */
export interface TextAlignment {
  readonly h: HorizontalTextAlignment
  readonly v: VerticalTextAlignment
}

/**
 * How far the text has to be shifted horizontally in terms of its width, for a given alignment.
 */
const HORIZONTAL_RELATIVE: Readonly<Record<HorizontalTextAlignment, number>> = {
  [HorizontalTextAlignment.LEFT]: -1,
  [HorizontalTextAlignment.CENTER]: -0.5,
  [HorizontalTextAlignment.RIGHT]: 0
}

/**
 * How far the text has to be shifted vertically in terms of its height, for a given alignment.
 */
const VERTICAL_RELATIVE: Readonly<Record<VerticalTextAlignment, number>> = {
  [VerticalTextAlignment.BELOW]: 1,
  [VerticalTextAlignment.MIDDLE]: 0.5,
  [VerticalTextAlignment.ABOVE]: 0
}

/**
 * A drawable for a piece of text.
 * This includes special alignment logic, so using this is preferred over rendering text manually.
 */
export class TextDrawable implements Drawable {
  private readonly text: string
  private readonly fontSize: number
  private position: Point = Point.ORIGIN
  private align: TextAlignment = {
    h: HorizontalTextAlignment.CENTER,
    v: VerticalTextAlignment.MIDDLE
  }

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
    const size = this.measure(renderer)
    const offsetX = HORIZONTAL_RELATIVE[this.align.h] * size.width
    const offsetY = VERTICAL_RELATIVE[this.align.v] * size.height
    const pos = this.position.translate(offsetX, offsetY)
    renderer.renderText(this.text, pos, this.fontSize)
  }
}
