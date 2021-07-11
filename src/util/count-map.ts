/**
 * This data structure stores for each key a single number (the associated count).
 * The count can be retrieved, incremented, and decremented.
 * The count cannot reach values below 0.
 */
export class CountMap<K> {
  private readonly counts: Map<K, number> = new Map()

  /**
   * Obtain the count for the given key.
   *
   * @param key The key.
   * @returns The associated count.
   */
  get (key: K): number {
    return this.counts.get(key) ?? 0
  }

  /**
   * Increment the count for the given key by one.
   *
   * @param key The key.
   * @returns The associated count after incrementing.
   */
  incrementAndGet (key: K): number {
    const count = this.get(key) + 1
    this.counts.set(key, count)
    return count
  }

  /**
   * Decrement the count for the given key by one.
   *
   * @param key The key.
   */
  decrement (key: K): void {
    const count = this.get(key)
    if (count <= 0) {
      throw new Error('unexpected decrement of count=0')
    }
    this.counts.set(key, count - 1)
  }
}
