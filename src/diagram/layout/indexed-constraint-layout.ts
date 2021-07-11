import {
  ComputedConstraints,
  ComputedConstraintsItem,
  ConstraintLayout,
  ConstraintLayoutOptions
} from './constraint-layout'

/**
 * Holds the constraints for a single item (before they are computed).
 */
interface ConstraintItem {
  index: number

  dim: number
  preConstraints: Map<number, number>
}

/**
 * Convert an array to a Map, where keys are the array indices and values are the respective array entries.
 *
 * @param array The array to convert.
 * @returns The resulting Map.
 */
function convertArrayToMap<T> (array: T[]): Map<number, T> {
  return array.reduce((map, item, index) => {
    map.set(index, item)
    return map
  }, new Map())
}

/**
 * Based on the given computed offsets and dimensions, determine the total size needed to represent all items.
 *
 * @param computed The computed item offsets and dimensions.
 * @returns The total size.
 */
function computeTotalDimensions (computed: ComputedConstraintsItem[]): number {
  if (computed.length > 0) {
    const last = computed[computed.length - 1]
    return last.start + last.dimension
  }
  return 0
}

/**
 * A type of constraint layout that is limited to items numbered from 0 to n-1 for some positive integer n.
 *
 * @see ConstraintLayout
 */
export class IndexedConstraintLayout implements ConstraintLayout<number> {
  private readonly items: ConstraintItem[] = []

  private readonly itemMargin: number

  constructor (itemCount: number, options: ConstraintLayoutOptions) {
    for (let i = 0; i < itemCount; ++i) {
      this.items.push({ index: i, dim: 0, preConstraints: new Map() })
    }
    this.itemMargin = options.itemMargin
  }

  applyDimension (id: number, dim: number): void {
    const item = this.items[id]
    item.dim = Math.max(item.dim, dim)
  }

  applyBefore (id: number, space: number): void {
    const item = this.items[id]
    const current = item.preConstraints.get(id - 1) ?? 0
    item.preConstraints.set(id - 1, Math.max(current, space))
  }

  applyBetween (a: number, b: number, space: number): void {
    if (a === b) {
      return
    }
    const first = this.items[a < b ? a : b]
    const second = this.items[a < b ? b : a]
    const current = second.preConstraints.get(first.index) ?? 0
    second.preConstraints.set(first.index, Math.max(current, space))
  }

  compute (): ComputedConstraints<number> {
    const computed: ComputedConstraintsItem[] = []

    let offset = 0

    for (const item of this.items) {
      if (item.index > 0) {
        offset += computed[item.index - 1].dimension / 2 + this.itemMargin
      }
      offset += item.dim / 2
      for (const [otherIndex, between] of item.preConstraints) {
        const otherPos = computed[otherIndex]
        // default to 0 for otherIndex===-1, which happens for first item
        offset = Math.max(offset, (otherPos?.center ?? 0) + between)
      }
      computed.push({
        start: offset - item.dim / 2,
        center: offset,
        dimension: item.dim
      })
    }

    return {
      totalDimensions: computeTotalDimensions(computed),
      items: convertArrayToMap(computed)
    }
  }
}
