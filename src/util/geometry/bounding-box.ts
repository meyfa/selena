import { Point } from './point.js'
import { Size } from './size.js'

/**
 * A bounding box is an axis-aligned rectangle.
 * It has minimum and maximum x and y coordinates.
 */
export class BoundingBox {
  readonly minX: number
  readonly maxX: number
  readonly minY: number
  readonly maxY: number

  constructor (x1: number, x2: number, y1: number, y2: number) {
    this.minX = Math.min(x1, x2)
    this.maxX = Math.max(x1, x2)
    this.minY = Math.min(y1, y2)
    this.maxY = Math.max(y1, y2)
  }

  /**
   * Create a new bounding box for the smallest axis-aligned rectangular region
   * that contains all of the given points.
   * If no points are given, returns a zero-sized bounding box positioned at the origin.
   *
   * @param points The points.
   * @returns The bounding box that contains precisely all of the given points.
   */
  static containingPoints (points: Point[]): BoundingBox {
    if (points.length < 1) {
      return new BoundingBox(0, 0, 0, 0)
    }

    const minX = Math.min(...points.map((p) => p.x))
    const maxX = Math.max(...points.map((p) => p.x))
    const minY = Math.min(...points.map((p) => p.y))
    const maxY = Math.max(...points.map((p) => p.y))

    return new BoundingBox(minX, maxX, minY, maxY)
  }

  /**
   * Obtain the size of this bounding box (extent from minX to maxX, and minY to maxY).
   *
   * @returns The size of this bounding box.
   */
  size (): Size {
    return new Size(this.maxX - this.minX, this.maxY - this.minY)
  }

  /**
   * Obtain the point at the center of this bounding box (between minX and maxX, and between minY and maxY).
   *
   * @returns The center point of this bounding box.
   */
  center (): Point {
    return new Point(this.centerX(), this.centerY())
  }

  /**
   * Returns the x coordinate at the center of this bounding box (exactly between minX and maxX),
   * without allocating a Point object as with the center method.
   *
   * @returns The center x coordinate of this bounding box.
   */
  centerX (): number {
    return (this.maxX + this.minX) / 2
  }

  /**
   * Returns the y coordinate at the center of this bounding box (exactly between minY and maxY),
   * without allocating a Point object as with the center method.
   *
   * @returns The center y coordinate of this bounding box.
   */
  centerY (): number {
    return (this.maxY + this.minY) / 2
  }
}
