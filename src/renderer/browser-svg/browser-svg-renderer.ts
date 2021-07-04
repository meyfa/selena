import { DirectRenderer, StrokeOptions } from '../renderer'
import { Size } from '../../util/geometry/size'
import { Point } from '../../util/geometry/point'

type AttributeValue = string | number | undefined

function createSvgElement (tagName: string): SVGElement {
  return document.createElementNS('http://www.w3.org/2000/svg', tagName)
}

function applyAttributes (element: SVGElement, attrs: Record<string, AttributeValue>): void {
  for (const key of Object.keys(attrs)) {
    const value = attrs[key]
    if (value == null) continue
    element.setAttribute(key, String(value))
  }
}

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

function getViewBox (size: Size, hPadding: number, vPadding: number): string {
  const minX = -hPadding
  const minY = -vPadding
  const width = size.width + 2 * hPadding
  const height = size.height + 2 * vPadding

  return `${minX} ${minY} ${width} ${height}`
}

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
   * @param {string} foreground The foreground color.
   * @param {string} background The background color.
   * @returns {void}
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
