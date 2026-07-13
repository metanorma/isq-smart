import type { OntologyEntityData } from '../data/ontologyViewModel'

function safeName(qname: string): string {
  return qname.replace(/[:.-]/g, '_')
}

export function generateClassDiagram(
  entities: readonly OntologyEntityData[],
): string {
  const classes = entities.filter(e => e.type === 'class')
  const lines: string[] = ['classDiagram']

  const ontologyStyles: Record<string, string> = {
    isq: 'stroke #E30613,fill #fef2f2',
    smart: 'stroke #059669,fill #ecfdf5',
    external: 'stroke #94a3b8,fill #f8fafc',
  }

  const relationships = new Set<string>()

  for (const cls of classes) {
    if (cls.parent && classes.some(c => c.qname === cls.parent)) {
      const parentName = safeName(cls.parent!)
      const childName = safeName(cls.qname)
      relationships.add(`  ${parentName} <|-- ${childName}`)
    }
  }

  for (const rel of [...relationships].sort()) {
    lines.push(rel)
  }

  lines.push('')

  for (const cls of classes) {
    const name = safeName(cls.qname)
    const style = ontologyStyles[cls.ontology] ?? ontologyStyles.external
    lines.push(`  class ${name} {`)
    lines.push(`    <<owl:Class>>`)
    lines.push(`    +${cls.qname}`)
    if (cls.description) lines.push(`    ${cls.description.slice(0, 60)}`)
    lines.push(`  }`)
    lines.push(`  style ${name} ${style}`)
  }

  for (const cls of classes) {
    const name = safeName(cls.qname)
    const slug = cls.slug || cls.qname.replace(/:/g, '-')
    lines.push(`  click ${name} "${slug}" "View ${cls.label}"`)
  }

  return lines.join('\n')
}

export function generatePropertyDiagram(
  entities: readonly OntologyEntityData[],
): string {
  const properties = entities.filter(
    e => e.type === 'objectProperty' || e.type === 'datatypeProperty' || e.type === 'annotationProperty',
  )
  const lines: string[] = ['classDiagram']

  const relationships = new Set<string>()

  for (const prop of properties) {
    for (const dom of prop.domain ?? []) {
      for (const rng of prop.range ?? []) {
        const domName = safeName(dom)
        const rngName = safeName(rng)
        relationships.add(`  ${domName} ..> ${rngName} : ${prop.label}`)
      }
    }
  }

  for (const rel of [...relationships].sort()) {
    lines.push(rel)
  }

  return lines.join('\n')
}
