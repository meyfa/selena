import { LineMarker } from '../renderer.js'
import { applyAttributes, createSvgElement } from './svg-dom.js'

/**
 * Specifies a marker id, whether to fill and/or stroke the marker path, and the marker path data.
 */
interface MarkerDefinition {
  id: string
  fill: boolean
  stroke: boolean
  pathData: string
}

const MARKERS: ReadonlyMap<LineMarker, Readonly<MarkerDefinition>> = new Map([
  [LineMarker.ARROW_OPEN, {
    id: 'lmao',
    fill: false,
    stroke: true,
    pathData: 'M-12,-6 L0,0 L-12,6'
  }],
  [LineMarker.ARROW_FULL, {
    id: 'lmaf',
    fill: true,
    stroke: false,
    pathData: 'M-12,-6 L0,0 L-12,6 Z'
  }],
  [LineMarker.CIRCLE_FULL, {
    id: 'lmcf',
    fill: true,
    stroke: false,
    pathData: 'M-6,0 A6,6 0 1 0 6,0 M-6,0 A6,6 0 1 1 6,0'
  }],
  [LineMarker.ARROW_INTO_CIRCLE_FULL, {
    id: 'lmaicf',
    fill: true,
    stroke: false,
    pathData: 'M-18,-6 L-6,0 L-18,6 Z M-6,0 A6,6 0 1 0 6,0 M-6,0 A6,6 0 1 1 6,0'
  }]
])

/**
 * Build an SVG element from the given marker definition.
 *
 * @param def The marker definition.
 * @param color The color the marker should have.
 * @returns The created marker.
 */
function buildMarker (def: MarkerDefinition, color: string): SVGMarkerElement {
  const marker = createSvgElement('marker') as SVGMarkerElement
  applyAttributes(marker, {
    id: def.id,
    viewBox: '-18 -6 30 12',
    refX: 0,
    refY: 0,
    markerUnits: 'userSpaceOnUse',
    markerWidth: 30,
    markerHeight: 12,
    orient: 'auto'
  })
  const path = createSvgElement('path')
  applyAttributes(path, {
    d: def.pathData,
    fill: def.fill ? color : 'none',
    stroke: def.stroke ? color : 'none',
    'stroke-width': def.stroke ? 2 : 0
  })
  marker.appendChild(path)
  return marker
}

/**
 * This class allows SVG markers to be created lazily and applied to the SVG document's defs tag on-demand.
 */
export class SvgMarkerManager {
  private readonly defs: SVGDefsElement
  private readonly markerColor: string

  private readonly created = new Set<LineMarker>()

  constructor (defs: SVGDefsElement, markerColor: string) {
    this.defs = defs
    this.markerColor = markerColor
  }

  /**
   * Obtain a reference string to a marker, that can be used in marker-start and marker-end attributes.
   * If this is the first time the marker is used, it will be added to the SVG's defs tag.
   *
   * The result might be undefined if no marker definition exists for the given type of marker.
   *
   * @param marker The type of marker to reference.
   * @returns A reference to the marker, or undefined if no marker exists for this type.
   */
  referenceMarker (marker: LineMarker): string | undefined {
    const def = MARKERS.get(marker)
    if (def == null) {
      return undefined
    }
    if (!this.created.has(marker)) {
      this.defs.appendChild(buildMarker(def, this.markerColor))
      this.created.add(marker)
    }
    return `url(#${def.id})`
  }
}
