import {
  ComputedConstraints,
  ComputedConstraintsItem,
  ConstraintLayout,
  ConstraintLayoutOptions
} from './constraint-layout.js'
import { IndexedConstraintLayout } from './indexed-constraint-layout.js'

/**
 * A type of constraint layout for arbitrary types of item identifiers (identifiers must be unique).
 *
 * @see ConstraintLayout
 */
export class TypedConstraintLayout<T> implements ConstraintLayout<T> {
  // this layout is just a proxy based on an indexed layout
  // (the typing code found here is not included in IndexedConstraintLayout for simplicity reasons)
  private readonly proxied: ConstraintLayout<number>

  private readonly ids: T[]
  private readonly indices = new Map<T, number>()

  constructor (ids: T[], options: ConstraintLayoutOptions) {
    this.proxied = new IndexedConstraintLayout(ids.length, options)
    this.ids = ids
    ids.forEach((id, index) => this.indices.set(id, index))
  }

  private toIndex (id: T): number {
    // assume the entry exists
    return this.indices.get(id) as number
  }

  applyDimension (id: T, dim: number): void {
    this.proxied.applyDimension(this.toIndex(id), dim)
  }

  applyBefore (id: T, space: number): void {
    this.proxied.applyBefore(this.toIndex(id), space)
  }

  applyBetween (a: T, b: T, space: number): void {
    this.proxied.applyBetween(this.toIndex(a), this.toIndex(b), space)
  }

  compute (): ComputedConstraints<T> {
    const { items, totalDimensions } = this.proxied.compute()

    const typedItems = new Map<T, ComputedConstraintsItem>()
    for (const [index, item] of items) {
      typedItems.set(this.ids[index], item)
    }

    return { items: typedItems, totalDimensions }
  }
}
