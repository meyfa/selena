import { HeadDrawable } from './head-drawable.js'
import { HorizontalTextAlignment, TextAlignment, TextDrawable, VerticalTextAlignment } from './text-drawable.js'
import { Point } from '../../util/geometry/point.js'
import { RenderAttributes, Renderer } from '../../renderer/renderer.js'
import { Size } from '../../util/geometry/size.js'
import { BoxDrawable } from './box-drawable.js'
import { COMPONENT_HEAD_PADDING_H, COMPONENT_HEAD_PADDING_V } from '../config.js'

const TEXT_ALIGN: TextAlignment = {
  h: HorizontalTextAlignment.CENTER,
  v: VerticalTextAlignment.MIDDLE
}

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
    this.text.setPosition(boxCenter, TEXT_ALIGN)

    this.box.draw(renderer)
    this.text.draw(renderer)
  }
}
