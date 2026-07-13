/**
 * Shared types for the units/dimensions build pipeline stages.
 *
 * `IsoUnit` is produced by `buildUnits` and enriched in-place by
 * `buildDimensions` (which attaches `dimensionRef` / `dimensionSlug`).
 *
 * The `Unitsml*Yaml` interfaces describe the shape of the YAML files
 * from the `unitsdb` repository, replacing former `as any` casts.
 */

// ── Shared build output type ──

export interface IsoUnit {
  slug: string
  name: string
  symbols: string[]
  quantityCount: number
  parts: string[]
  sampleQuantities: { id: string; num: string; name: string; part: string }[]
  quantities: { id: string; num: string; name: string; part: string }[]
  nistId?: string
  unitsmlId?: string
  refs?: { authority: string; uri: string; type: string }[]
  unitSystems?: string[]
  scaleRef?: string
  root?: boolean
  quantityRefs?: string[]
  // Enriched by buildDimensions in-place:
  dimensionRef?: string
  dimensionSlug?: string
}

// ── unitsdb YAML shapes ──

export interface UnitsmlIdentifier {
  type: string
  id: string
}

export interface UnitsmlName {
  value: string
  lang: string
}

export interface UnitsmlReference {
  type: string
  authority: string
  uri: string
}

export interface UnitsmlUnitSystemRef {
  type: string
  id?: string
}

export interface UnitsmlScaleRef {
  type: string
  id: string
}

export interface UnitsmlQuantityRef {
  type: string
  id: string
}

/** Top-level units.yaml: `{ units: [...] }` */
export interface UnitsmlYaml {
  units: UnitsmlUnit[]
}

export interface UnitsmlUnit {
  identifiers?: UnitsmlIdentifier[]
  names?: UnitsmlName[]
  short: string
  quantity_references?: UnitsmlQuantityRef[]
  references?: UnitsmlReference[]
  unit_system_reference?: UnitsmlUnitSystemRef[]
  scale_reference?: UnitsmlScaleRef
  root?: boolean
}

/** Top-level dimensions.yaml: `{ dimensions: [...] }` */
export interface DimensionsYaml {
  dimensions: UnitsmlDimension[]
}

export interface UnitsmlDimension {
  identifiers: UnitsmlIdentifier[]
  names: UnitsmlName[]
  short: string
  dimensionless?: boolean
  length?: { power: number; symbol: string }
  mass?: { power: number; symbol: string }
  time?: { power: number; symbol: string }
  electric_current?: { power: number; symbol: string }
  thermodynamic_temperature?: { power: number; symbol: string }
  amount_of_substance?: { power: number; symbol: string }
  luminous_intensity?: { power: number; symbol: string }
  plane_angle?: { power: number; symbol: string }
  references?: UnitsmlReference[]
}

/** Top-level quantities.yaml: `{ quantities: [...] }` */
export interface QuantitiesYaml {
  quantities: UnitsmlQuantity[]
}

export interface UnitsmlQuantity {
  dimension_reference: { type: string; id: string }
  identifiers: UnitsmlIdentifier[]
  names: UnitsmlName[]
  short: string
  quantity_type: string
}
