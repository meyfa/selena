import { Renderer } from '../../renderer/renderer'

/**
 * A diagram part is usually a complex visual element that includes dynamic content
 * and requires specific layout information.
 * How this is done depends on the type of diagram part.
 *
 * After a part has been laid out, it can be drawn to a rendering surface.
 */
export interface DiagramPart {
  /**
   * Draw this diagram part to the given renderer.
   *
   * @param renderer The renderer.
   */
  draw: (renderer: Renderer) => void
}
