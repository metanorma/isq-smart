import { writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import type { RawEntry } from '../types'
import type { BuildContext } from '../buildContext'
import type { EntityKind, EntityConcept } from '../../src/data/ontology'

const ENTITY_KIND_CATALOG: Array<{ id: string; en: string; fr: string; patterns: RegExp[] }> = [
  {
    id: 'entity-kind-particle',
    en: 'particle',
    fr: 'particule',
    patterns: [/\bparticle\b/i, /\bsound particle\b/i, /\belectron\b/i, /\bphoton\b/i, /\bproton\b/i, /\bneutron\b/i, /\bion\b/i, /\bnucleus\b/i, /\bnuclide\b/i, /\bradionuclide\b/i],
  },
  {
    id: 'entity-kind-substance',
    en: 'substance',
    fr: 'substance',
    patterns: [/\bsubstance\b/i, /\bsolute\b/i, /\bsolvent\b/i, /\bmixture\b/i, /\bsolution\b/i, /\bmol\b/i],
  },
  {
    id: 'entity-kind-body',
    en: 'physical body',
    fr: 'corps physique',
    patterns: [/\bbody\b/i, /\brod\b/i, /\bobject\b/i, /\bconductor\b/i, /\bwire\b/i, /\bcircuit\b/i],
  },
  {
    id: 'entity-kind-field',
    en: 'field',
    fr: 'champ',
    patterns: [/\bfield\b/i, /\bwave\b/i, /\bradiation\b/i, /\bbeam\b/i],
  },
  {
    id: 'entity-kind-medium',
    en: 'medium',
    fr: 'milieu',
    patterns: [/\bmedium\b/i, /\bmaterial\b/i, /\bmatter\b/i, /\bcristal\b/i, /\blattice\b/i],
  },
  {
    id: 'entity-kind-molecule',
    en: 'molecule',
    fr: 'molécule',
    patterns: [/\bmolecules?\b/i, /\bmolecular\b/i, /\batoms?\b/i, /\batomic\b/i],
  },
  {
    id: 'entity-kind-source',
    en: 'source',
    fr: 'source',
    patterns: [/\bsource\b/i, /\bemitter\b/i, /\bsensor\b/i, /\bdetector\b/i],
  },
  {
    id: 'entity-kind-system',
    en: 'system',
    fr: 'système',
    patterns: [/\bsystem\b/i, /\bthermodynamic system\b/i],
  },
]

const NAMED_ENTITIES: Array<{ id: string; kindId: string; en: string; fr: string; pattern: RegExp }> = [
  { id: 'entity-electron', kindId: 'entity-kind-particle', en: 'electron', fr: 'électron', pattern: /\belectron\b/i },
  { id: 'entity-photon', kindId: 'entity-kind-particle', en: 'photon', fr: 'photon', pattern: /\bphoton\b/i },
  { id: 'entity-proton', kindId: 'entity-kind-particle', en: 'proton', fr: 'proton', pattern: /\bproton\b/i },
  { id: 'entity-neutron', kindId: 'entity-kind-particle', en: 'neutron', fr: 'neutron', pattern: /\bneutron\b/i },
  { id: 'entity-ion', kindId: 'entity-kind-particle', en: 'ion', fr: 'ion', pattern: /\bion\b/i },
  { id: 'entity-nucleus', kindId: 'entity-kind-particle', en: 'nucleus', fr: 'noyau', pattern: /\bnucleus\b/i },
  { id: 'entity-radionuclide', kindId: 'entity-kind-particle', en: 'radionuclide', fr: 'radionucléide', pattern: /\bradionuclide\b/i },
  { id: 'entity-molecule', kindId: 'entity-kind-molecule', en: 'molecule', fr: 'molécule', pattern: /\bmolecules?\b/i },
  { id: 'entity-atom', kindId: 'entity-kind-molecule', en: 'atom', fr: 'atome', pattern: /\batoms?\b/i },
  { id: 'entity-substance', kindId: 'entity-kind-substance', en: 'substance', fr: 'substance', pattern: /\bsubstance\b/i },
  { id: 'entity-solute', kindId: 'entity-kind-substance', en: 'solute', fr: 'soluté', pattern: /\bsolute\b/i },
  { id: 'entity-solvent', kindId: 'entity-kind-substance', en: 'solvent', fr: 'solvant', pattern: /\bsolvent\b/i },
  { id: 'entity-solution', kindId: 'entity-kind-substance', en: 'solution', fr: 'solution', pattern: /\bsolution\b/i },
  { id: 'entity-conductor', kindId: 'entity-kind-body', en: 'conductor', fr: 'conducteur', pattern: /\bconductor\b/i },
  { id: 'entity-wave', kindId: 'entity-kind-field', en: 'wave', fr: 'onde', pattern: /\bwave\b/i },
  { id: 'entity-lattice', kindId: 'entity-kind-medium', en: 'lattice', fr: 'réseau', pattern: /\blattice\b/i },
  { id: 'entity-crystal', kindId: 'entity-kind-medium', en: 'crystal', fr: 'cristal', pattern: /\bcrystal\b/i },
  { id: 'entity-source', kindId: 'entity-kind-source', en: 'source', fr: 'source', pattern: /\bsource\b/i },
]

function entryText(entry: RawEntry): string {
  const designation = entry.designations[0]?.designation.en?.text ?? ''
  const defText = entry.def?.en ?? ''
  const remarks = entry.remarks?.en ?? ''
  return `${designation} ${defText} ${remarks}`
}

export interface EntityBuildResult {
  entityKinds: EntityKind[]
  entities: EntityConcept[]
  quantityEntities: Record<string, string[]>
}

export function buildEntities(
  rawEntries: readonly RawEntry[],
  ctx: BuildContext,
  generatedDir: string,
): EntityBuildResult {
  const entityKinds: EntityKind[] = ENTITY_KIND_CATALOG.map((k) => ({
    id: k.id,
    iri: `isq:${k.id}`,
    level: 1,
    axis: 'entity',
    prefLabel: { en: k.en, fr: k.fr },
  }))

  const entities: EntityConcept[] = NAMED_ENTITIES.map((e) => ({
    id: e.id,
    iri: `isq:${e.id}`,
    level: 2,
    axis: 'entity',
    kindId: e.kindId,
    prefLabel: { en: e.en, fr: e.fr },
  }))

  const quantityEntities: Record<string, string[]> = {}

  for (const entry of rawEntries) {
    if (ctx.isExcluded(entry.part.toString())) continue
    const text = entryText(entry)
    const matchedEntityIds = new Set<string>()

    for (const named of NAMED_ENTITIES) {
      if (named.pattern.test(text)) {
        matchedEntityIds.add(named.id)
      }
    }

    if (matchedEntityIds.size > 0) {
      quantityEntities[entry.id] = [...matchedEntityIds].sort()
    }
  }

  writeFileSync(
    resolve(generatedDir, 'entities.ts'),
    `import type { EntityKind, EntityConcept } from '../ontology'\n`
    + `export const entityKinds: EntityKind[] = ${JSON.stringify(entityKinds, null, 2)}\n`
    + `export const entities: EntityConcept[] = ${JSON.stringify(entities, null, 2)}\n`
    + `export const quantityEntities: Record<string, string[]> = ${JSON.stringify(quantityEntities, null, 2)}\n`,
  )

  return { entityKinds, entities, quantityEntities }
}
