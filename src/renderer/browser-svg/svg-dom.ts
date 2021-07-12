export type AttributeValue = string | number | undefined

/**
 * Create an XML element for the SVG namespace.
 *
 * @param tagName The tag name for the element to create.
 * @returns The created element.
 */
export function createSvgElement (tagName: string): SVGElement {
  return document.createElementNS('http://www.w3.org/2000/svg', tagName)
}

/**
 * Apply a set of attributes to the given element.
 * The attribute values (when present) will be converted to strings.
 *
 * @param element The SVG element.
 * @param attrs The attributes to apply.
 */
export function applyAttributes (element: SVGElement, attrs: Record<string, AttributeValue>): void {
  for (const key of Object.keys(attrs)) {
    const value = attrs[key]
    if (value == null) continue
    element.setAttribute(key, String(value))
  }
}
