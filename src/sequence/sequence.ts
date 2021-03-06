import { Entity } from './entity.js'
import { Activation } from './activation.js'

/**
 * A sequence, consisting of entities and activations.
 */
export class Sequence {
  readonly entities: Entity[]
  readonly activations: Activation[]

  constructor (entities: Entity[], activations: Activation[]) {
    this.entities = entities
    this.activations = activations
  }
}
