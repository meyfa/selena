import { RenderAttributes, Renderer } from '../../renderer/renderer'
import { Size } from '../../util/geometry/size'

/**
 * A Drawable is something that can be measured (has an intrinsic Size)
 * and can be drawn to a renderer.
 */
export interface Drawable {
  /**
   * Determine the size of this Drawable, using the given rendering attributes.
   *
   * This is not a stateful operation (i.e., no layout is computed).
   * In other words, it is not necessary to call this before calling #draw().
   *
   * @param attr The rendering attributes used to determine e.g. the sizes of strings.
   * @returns The measured size.
   */
  measure: (attr: RenderAttributes) => Size

  /**
   * Draw this Drawable to the given renderer.
   *
   * @param renderer The renderer.
   */
  draw: (renderer: Renderer) => void
}
