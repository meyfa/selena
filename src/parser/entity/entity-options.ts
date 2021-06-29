/**
 * This describes the complete set of options available when declaring an entity.
 */
export interface EntityOptions {
  isActor: boolean
}

/**
 * These are the default options for entity definitions, which can be changed individually depending on input.
 */
export const defaultEntityOptions: Readonly<EntityOptions> = {
  isActor: false
}
