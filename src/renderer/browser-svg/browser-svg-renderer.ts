import { DirectRenderer, StrokeOptions } from '../renderer'
import { Size } from '../../util/geometry/size'
import { Point } from '../../util/geometry/point'

type AttributeValue = string | number | undefined

/**
 * Create an XML element for the SVG namespace.
 *
 * @param tagName The tag name for the element to create.
 * @returns The created element.
 */
function createSvgElement (tagName: string): SVGElement {
  return document.createElementNS('http://www.w3.org/2000/svg', tagName)
}

/**
 * Apply a set of attributes to the given element.
 * The attribute values (when present) will be converted to strings.
 *
 * @param element The SVG element.
 * @param attrs The attributes to apply.
 */
function applyAttributes (element: SVGElement, attrs: Record<string, AttributeValue>): void {
  for (const key of Object.keys(attrs)) {
    const value = attrs[key]
    if (value == null) continue
    element.setAttribute(key, String(value))
  }
}

/**
 * Obtain the size of the given piece of text in SVG pixels.
 * This is potentially an expensive operation.
 *
 * @param text The text to measure.
 * @param fontSize The font size to use while measuring.
 * @returns The size of the text in the SVG context.
 */
function measureText (text: string, fontSize: number): Size {
  const element = createSvgElement('text') as SVGTextElement
  applyAttributes(element, {
    'font-size': fontSize
  })
  element.appendChild(document.createTextNode(text))

  const measureSvg = createSvgElement('svg')
  measureSvg.appendChild(element)

  document.body.appendChild(measureSvg)
  const box = element.getBBox()
  document.body.removeChild(measureSvg)

  return new Size(box.width, box.height)
}

/**
 * Create a viewBox attribute string from the given canvas size and external padding.
 *
 * @param size The canvas size.
 * @param hPadding The padding to apply on the left and right sides.
 * @param vPadding The padding to apply on the top and bottom sides.
 * @returns A viewBox string that matches the specifications.
 */
function getViewBox (size: Size, hPadding: number, vPadding: number): string {
  const minX = -hPadding
  const minY = -vPadding
  const width = size.width + 2 * hPadding
  const height = size.height + 2 * vPadding

  return `${minX} ${minY} ${width} ${height}`
}

/**
 * Given a StrokeOptions specification, compute the required attributes to apply.
 *
 * @param options The stroke options.
 * @returns The attributes that need to be applied to achieve that stroke.
 */
function convertStrokeToAttributes (options?: StrokeOptions): Record<string, AttributeValue> {
  return {
    'stroke-width': options?.lineWidth ?? 1,
    'stroke-dasharray': (options?.dashed ?? false) ? '4' : ''
  }
}

/**
 * A renderer implementation that renders to an SVG directly in the browser.
 * For this to work, the code needs to run in an actual browser with access to a DOM.
 * The renderer may need to temporarily append nodes to the body (e.g. for measuring).
 */
export class BrowserSvgRenderer implements DirectRenderer<SVGSVGElement> {
  private readonly hPadding: number
  private readonly vPadding: number
  private foregroundColor: string = '#000'
  private backgroundColor: string = '#FFF'

  private svg: SVGSVGElement | undefined

  constructor (hPadding: number, vPadding: number) {
    if (window == null || window.document == null) {
      throw new Error('cannot use this renderer outside the browser')
    }

    this.hPadding = hPadding
    this.vPadding = vPadding
  }

  private addToRender (element: SVGElement): void {
    if (this.svg == null) {
      throw new Error('renderer not prepared')
    }
    this.svg.appendChild(element)
  }

  /**
   * Configure colors that are different from the defaults (black foreground, white background).
   * Any CSS color value can be used.
   * The background is used for rendering boxes, and the foreground for strokes and texts.
   *
   * @param foreground The foreground color.
   * @param background The background color.
   */
  setColors (foreground: string, background: string): void {
    this.foregroundColor = foreground
    this.backgroundColor = background
  }

  prepare (canvasSize: Size): void {
    this.svg = createSvgElement('svg') as SVGSVGElement
    applyAttributes(this.svg, {
      viewBox: getViewBox(canvasSize, this.hPadding, this.vPadding),
      width: canvasSize.width + 2 * this.hPadding,
      height: canvasSize.height + 2 * this.vPadding
    })
  }

  finish (): SVGSVGElement {
    if (this.svg == null) {
      throw new Error('renderer not prepared')
    }
    return this.svg
  }

  measureText (str: string, fontSize: number): Size {
    return measureText(str, fontSize)
  }

  renderBox (start: Point, size: Size, options?: StrokeOptions): void {
    const element = createSvgElement('rect')
    applyAttributes(element, {
      x: start.x,
      y: start.y,
      width: size.width,
      height: size.height,
      fill: this.backgroundColor,
      stroke: this.foregroundColor,
      ...convertStrokeToAttributes(options)
    })
    this.addToRender(element)
  }

  renderLine (start: Point, end: Point, options?: StrokeOptions): void {
    const element = createSvgElement('line')
    applyAttributes(element, {
      x1: start.x,
      y1: start.y,
      x2: end.x,
      y2: end.y,
      stroke: this.foregroundColor,
      ...convertStrokeToAttributes(options)
    })
    this.addToRender(element)
  }

  renderPath (data: string, offset: Point, options?: StrokeOptions): void {
    const element = createSvgElement('path')
    applyAttributes(element, {
      d: data,
      transform: `translate(${offset.x} ${offset.y})`,
      fill: 'none',
      stroke: this.foregroundColor,
      ...convertStrokeToAttributes(options)
    })
    this.addToRender(element)
  }

  renderText (text: string, position: Point, fontSize: number): void {
    const element = createSvgElement('text')
    applyAttributes(element, {
      x: position.x,
      y: position.y,
      'font-size': fontSize,
      fill: this.foregroundColor
    })
    element.appendChild(document.createTextNode(text))
    this.addToRender(element)
  }
}
