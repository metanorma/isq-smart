import type { OntologyEntityData } from '../data/ontologyViewModel'

function safeName(qname: string): string {
  return qname.replace(/[:.-]/g, '_')
}

const BASE = '/isq-smart/ontology'

export interface MermaidDiagramSpec {
  title: string
  description: string
  chart: string
}

export function generateOntologyDiagrams(
  entities: readonly OntologyEntityData[],
): MermaidDiagramSpec[] {
  const diagrams: MermaidDiagramSpec[] = []

  const classes = entities.filter(e => e.type === 'class')
  const objProps = entities.filter(e => e.type === 'objectProperty')
  const dtProps = entities.filter(e => e.type === 'datatypeProperty')
  const annProps = entities.filter(e => e.type === 'annotationProperty')

  // 1. Main class hierarchy
  diagrams.push({
    title: 'Class Hierarchy',
    description: 'All OWL classes with rdfs:subClassOf inheritance',
    chart: generateClassHierarchy(classes),
  })

  // 2. ISQ domain model
  diagrams.push({
    title: 'ISQ Domain Model',
    description: 'Quantity, Unit, Dimension, and MathConcept relationships',
    chart: generateIsqDomainDiagram(classes, objProps, dtProps, annProps),
  })

  // 3. SMART Core provision model
  diagrams.push({
    title: 'SMART Core — Provision Model',
    description: 'Provision hierarchy and document structure',
    chart: generateProvisionDiagram(classes, objProps),
  })

  // 4. SMART Core term model
  diagrams.push({
    title: 'SMART Core — Term Model',
    description: 'TermEntry, Term, and designation relationships',
    chart: generateTermDiagram(classes, objProps, dtProps, annProps),
  })

  // 5. Full property relationship diagram
  diagrams.push({
    title: 'Property Relationships',
    description: 'Domain-range links for all object properties',
    chart: generatePropertyDiagram(classes, objProps),
  })

  return diagrams.filter(d => d.chart.trim().split('\n').length > 2)
}

function classBox(cls: OntologyEntityData): string[] {
  const name = safeName(cls.qname)
  const lines: string[] = []
  lines.push(`  class ${name} {`)
  lines.push(`    <<owl:Class>>`)
  lines.push(`    ${cls.qname}`)
  if (cls.description) {
    const desc = cls.description.replace(/\n/g, ' ').slice(0, 60)
    lines.push(`    ${desc}`)
  }
  lines.push(`  }`)
  return lines
}

function styleLine(cls: OntologyEntityData): string {
  const name = safeName(cls.qname)
  const styles: Record<string, string> = {
    isq: 'stroke #E30613,fill #fef2f2,color #9b040c',
    smart: 'stroke #059669,fill #ecfdf5,color #065f46',
    external: 'stroke #94a3b8,fill #f8fafc,color #475569',
  }
  const style = styles[cls.ontology] ?? styles.external
  return `  style ${name} ${style}`
}

function clickLine(cls: OntologyEntityData): string {
  const name = safeName(cls.qname)
  const slug = cls.slug || cls.qname.replace(/:/g, '-')
  return `  click ${name} href "${BASE}/${slug}"`
}

function generateClassHierarchy(classes: OntologyEntityData[]): string {
  const lines: string[] = ['classDiagram']
  const rels = new Set<string>()

  for (const cls of classes) {
    if (cls.parent && classes.some(c => c.qname === cls.parent)) {
      rels.add(`  ${safeName(cls.parent!)} <|-- ${safeName(cls.qname)}`)
    }
  }
  lines.push(...[...rels].sort(), '')

  for (const cls of classes) {
    lines.push(...classBox(cls))
    lines.push(styleLine(cls))
    lines.push(clickLine(cls))
  }

  return lines.join('\n')
}

function generateIsqDomainDiagram(
  classes: OntologyEntityData[],
  objProps: OntologyEntityData[],
  dtProps: OntologyEntityData[],
  annProps: OntologyEntityData[],
): string {
  const isqClasses = classes.filter(c => c.ontology === 'isq' || c.qname === 'smart:TermEntry' || c.qname === 'smart:Entity')
  const relevantProps = [...objProps, ...dtProps, ...annProps].filter(
    p => p.domain?.some(d => isqClasses.some(c => c.qname === d)) ||
         p.range?.some(r => isqClasses.some(c => c.qname === r)),
  )

  const lines: string[] = ['classDiagram']

  // Inheritance
  for (const cls of isqClasses) {
    if (cls.parent && isqClasses.some(c => c.qname === cls.parent)) {
      lines.push(`  ${safeName(cls.parent!)} <|-- ${safeName(cls.qname)}`)
    }
  }

  // Property relationships with labels
  for (const prop of relevantProps) {
    const label = prop.label || prop.qname.split(':').pop() || prop.qname
    for (const dom of prop.domain ?? []) {
      for (const rng of prop.range ?? []) {
        if (isqClasses.some(c => c.qname === dom) && classes.some(c => c.qname === rng)) {
          lines.push(`  ${safeName(dom)} --> ${safeName(rng)} : ${label}`)
        }
      }
    }
    // Datatype properties: domain → string
    if (prop.type === 'datatypeProperty' || prop.type === 'annotationProperty') {
      for (const dom of prop.domain ?? []) {
        if (isqClasses.some(c => c.qname === dom)) {
          lines.push(`  ${safeName(dom)} .. ${safeName(dom)}_data : ${label}`)
          lines.push(`  class ${safeName(dom)}_data {`)
          lines.push(`    <<datatype>>`)
          lines.push(`    ${prop.range?.[0] ?? 'xsd:string'}`)
          lines.push(`  }`)
        }
      }
    }
  }

  lines.push('')
  for (const cls of isqClasses) {
    lines.push(...classBox(cls))
    lines.push(styleLine(cls))
    lines.push(clickLine(cls))
  }

  return lines.join('\n')
}

function generateProvisionDiagram(
  classes: OntologyEntityData[],
  objProps: OntologyEntityData[],
): string {
  const provisionClasses = classes.filter(c =>
    c.qname === 'smart:Entity' ||
    c.qname.startsWith('smart:Provision') ||
    c.qname.startsWith('smart:Publication') ||
    c.qname === 'smart:Clause',
  )

  const lines: string[] = ['classDiagram']

  for (const cls of provisionClasses) {
    if (cls.parent && provisionClasses.some(c => c.qname === cls.parent)) {
      lines.push(`  ${safeName(cls.parent!)} <|-- ${safeName(cls.qname)}`)
    }
  }

  // Property relationships
  const relevantProps = objProps.filter(
    p => p.domain?.some(d => provisionClasses.some(c => c.qname === d)),
  )
  for (const prop of relevantProps) {
    const label = prop.label || prop.qname.split(':').pop() || prop.qname
    for (const dom of prop.domain ?? []) {
      for (const rng of prop.range ?? []) {
        if (provisionClasses.some(c => c.qname === dom) && classes.some(c => c.qname === rng)) {
          lines.push(`  ${safeName(dom)} --> ${safeName(rng)} : ${label}`)
        }
      }
    }
  }

  lines.push('')
  for (const cls of provisionClasses) {
    lines.push(...classBox(cls))
    lines.push(styleLine(cls))
    lines.push(clickLine(cls))
  }

  return lines.join('\n')
}

function generateTermDiagram(
  classes: OntologyEntityData[],
  objProps: OntologyEntityData[],
  dtProps: OntologyEntityData[],
  annProps: OntologyEntityData[],
): string {
  const termClasses = classes.filter(c =>
    c.qname === 'smart:Entity' ||
    c.qname === 'smart:TermEntry' ||
    c.qname === 'smart:Term' ||
    c.ontology === 'isq',
  )

  const lines: string[] = ['classDiagram']

  for (const cls of termClasses) {
    if (cls.parent && termClasses.some(c => c.qname === cls.parent)) {
      lines.push(`  ${safeName(cls.parent!)} <|-- ${safeName(cls.qname)}`)
    }
  }

  const allProps = [...objProps, ...dtProps, ...annProps]
  const relevantProps = allProps.filter(
    p => p.domain?.some(d => termClasses.some(c => c.qname === d)),
  )
  for (const prop of relevantProps.slice(0, 20)) {
    const label = prop.label || prop.qname.split(':').pop() || prop.qname
    for (const dom of prop.domain ?? []) {
      for (const rng of prop.range ?? []) {
        if (termClasses.some(c => c.qname === dom)) {
          if (classes.some(c => c.qname === rng)) {
            lines.push(`  ${safeName(dom)} --> ${safeName(rng)} : ${label}`)
          } else {
            lines.push(`  ${safeName(dom)} .. ${safeName(dom)}_${safeName(prop.qname)} : ${label}`)
            lines.push(`  class ${safeName(dom)}_${safeName(prop.qname)} {`)
            lines.push(`    <<datatype>>`)
            lines.push(`    ${rng}`)
            lines.push(`  }`)
          }
        }
      }
    }
  }

  lines.push('')
  for (const cls of termClasses) {
    lines.push(...classBox(cls))
    lines.push(styleLine(cls))
    lines.push(clickLine(cls))
  }

  return lines.join('\n')
}

function generatePropertyDiagram(
  classes: OntologyEntityData[],
  objProps: OntologyEntityData[],
): string {
  const lines: string[] = ['classDiagram']
  const rels = new Set<string>()

  for (const prop of objProps) {
    const label = prop.label || prop.qname.split(':').pop() || prop.qname
    for (const dom of prop.domain ?? []) {
      for (const rng of prop.range ?? []) {
        rels.add(`  ${safeName(dom)} --> ${safeName(rng)} : ${label}`)
      }
    }
  }

  lines.push(...[...rels].sort())

  // Add minimal class boxes for referenced types
  const referenced = new Set<string>()
  for (const prop of objProps) {
    for (const d of prop.domain ?? []) referenced.add(d)
    for (const r of prop.range ?? []) referenced.add(r)
  }
  for (const qname of [...referenced].sort()) {
    const cls = classes.find(c => c.qname === qname)
    const name = safeName(qname)
    lines.push(`  class ${name} {`)
    lines.push(`    <<owl:Class>>`)
    lines.push(`    ${qname}`)
    lines.push(`  }`)
    if (cls) {
      lines.push(styleLine(cls))
      lines.push(clickLine(cls))
    } else {
      lines.push(`  style ${name} stroke #94a3b8,fill #f8fafc,color #475569`)
    }
  }

  return lines.join('\n')
}
