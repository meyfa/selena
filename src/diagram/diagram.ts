import { Size } from '../util/geometry/size'
import { Sequence } from '../sequence/sequence'
import { RenderAttributes, Renderer } from '../renderer/renderer'
import { EntityDiagramPart } from './parts/entity-diagram-part'
import { ENTITY_SPACING, MESSAGE_SPACING } from './config'
import { DiagramBuilder } from './diagram-builder'
import { DiagramActivationWalker } from './diagram-activation-walker'
import { ActivationBarDiagramPart } from './parts/activation-bar-diagram-part'
import { MessageDiagramPart } from './parts/message-diagram-part'
import { LayoutManager } from './layout/layout-manager'

/**
 * Represents a visual diagram based on some sequence.
 * In contrast to sequences themselves, instances of this class store very little in the sense of message hierarchies
 * and script order, but are merely concerned with the visual parts that make up a sequence diagram.
 * They can be laid out, sized, and drawn to a rendering surface.
 */
export class Diagram {
  private readonly entities: EntityDiagramPart[]
  private readonly messages: MessageDiagramPart[]
  private readonly activationBars: ActivationBarDiagramPart[]

  private readonly layoutManager: LayoutManager

  private constructor (entities: EntityDiagramPart[], messages: MessageDiagramPart[], activationBars: ActivationBarDiagramPart[]) {
    this.entities = entities
    this.messages = messages
    this.activationBars = activationBars

    const entityIds = entities.map(e => e.entity.id)
    this.layoutManager = new LayoutManager(entityIds, messages.length, {
      entityMargin: ENTITY_SPACING,
      messageSpacing: MESSAGE_SPACING
    })
  }

  /**
   * Build a diagram from the given sequence. The sequence must be fully valid.
   *
   * @param sequence The sequence to transform into a visual diagram.
   * @returns The diagram that was built.
   */
  static create (sequence: Sequence): Diagram {
    const builder = new DiagramBuilder()
    sequence.entities.forEach(e => builder.addEntity(e))

    const walker = new DiagramActivationWalker(builder)
    sequence.activations.forEach(a => walker.walk(a))

    const { entities, messages, activationBars } = builder.build()
    return new Diagram(entities, messages, activationBars)
  }

  /**
   * Layout the diagram parts with respect to each other, and compute overall diagram size.
   *
   * @param attr The rendering attributes used to determine e.g. the sizes of strings.
   */
  layout (attr: RenderAttributes): void {
    this.layoutManager.layout(attr, this.entities, this.messages, this.activationBars)
  }

  /**
   * After #layout() has been called, this method can be used to obtain the overall computed size
   * of the surface required for rendering the diagram.
   *
   * @returns The diagram size.
   */
  getComputedSize (): Size {
    return this.layoutManager.getComputedSize()
  }

  /**
   * Draw this diagram with all its parts to the given renderer.
   * The diagram has to be manually laid out prior to calling this method.
   *
   * @param renderer The renderer.
   */
  draw (renderer: Renderer): void {
    if (!this.layoutManager.isComputed()) {
      throw new Error('layout not yet computed')
    }
    this.entities.forEach(obj => obj.draw(renderer))
    this.activationBars.forEach(obj => obj.draw(renderer))
    this.messages.forEach(obj => obj.draw(renderer))
  }
}
