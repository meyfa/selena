import { DirectRenderer, LineMarker, StrokeOptions } from '../renderer.js'
import { Size } from '../../util/geometry/size.js'
import { Point } from '../../util/geometry/point.js'
import { applyAttributes, AttributeValue, createSvgElement } from './svg-dom.js'
import { SvgMarkerManager } from './svg-marker-manager.js'

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
  private foregroundColor = '#000'
  private backgroundColor = '#FFF'

  private svg: SVGSVGElement | undefined
  private markers: SvgMarkerManager | undefined

  constructor (hPadding: number, vPadding: number) {
    if (window?.document == null) {
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

    const defs = createSvgElement('defs') as SVGDefsElement
    this.svg.appendChild(defs)

    this.markers = new SvgMarkerManager(defs, this.foregroundColor)
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

  renderPolyline (points: Point[], end1: LineMarker, end2: LineMarker, options?: StrokeOptions): void {
    if (points.length < 2) return

    const line = createSvgElement('polyline')
    applyAttributes(line, {
      points: points.map((p) => `${p.x},${p.y}`).join(' '),
      'marker-start': this.markers?.referenceMarker(end1),
      'marker-end': this.markers?.referenceMarker(end2),
      fill: 'none',
      stroke: this.foregroundColor,
      ...convertStrokeToAttributes(options)
    })
    this.addToRender(line)
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
