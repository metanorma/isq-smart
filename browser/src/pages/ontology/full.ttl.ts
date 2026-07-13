import type { APIRoute } from 'astro'
import { ontologyEntities } from '../../data/generated/ontology'
import type { OntologyEntityData } from '../../data/ontologyViewModel'
import { toTurtle } from '../../lib/rdf'

export const GET: APIRoute = () => {
  const entities = ontologyEntities as readonly OntologyEntityData[]
  const turtle = entities
    .filter(e => e.slug && /^[a-zA-Z0-9_-]+$/.test(e.slug))
    .map(e => toTurtle(e))
    .join('\n\n')
  return new Response(turtle, {
    headers: { 'Content-Type': 'text/turtle' },
  })
}
