import { HeadDrawable } from './head-drawable'
import { TextAlignment, TextDrawable } from './text-drawable'
import { StickFigureDrawable } from './stick-figure-drawable'
import { Point } from '../../util/geometry/point'
import { RenderAttributes, Renderer } from '../../renderer/renderer'
import { Size } from '../../util/geometry/size'

/**
 * An entity head Drawable for entities of type "Actor".
 * They are drawn as a stick figure, with their name beneath the pictogram.
 */
export class ActorHeadDrawable implements HeadDrawable {
  private readonly text: TextDrawable
  private readonly figure: StickFigureDrawable

  private readonly vSpacing: number = 4

  private topCenter: Point = Point.ORIGIN

  constructor (name: string) {
    this.text = new TextDrawable(name)
    this.figure = new StickFigureDrawable()
  }

  setTopCenter (topCenter: Point): void {
    this.topCenter = topCenter
  }

  measure (attr: RenderAttributes): Size {
    const textSize = this.text.measure(attr)
    const figureSize = this.figure.measure(attr)

    const width = Math.max(textSize.width, figureSize.width)
    const height = textSize.height + this.vSpacing + figureSize.height

    return new Size(width, height)
  }

  draw (renderer: Renderer): void {
    const figureSize = this.figure.measure(renderer)

    this.figure.setTopCenter(this.topCenter)
    this.text.setPosition(this.topCenter.translate(0, figureSize.height), TextAlignment.CENTER_BELOW)

    this.figure.draw(renderer)
    this.text.draw(renderer)
  }
}
