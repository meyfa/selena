/**
 * Options for constraint layouts.
 */
export interface ConstraintLayoutOptions {
  itemMargin: number
}

/**
 * A constraint layout can space out items (of some type) in a way that adheres to predefined constraints.
 *
 * You can imagine it as a multiple lines, one below the other.
 * Each of the lines can have a dimension (its thickness) that shifts the following lines further away.
 * Additionally, requirements can be set that a given pair of lines (not necessarily adjacent) needs to be
 * a given distance apart at minimum.
 *
 * Constraints are never overwritten, but instead, further constraints are simply added on top of existing ones.
 * For example, when two elements are set to be 100 pixels apart, and later said to be just 50 pixels apart,
 * in the final computation the 100 pixel distance is still guaranteed.
 * When another constraint is added for 200 pixels, then 200 pixels will be guaranteed.
 *
 * As soon as the layout is done (all constraints set), the final item offsets can be computed.
 */
export interface ConstraintLayout<V> {
  /**
   * Specify that the item with the given identifier has the given dimension.
   * If a dimension was already set previously, the maximum of the previous value and this value will be kept.
   *
   * @param id The item identifier.
   * @param dim The dimension.
   */
  applyDimension: (id: V, dim: number) => void

  /**
   * Specify that at least the given amount of spacing needs to exist between the item and its predecessor.
   *
   * If the item is the first (has no predecessor), it will be shifted suitably far away from the origin.
   * In other words, this method will behave as if there was a virtual item at offset 0 with 0 dimension,
   * from which the first item can be offset.
   *
   * The spacing is measured between item centers (or between 0 and the item center).
   *
   * @param id The item identifier.
   * @param space The space to apply before the item.
   */
  applyBefore: (id: V, space: number) => void

  /**
   * Specify that at least the given amount of spacing needs to exist between two items.
   * The items need not be directly next to each other (they can have other items in between).
   *
   * If the items are the same, no constraint will be added.
   *
   * The spacing is measured between item centers.
   *
   * @param a An item identifier.
   * @param b Another item identifier.
   * @param space The space to apply between the items.
   */
  applyBetween: (a: V, b: V, space: number) => void

  /**
   * Compute the final offsets for all the items, based on the constraints previously defined.
   *
   * @returns The layout result.
   */
  compute: () => ComputedConstraints<V>
}

/**
 * Result of a constraint layout computation.
 * It contains offset and dimension information for each of the items, as well as the total size of all
 * items combined (including margins between them).
 */
export interface ComputedConstraints<V> {
  readonly items: Map<V, ComputedConstraintsItem>
  readonly totalDimensions: number
}

/**
 * Offset and dimension information for a single item, computed by a constraint layout.
 */
export interface ComputedConstraintsItem {
  readonly start: number
  readonly center: number
  readonly dimension: number
}
