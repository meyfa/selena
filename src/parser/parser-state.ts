import { Entity } from '../sequence/entity.js'
import { Activation } from '../sequence/activation.js'

/**
 * This interface enables looking up an Entity by its id.
 */
export interface EntityLookup {
  /**
   * Obtain the entity with the given id, if it exists.
   *
   * @param id The entity id.
   * @returns The lookup result.
   */
  lookupEntity: (id: string) => Entity | undefined
}

/**
 * This class implements an imperative view on parser state.
 * It allows for inserting entities and looking them up again, as well as inserting activations.
 */
export class ParserState implements EntityLookup {
  private readonly entities: Entity[] = []
  private readonly entityMap = new Map<string, Entity>()

  private readonly rootActivations: Activation[] = []

  /**
   * Add the given entity to this state.
   *
   * @param entity The entity.
   */
  insertEntity (entity: Entity): void {
    if (this.entityMap.has(entity.id)) {
      throw new Error(`duplicate entity id: "${entity.id}"`)
    }
    this.entities.push(entity)
    this.entityMap.set(entity.id, entity)
  }

  /**
   * Add the given activation to this state. The activation must be a top-level activation,
   * in other words, child activations should not be added with this.
   *
   * @param activation The activation.
   */
  insertActivation (activation: Activation): void {
    this.rootActivations.push(activation)
  }

  /**
   * Retrieve all entities currently added to this state object.
   *
   * @returns The entities.
   */
  getEntities (): Entity[] {
    return this.entities
  }

  /**
   * Retrieve all activations currently added to this state object.
   * This does not consider child activations, but gives a flat view of just the root activations.
   *
   * @returns The activations.
   */
  getRootActivations (): Activation[] {
    return this.rootActivations
  }

  lookupEntity (id: string): Entity | undefined {
    return this.entityMap.get(id)
  }
}
