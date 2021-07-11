import { Size } from '../util/geometry/size'
import { Sequence } from '../sequence/sequence'
import { RenderAttributes, Renderer } from '../renderer/renderer'
import { EntityDiagramPart } from './parts/entity-diagram-part'
import { ENTITY_SPACING } from './config'
import { ConstraintLayout } from './layout/constraint-layout'
import { TypedConstraintLayout } from './layout/typed-constraint-layout'
import { Point } from '../util/geometry/point'

/**
 * Represents a visual diagram based on some sequence.
 * In contrast to sequences themselves, instances of this class store very little in the sense of message hierarchies
 * and script order, but are merely concerned with the visual parts that make up a sequence diagram.
 * They can be laid out, sized, and drawn to a rendering surface.
 */
export class Diagram {
  private readonly entities: EntityDiagramPart[]

  private readonly horizontalLayout: ConstraintLayout<string>
  private computedSize: Size | undefined

  private constructor (entities: EntityDiagramPart[]) {
    this.entities = entities

    const entityIds = entities.map(e => e.entity.id)
    this.horizontalLayout = new TypedConstraintLayout<string>(entityIds, {
      itemMargin: ENTITY_SPACING
    })
  }

  /**
   * Build a diagram from the given sequence. The sequence must be fully valid.
   *
   * @param sequence The sequence to transform into a visual diagram.
   * @returns The diagram that was built.
   */
  static create (sequence: Sequence): Diagram {
    const entities = sequence.entities.map(e => new EntityDiagramPart(e))
    return new Diagram(entities)
  }

  /**
   * Layout the diagram parts with respect to each other, and compute overall diagram size.
   *
   * @param attr The rendering attributes used to determine e.g. the sizes of strings.
   */
  layout (attr: RenderAttributes): void {
    for (const entity of this.entities) {
      const head = entity.measureHead(attr)
      this.horizontalLayout.applyDimension(entity.entity.id, head.width)
    }

    const computedLayout = this.horizontalLayout.compute()

    // TODO replace with actual height once we have a vertical layout
    this.computedSize = new Size(computedLayout.totalDimensions, 200)

    for (const entity of this.entities) {
      const posH = computedLayout.items.get(entity.entity.id)
      if (posH == null) throw new Error('missing entity position')
      entity.setTopCenter(new Point(posH.center, 0))
    }
  }

  /**
   * After #layout() has been called, this method can be used to obtain the overall computed size
   * of the surface required for rendering the diagram.
   *
   * @returns The diagram size.
   */
  getComputedSize (): Size {
    if (this.computedSize == null) {
      throw new Error('layout not yet computed')
    }
    return this.computedSize
  }

  /**
   * Draw this diagram with all its parts to the given renderer.
   * The diagram has to be manually laid out prior to calling this method.
   *
   * @param renderer The renderer.
   */
  draw (renderer: Renderer): void {
    if (this.computedSize == null) {
      throw new Error('layout not yet computed')
    }
    this.entities.forEach(obj => obj.draw(renderer))
  }
}
