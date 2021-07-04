/**
 * A 2D size.
 */
export class Size {
  /**
   * Zero width, zero height.
   */
  static readonly ZERO: Size = new Size(0, 0)

  readonly width: number
  readonly height: number

  constructor (width: number, height: number) {
    this.width = Math.max(0, width)
    this.height = Math.max(0, height)
  }

  /**
   * Create a new object that is the sum of this one and the given deltas.
   *
   * @param {number} dWidth The amount by which to grow this size width-wise.
   * @param {number} dHeight The amount by which to grow this size height-wise.
   * @returns {Size} A new Size object with the combined dimensions.
   */
  add (dWidth: number, dHeight: number): Size {
    return new Size(this.width + dWidth, this.height + dHeight)
  }
}
