import { HeadDrawable } from './head-drawable'
import { TextAlignment, TextDrawable } from './text-drawable'
import { Point } from '../../util/geometry/point'
import { RenderAttributes, Renderer } from '../../renderer/renderer'
import { Size } from '../../util/geometry/size'
import { BoxDrawable } from './box-drawable'
import { COMPONENT_HEAD_PADDING_H, COMPONENT_HEAD_PADDING_V } from '../config'

/**
 * An entity head Drawable for entities of type "Component".
 * They are drawn as a box surrounding the entity's name.
 */
export class ComponentHeadDrawable implements HeadDrawable {
  private readonly text: TextDrawable
  private readonly box: BoxDrawable

  private topCenter: Point = Point.ORIGIN

  constructor (name: string) {
    this.text = new TextDrawable(name)
    this.box = new BoxDrawable()
  }

  setTopCenter (topCenter: Point): void {
    this.topCenter = topCenter
  }

  measure (attr: RenderAttributes): Size {
    return this.text.measure(attr).add(2 * COMPONENT_HEAD_PADDING_H, 2 * COMPONENT_HEAD_PADDING_V)
  }

  draw (renderer: Renderer): void {
    const size = this.measure(renderer)

    this.box.setTopLeft(this.topCenter.translate(-size.width / 2, 0))
    this.box.setSize(size)

    const boxCenter = this.topCenter.translate(0, size.height / 2)
    this.text.setPosition(boxCenter, TextAlignment.CENTER_CENTER)

    this.box.draw(renderer)
    this.text.draw(renderer)
  }
}
