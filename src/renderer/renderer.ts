import { Size } from '../util/geometry/size'
import { Point } from '../util/geometry/point'

/**
 * This interface defines how stroke should be applied to a shape when rendering.
 */
export interface StrokeOptions {
  lineWidth?: number
  dashed?: boolean
}

/**
 * This interface can be used to perform measurements related to rendering.
 * This is useful, for example, when laying out elements soon to be drawn.
 */
export interface RenderAttributes {
  /**
   * Measure the size of a piece of text, if it were to be rendered using this configuration.
   *
   * @param {string} str The text to be measured.
   * @param {number} fontSize The font size (in pixels) to use.
   * @returns {Size} The measured size.
   */
  measureText: (str: string, fontSize: number) => Size
}

/**
 * The renderer interface enables drawing shapes to an abstract canvas.
 */
export interface Renderer extends RenderAttributes {
  /**
   * Render a rectangular box, starting at the given coordinates and extending for a given size.
   *
   * @param {Point} start The upper-left corner location.
   * @param {Size} size The box size.
   * @param {?object} options Options for stroking the box. If not provided, sensible defaults will be used.
   * @returns {void}
   */
  renderBox: (start: Point, size: Size, options?: StrokeOptions) => void

  /**
   * Render a simple line from one point to another.
   *
   * @param {Point} start The first point.
   * @param {Point} end The second point.
   * @param {?object} options Options for stroking the line. If not provided, sensible defaults will be used.
   * @returns {void}
   */
  renderLine: (start: Point, end: Point, options?: StrokeOptions) => void

  /**
   * Render a path (SVG path data format).
   * The path coordinates are shifted by the given offset (offset added to path coordinates).
   *
   * @param {string} data The path data.
   * @param {Point} offset The location of the origin of this path.
   * @param {?object} options Options for stroking the path. If not provided, sensible defaults will be used.
   * @returns {void}
   */
  renderPath: (data: string, offset: Point, options?: StrokeOptions) => void

  /**
   * Render a text at the given position.
   *
   * @param {string} text The text to render.
   * @param {Point} offset The starting coordinate (beginning of line, baseline height).
   * @param {number} fontSize The font size (in pixels) to use for rendering.
   * @returns {void}
   */
  renderText: (text: string, position: Point, fontSize: number) => void
}

/**
 * A "direct renderer" is a renderer that draws directly to some target object,
 * and when finished, provides the rendering result to the caller.
 *
 * The renderer needs to be prepared (call prepare()) before any rendering calls can be made.
 * At this point, the target size needs to be known, but this is not an issue because measurement methods
 * can always be called, even before preparation.
 *
 * When no more rendering needs to be done, call finish() to produce the result.
 */
export interface DirectRenderer<OutputType> extends Renderer {
  /**
   * Set up this renderer for a drawing of the given size.
   * This needs to be called before any rendering can happen.
   *
   * @param {Size} canvasSize The coordinate range in which rendering will occur.
   * @returns {void}
   */
  prepare: (canvasSize: Size) => void

  /**
   * Finish rendering and produce the result.
   *
   * @returns {object} The rendered result.
   */
  finish: () => OutputType
}
