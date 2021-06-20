/**
 * The type of entity participating in the sequence (either an actor, e.g. user, or a system component).
 */
export enum EntityType {
  COMPONENT,
  ACTOR
}

/**
 * Represents an object participating in the sequence.
 */
export class Entity {
  readonly type: EntityType
  readonly id: string
  readonly name: string

  constructor (type: EntityType, id: string, name: string) {
    this.type = type
    this.id = id
    this.name = name
  }
}
