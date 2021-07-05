export class Point {
  /**
   * The point (0, 0).
   */
  static readonly ORIGIN: Point = new Point(0, 0)

  readonly x: number
  readonly y: number

  constructor (x: number, y: number) {
    this.x = x
    this.y = y
  }

  /**
   * Create a new point whose coordinates are the sum of this one's and the given deltas.
   *
   * @param {number} dx The amount to add on the x-axis.
   * @param {number} dy The amount to add on the y-axis.
   * @returns {Point} A new Point object with the shifted coordinates.
   */
  translate (dx: number, dy: number): Point {
    return new Point(this.x + dx, this.y + dy)
  }

  /**
   * Create a copy of this point where the Y coordinate is the same, but the X coordinate is set to the one given.
   *
   * @param {number} x The new x coordinate.
   * @returns {Point} A new Point with the coordinates set as described above.
   */
  withX (x: number): Point {
    return new Point(x, this.y)
  }

  /**
   * Create a copy of this point where the X coordinate is the same, but the Y coordinate is set to the one given.
   *
   * @param {number} y The new y coordinate.
   * @returns {Point} A new Point with the coordinates set as described above.
   */
  withY (y: number): Point {
    return new Point(this.x, y)
  }
}
