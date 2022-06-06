import { Drawable } from './drawable.js'
import { HorizontalTextAlignment, TextAlignment, TextDrawable, VerticalTextAlignment } from './text-drawable.js'
import { Point } from '../../util/geometry/point.js'
import { BoundingBox } from '../../util/geometry/bounding-box.js'
import { LineMarker, RenderAttributes, Renderer } from '../../renderer/renderer.js'
import { Size } from '../../util/geometry/size.js'
import { LINE_WIDTH_ARROWS } from '../config.js'

/**
 * Compute horizontal label position depending on the arrow's bounding box and text alignment.
 *
 * @param bb The bounding box computed for the arrow's polyline.
 * @param hAlign The required horizontal label alignment.
 * @param spacing The amount of spacing to keep between the arrow and the text.
 * @returns The text x coordinate.
 */
function getLabelX (bb: BoundingBox, hAlign: HorizontalTextAlignment, spacing: number): number {
  switch (hAlign) {
    case HorizontalTextAlignment.LEFT:
      return bb.minX - spacing
    case HorizontalTextAlignment.CENTER:
      return bb.centerX()
    case HorizontalTextAlignment.RIGHT:
      return bb.maxX + spacing
  }
}

/**
 * Compute vertical label position depending on the arrow's bounding box and text alignment.
 *
 * @param bb The bounding box computed for the arrow's polyline.
 * @param vAlign The required vertical label alignment.
 * @param spacing The amount of spacing to keep between the arrow and the text.
 * @returns The text y coordinate.
 */
function getLabelY (bb: BoundingBox, vAlign: VerticalTextAlignment, spacing: number): number {
  switch (vAlign) {
    case VerticalTextAlignment.ABOVE:
      return bb.centerY() - spacing
    case VerticalTextAlignment.MIDDLE:
      return bb.centerY()
    case VerticalTextAlignment.BELOW:
      return bb.centerY() + spacing
  }
}

/**
 * Compute the overall label position depending on the arrow's bounding box and text alignment.
 *
 * @param bb The bounding box computed for the arrow's polyline.
 * @param align The text alignment specifier.
 * @returns The text coordinates.
 */
function getLabelPositionForAlignment (bb: BoundingBox, align: TextAlignment): Point {
  const spacing = 6
  const x = getLabelX(bb, align.h, spacing)
  const y = getLabelY(bb, align.v, spacing)
  return new Point(x, y)
}

/**
 * A drawable for labelled arrows, such as those used for sequence messages.
 * The arrow is defined via polyline (array of points). Markers can be customized for each line end.
 * The arrow can also be drawn with a dashed line.
 */
export class ArrowDrawable implements Drawable {
  private readonly labelDrawable: TextDrawable | undefined
  private readonly markerStart: LineMarker
  private readonly markerEnd: LineMarker
  private readonly dashed: boolean

  private points: Point[] = []
  private textAlign: TextAlignment = { h: HorizontalTextAlignment.CENTER, v: VerticalTextAlignment.ABOVE }

  constructor (label: string, markerStart: LineMarker, markerEnd: LineMarker, dashed: boolean) {
    const trimmedLabel = label.trim()

    this.labelDrawable = trimmedLabel.length > 0 ? new TextDrawable(trimmedLabel) : undefined
    this.markerStart = markerStart
    this.markerEnd = markerEnd
    this.dashed = dashed
  }

  /**
   * Set the points array (polyline path) to use for drawing this arrow.
   *
   * @param points The points making up the arrow line.
   */
  setPoints (points: Point[]): void {
    this.points = points
  }

  /**
   * Set the alignment for the arrow label.
   *
   * @param align The text alignment.
   */
  setLabelAlignment (align: TextAlignment): void {
    this.textAlign = align
  }

  private getBoundingBox (): BoundingBox {
    return BoundingBox.containingPoints(this.points)
  }

  /**
   * Compute the label dimensions (ignoring arrow points completely).
   *
   * @param attr The rendering attributes.
   * @returns The measured size of the label.
   */
  measureLabel (attr: RenderAttributes): Size {
    return this.labelDrawable?.measure(attr) ?? Size.ZERO
  }

  measure (_attr: RenderAttributes): Size {
    return this.getBoundingBox().size()
  }

  draw (renderer: Renderer): void {
    if (this.points.length < 2) {
      return
    }

    renderer.renderPolyline(this.points, this.markerStart, this.markerEnd, {
      lineWidth: LINE_WIDTH_ARROWS,
      dashed: this.dashed
    })

    if (this.labelDrawable != null) {
      const labelPos = getLabelPositionForAlignment(this.getBoundingBox(), this.textAlign)
      this.labelDrawable.setPosition(labelPos, this.textAlign)
      this.labelDrawable.draw(renderer)
    }
  }
}
