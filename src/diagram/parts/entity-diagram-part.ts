import { Entity, EntityType } from '../../sequence/entity.js'
import { LifelineDrawable } from '../drawables/lifeline-drawable.js'
import { HeadDrawable } from '../drawables/head-drawable.js'
import { ActorHeadDrawable } from '../drawables/actor-head-drawable.js'
import { ComponentHeadDrawable } from '../drawables/component-head-drawable.js'
import { RenderAttributes, Renderer } from '../../renderer/renderer.js'
import { Size } from '../../util/geometry/size.js'
import { Point } from '../../util/geometry/point.js'
import { DiagramPart } from './diagram-part.js'

/**
 * Create a head drawable for the given type of entity, configured with the given display name.
 *
 * @param type The entity type.
 * @param name The name of the entity (visible on the head).
 * @returns The type-specific head.
 */
function getHeadForType (type: EntityType, name: string): HeadDrawable {
  return type === EntityType.ACTOR
    ? new ActorHeadDrawable(name)
    : new ComponentHeadDrawable(name)
}

/**
 * A diagram part representing an entity (actor / component / ...).
 */
export class EntityDiagramPart implements DiagramPart {
  readonly entity: Entity

  private readonly drawable: LifelineDrawable
  private topCenter: Point = Point.ORIGIN
  private lifelineEndY = 0
  private destroy = false

  constructor (entity: Entity) {
    this.entity = entity
    this.drawable = new LifelineDrawable(getHeadForType(entity.type, entity.name))
  }

  /**
   * Measure the size of head for this entity.
   *
   * @param attr The rendering attributes.
   * @returns The head size.
   */
  measureHead (attr: RenderAttributes): Size {
    return this.drawable.measureHead(attr)
  }

  /**
   * Set the position of this entity.
   *
   * The y coordinate determines the height below which the head (and, later, the lifeline line) appear.
   * The x coordinate determines the center location of the lifeline.
   *
   * @param position The position.
   */
  setTopCenter (position: Point): void {
    this.topCenter = position
  }

  /**
   * Set the y coordinate at which the lifeline stops, and the mode of stopping.
   * The coordinate is absolute, independent of the lifeline's anchor position.
   *
   * @param endHeight The absolute height at which the lifeline stops.
   * @param destroy Whether the lifeline ends with a destruction, or simply ends.
   */
  setLifelineEnd (endHeight: number, destroy: boolean): void {
    this.lifelineEndY = endHeight
    this.destroy = destroy
  }

  draw (renderer: Renderer): void {
    this.drawable.setTopCenter(this.topCenter)
    this.drawable.setEnd(this.lifelineEndY, this.destroy)
    this.drawable.draw(renderer)
  }
}
