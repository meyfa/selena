import { Point } from '../../util/geometry/point'
import { ACTIVATION_THICKNESS, MESSAGE_FOUND_WIDTH, MESSAGE_SELF_HEIGHT, MESSAGE_SELF_WIDTH } from '../config'

/**
 * The amount each nested activation bar is indented relative to the previous one.
 */
const indent = ACTIVATION_THICKNESS / 2

/**
 * Represents an activation bar location.
 * This is described by the lifeline x coordinate and the associated activation level of the message.
 */
export interface BarLocation {
  x: number
  level: number
}

/**
 * Given a bar location specifier (lifeline coordinate and activation level),
 * compute the exact position of the activation bar's left edge.
 *
 * @param bar The bar location.
 * @returns The x coordinate of the activation bar's left edge.
 */
function getBarLeftEdge (bar: BarLocation): number {
  return bar.x + (bar.level - 2) * indent
}

/**
 * Given a bar location specifier (lifeline coordinate and activation level),
 * compute the exact position of the activation bar's right edge.
 *
 * @param bar The bar location.
 * @returns The x coordinate of the activation bar's right edge.
 */
function getBarRightEdge (bar: BarLocation): number {
  return bar.x + bar.level * indent
}

/**
 * Compute the polyline for a "found message" arrow (arrow out of nowhere, activating an entity).
 *
 * @param y The y offset (top edge of the arrow's bounding box).
 * @param to The arrow's target location.
 * @returns The array of points describing the arrow polyline.
 */
function computeFoundArrow (y: number, to: BarLocation): Point[] {
  const end = new Point(getBarLeftEdge(to), y)
  const start = end.translate(-MESSAGE_FOUND_WIDTH, 0)
  return [start, end]
}

/**
 * Compute the polyline for a "lost message" arrow (arrow from an entity out to nowhere).
 *
 * @param y The y offset (top edge of the arrow's bounding box).
 * @param from The arrow's source location.
 * @returns The array of points describing the arrow polyline.
 */
function computeLostArrow (y: number, from: BarLocation): Point[] {
  const start = new Point(getBarLeftEdge(from), y)
  const end = start.translate(-MESSAGE_FOUND_WIDTH, 0)
  return [start, end]
}

/**
 * Compute the polyline for a "create message" arrow (arrow from a lifeline to another entity's head).
 *
 * @param y The y offset (top edge of the arrow's bounding box).
 * @param from The arrow's source location.
 * @param toLifelineX The lifeline x coordinate of the target entity.
 * @param toHeadWidth Head width of the target entity.
 * @returns The array of points describing the arrow polyline.
 */
function computeCreateArrow (y: number, from: BarLocation, toLifelineX: number, toHeadWidth: number): Point[] {
  const leftToRight = from.x < toLifelineX

  const start = leftToRight ? getBarRightEdge(from) : getBarLeftEdge(from)
  const end = leftToRight ? toLifelineX - toHeadWidth / 2 : toLifelineX + toHeadWidth / 2

  return [new Point(start, y), new Point(end, y)]
}

/**
 * Compute the polyline for a self-call arrow (arrow between an entity and itself).
 *
 * @param y The y offset (top edge of the arrow's bounding box).
 * @param from The arrow's source location.
 * @param to The arrow's target location.
 * @returns The array of points describing the arrow polyline.
 */
function computeSelfCallArrow (y: number, from: BarLocation, to: BarLocation): Point[] {
  const fromEdge = getBarRightEdge(from)
  const toEdge = getBarRightEdge(to)

  const start = new Point(fromEdge, y)
  const topRight = new Point(Math.min(fromEdge, toEdge) + MESSAGE_SELF_WIDTH, y)
  const bottomRight = topRight.translate(0, MESSAGE_SELF_HEIGHT)
  const end = new Point(toEdge, y + MESSAGE_SELF_HEIGHT)

  return [start, topRight, bottomRight, end]
}

/**
 * Compute the polyline for a "regular" arrow (arrow between two entities).
 *
 * @param y The y offset (top edge of the arrow's bounding box).
 * @param from The arrow's source location.
 * @param to The arrow's target location.
 * @returns The array of points describing the arrow polyline.
 */
function computeRegularArrow (y: number, from: BarLocation, to: BarLocation): Point[] {
  const leftToRight = from.x < to.x

  return [
    new Point(leftToRight ? getBarRightEdge(from) : getBarLeftEdge(from), y),
    new Point(leftToRight ? getBarLeftEdge(to) : getBarRightEdge(to), y)
  ]
}

/**
 * Compute the polyline describing a message arrow.
 * The exact shape and dimensions depend on the y offset, the x start and end positions, and potentially
 * the width of the message target's head.
 *
 * The x positions are expected in the form of "activation bar locations".
 * An activation bar location is described by the lifeline x coordinate and the associated activation level
 * of the message.
 * For some messages (lost, found), either the source or the target entity is optional, in which case
 * no bar location needs to be provided.
 *
 * @param y The y offset (top edge of the arrow's bounding box).
 * @param from The arrow's source location.
 * @param to The arrow's target location.
 * @param toHeadWidth The width of the arrow target's head (can be 0 if no target exists).
 * @returns The array of points describing the arrow polyline.
 */
export function computeArrowPoints (y: number, from: BarLocation | undefined, to: BarLocation | undefined, toHeadWidth: number): Point[] {
  if (from == null) {
    if (to == null) {
      throw new Error('arrow needs to have either source, or target, or both (not none)')
    }
    return computeFoundArrow(y, to)
  }
  if (to == null) {
    return computeLostArrow(y, from)
  }
  if (to.level === 0) {
    return computeCreateArrow(y, from, to.x, toHeadWidth)
  }
  if (from.x === to.x) {
    return computeSelfCallArrow(y, from, to)
  }
  return computeRegularArrow(y, from, to)
}
