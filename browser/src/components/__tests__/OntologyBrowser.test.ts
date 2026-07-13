import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import OntologyBrowser from '../OntologyBrowser.vue'
import { ontologyEntities, ontologyPrefixes, ontologyTypeMeta, ontologyNamespaces, ontologyImportChain } from '../../data/generated/ontology'

interface Entity {
  uri: string
  qname: string
  slug: string
  label: string
  description: string
  ontology: string
  type: string
  scopeNote?: string
  example?: string
  altLabel?: string
  seeAlso?: string[]
  parent?: string
  domain?: string[]
  range?: string[]
  functional?: boolean
  targetClass?: string
  targetSubjectsOf?: string
  targetObjectsOf?: string
  constraints?: { path: string; minCount?: number; maxCount?: number; datatype?: string; nodeKind?: string; classValue?: string; hasValue?: string; uniqueLang?: boolean }[]
  scheme?: string
  instanceOf?: string[]
  topConcepts?: string[]
  version?: string
  imports?: string[]
  isPartOf?: string[]
  identifier?: string
}

const allEntities = ontologyEntities as readonly Entity[]
const typeMeta = ontologyTypeMeta as unknown as Record<string, { label: string; color: string; colorDot: string }>

// Build the same derived data as the Astro frontmatter
const primaryQname = Object.keys(ontologyImportChain)[0]
const primaryOntology = ontologyNamespaces.find(n => n.prefix === primaryQname!.split(':')[0])!
const importedQnames = (ontologyImportChain as unknown as Record<string, { imports: string[] }>)[primaryQname!]?.imports ?? []
const importedOntologies = importedQnames.map(iq => ontologyNamespaces.find(n => n.prefix === iq.split(':')[0])!).filter(Boolean)

const namespaceGroups = (() => {
  const groups = new Map<string, { prefix: string; uri: string; entities: Entity[] }>()
  for (const ns of ontologyPrefixes) {
    const pfx = ns.prefix
    const entities = allEntities.filter(e => e.qname.startsWith(pfx + ':'))
    if (entities.length > 0) {
      groups.set(pfx, { prefix: pfx, uri: ns.uri, entities })
    }
  }
  return [...groups.values()].sort((a, b) => b.entities.length - a.entities.length)
})()

const allClasses = allEntities.filter(e => e.type === 'class' && e.ontology !== 'external')
const classes = allEntities.filter(e => e.type === 'class')
const objProps = allEntities.filter(e => e.type === 'objectProperty')
const dtProps = allEntities.filter(e => e.type === 'datatypeProperty')
const annProps = allEntities.filter(e => e.type === 'annotationProperty')
const shapes = allEntities.filter(e => e.type === 'shape')
const concepts = allEntities.filter(e => e.type === 'concept')
const conceptSchemes = allEntities.filter(e => e.type === 'conceptScheme')
const individuals = allEntities.filter(e => e.type === 'individual')
const ontologies = allEntities.filter(e => e.type === 'ontology')
const rootClasses = allClasses.filter(c => !c.parent)

const chartTypes = Object.keys(ontologyTypeMeta).filter(t => allEntities.some(e => e.type === t))
const chartTypeCounts = chartTypes.map(t => allEntities.filter(e => e.type === t).length)
const chartTypeLabels = chartTypes.map(t => typeMeta[t]?.label || t)
const chartColors: Record<string, string> = {
  class: '#3b82f6',
  objectProperty: '#22c55e',
  datatypeProperty: '#84cc16',
  annotationProperty: '#f59e0b',
  shape: '#a855f7',
  concept: '#14b8a6',
  conceptScheme: '#06b6d4',
  individual: '#f97316',
  ontology: '#6366f1',
  external: '#94a3b8',
}
const chartTypeColors = chartTypes.map(t => chartColors[t] || '#94a3b8')

const ontoLabels = ['isq', 'smart', 'external'].filter(o => allEntities.some(e => e.ontology === o))
const ontoCounts = ontoLabels.map(o => allEntities.filter(e => e.ontology === o).length)
const ontoColors = ontoLabels.map(o => o === 'isq' ? '#3b82f6' : o === 'smart' ? '#10b981' : '#94a3b8')
const ontoDisplayLabels = ontoLabels.map(o => o === 'isq' ? 'ISO & IEC 80000' : o === 'smart' ? 'SMART Core' : 'External')

function mountBrowser() {
  return mount(OntologyBrowser, {
    props: {
      allEntities,
      allClasses,
      classes,
      objProps,
      dtProps,
      annProps,
      shapes,
      concepts,
      conceptSchemes,
      individuals,
      ontologies,
      rootClasses,
      namespaceGroups,
      ontologyPrefixes,
      ontologyNamespaces,
      typeMeta,
      primaryOntology,
      importedOntologies,
      chartTypeLabels,
      chartTypeCounts,
      chartTypeColors,
      ontoDisplayLabels,
      ontoCounts,
      ontoColors,
    },
    global: {
      stubs: {
        // Stub OntologyCharts to avoid canvas/Chart.js issues in test env
        OntologyCharts: { template: '<div class="stub-charts"></div>' },
      },
    },
  })
}

// Helper: find a tab button by its text label
function findTabBtn(wrapper: ReturnType<typeof mountBrowser>, label: string) {
  return wrapper.findAll('button').find(b => b.text().trim() === label)
}

describe('OntologyBrowser', () => {
  describe('tab switching', () => {
    it('renders the Overview tab by default', () => {
      const wrapper = mountBrowser()
      // Overview section should be visible (not display:none)
      const overviewSection = wrapper.find('[data-section="overview"]')
      // v-show uses display:none, so visible means no display:none style
      expect(overviewSection.exists()).toBe(true)
      // The overview section should contain class hierarchy heading
      expect(wrapper.text()).toContain('Class Hierarchy')
    })

    it('renders all section tab buttons', () => {
      const wrapper = mountBrowser()
      const expectedLabels = [
        'Overview', 'Namespaces', 'Entities A-Z', 'Classes',
        'Properties', 'SKOS', 'Shapes', 'Individuals', 'Statistics',
      ]
      for (const label of expectedLabels) {
        expect(findTabBtn(wrapper, label)).toBeTruthy()
      }
    })

    it('switches to the Classes tab when clicked', async () => {
      const wrapper = mountBrowser()
      await findTabBtn(wrapper, 'Classes')!.trigger('click')
      // Classes table header should be visible in the classes section
      const classesSection = wrapper.find('[data-section="classes"]')
      expect(classesSection.exists()).toBe(true)
      // Default ontology filter is 'isq'; find an isq class that should be visible
      const firstIsqClass = classes.find(c => c.ontology === 'isq')!
      const classLinks = classesSection.findAll('a')
      const qnameLink = classLinks.find(a => a.text() === firstIsqClass.qname)
      expect(qnameLink).toBeTruthy()
    })

    it('switches to the Statistics tab when clicked', async () => {
      const wrapper = mountBrowser()
      await findTabBtn(wrapper, 'Statistics')!.trigger('click')
      expect(wrapper.text()).toContain('Total Entities')
    })

    it('switches to the Namespaces tab when clicked', async () => {
      const wrapper = mountBrowser()
      await findTabBtn(wrapper, 'Namespaces')!.trigger('click')
      // Should show the namespaces section with entity counts
      const nsSection = wrapper.find('[data-section="namespaces"]')
      expect(nsSection.exists()).toBe(true)
      expect(nsSection.text()).toContain('entities')
    })

    it('switches to the Properties tab when clicked', async () => {
      const wrapper = mountBrowser()
      await findTabBtn(wrapper, 'Properties')!.trigger('click')
      const propsSection = wrapper.find('[data-section="properties"]')
      expect(propsSection.exists()).toBe(true)
      expect(propsSection.text()).toContain('Object Properties')
      expect(propsSection.text()).toContain('Datatype Properties')
      expect(propsSection.text()).toContain('Annotation Properties')
    })

    it('shows the entity filter input only on filterable tabs', async () => {
      const wrapper = mountBrowser()

      // Overview tab: filter wrapper is hidden (v-show=false => display:none)
      await findTabBtn(wrapper, 'Overview')!.trigger('click')
      const filterInputOverview = wrapper.find('input[placeholder="Filter entities..."]')
      // The input exists in DOM (v-show keeps it) but its parent should be hidden
      const filterWrapper = filterInputOverview.element.closest('.relative.max-w-xs')
      expect(filterWrapper).toBeTruthy()
      // On Overview, the parent should have display:none style
      expect(filterWrapper!.getAttribute('style')).toContain('display: none')

      // Classes tab: filter wrapper visible
      await findTabBtn(wrapper, 'Classes')!.trigger('click')
      const filterInputClasses = wrapper.find('input[placeholder="Filter entities..."]')
      const filterWrapperClasses = filterInputClasses.element.closest('.relative.max-w-xs')
      // Should NOT have display:none
      const styleClasses = filterWrapperClasses!.getAttribute('style') || ''
      expect(styleClasses).not.toContain('display: none')
    })

    it('shows the ontology filter only on ontology-filterable tabs', async () => {
      const wrapper = mountBrowser()

      // Overview tab: ontology filter hidden
      await findTabBtn(wrapper, 'Overview')!.trigger('click')
      // The ontology filter buttons ("ISO & IEC 80000", "SMART Core", "All")
      // are inside a container that has v-show. On overview it should be hidden.
      const ontologyFilterContainer = wrapper.find('.flex.gap-1.p-1.rounded-lg')
      const styleOverview = ontologyFilterContainer.element.getAttribute('style') || ''
      expect(styleOverview).toContain('display: none')

      // Classes tab: ontology filter visible
      await findTabBtn(wrapper, 'Classes')!.trigger('click')
      const styleClasses = ontologyFilterContainer.element.getAttribute('style') || ''
      expect(styleClasses).not.toContain('display: none')
    })
  })

  describe('entity text filtering', () => {
    it('filters classes by label when typing in the search box', async () => {
      const wrapper = mountBrowser()
      await findTabBtn(wrapper, 'Classes')!.trigger('click')

      const classesSection = wrapper.find('[data-section="classes"]')
      const beforeRows = classesSection.findAll('tbody tr').length
      expect(beforeRows).toBeGreaterThan(0)

      // Search for a specific isq class label (isq is the default ontology filter)
      const searchInput = wrapper.find('input[placeholder="Filter entities..."]')
      const targetClass = classes.find(c => c.ontology === 'isq' && c.label.length > 0)!
      await searchInput.setValue(targetClass.label)

      const afterRows = classesSection.findAll('tbody tr').length
      expect(afterRows).toBeLessThanOrEqual(beforeRows)
      expect(afterRows).toBeGreaterThanOrEqual(1)
      expect(classesSection.text()).toContain(targetClass.label)
    })

    it('filters classes by qname when typing in the search box', async () => {
      const wrapper = mountBrowser()
      await findTabBtn(wrapper, 'Classes')!.trigger('click')

      const classesSection = wrapper.find('[data-section="classes"]')
      // Use an isq class since default ontology filter is 'isq'
      const targetClass = classes.find(c => c.ontology === 'isq')!
      // Search by qname local part
      const qnamePart = targetClass.qname.split(':')[1] ?? targetClass.qname
      const searchInput = wrapper.find('input[placeholder="Filter entities..."]')
      await searchInput.setValue(qnamePart.toLowerCase())

      // The target class should still be visible in the classes section
      expect(classesSection.text()).toContain(targetClass.qname)
    })

    it('shows no entities when search matches nothing', async () => {
      const wrapper = mountBrowser()
      await findTabBtn(wrapper, 'Classes')!.trigger('click')

      const searchInput = wrapper.find('input[placeholder="Filter entities..."]')
      await searchInput.setValue('zzzzzz_no_match_anywhere')

      const classesSection = wrapper.find('[data-section="classes"]')
      const rows = classesSection.findAll('tbody tr')
      expect(rows.length).toBe(0)
    })

    it('filters entities in the A-Z tab', async () => {
      const wrapper = mountBrowser()
      await findTabBtn(wrapper, 'Entities A-Z')!.trigger('click')

      const azSection = wrapper.find('[data-section="az"]')
      // Get initial link count within the A-Z section only
      const beforeLinks = azSection.findAll('a').length
      expect(beforeLinks).toBeGreaterThan(0)

      // Search for a known isq entity (default ontology filter is 'isq')
      const targetEntity = allEntities.find(e => e.ontology === 'isq')!
      const searchInput = wrapper.find('input[placeholder="Filter entities..."]')
      await searchInput.setValue(targetEntity.label)

      const afterLinks = azSection.findAll('a').length
      expect(afterLinks).toBeLessThanOrEqual(beforeLinks)
      expect(afterLinks).toBeGreaterThanOrEqual(1)
    })
  })

  describe('ontology filter', () => {
    it('filters classes to isq ontology by default', async () => {
      const wrapper = mountBrowser()
      await findTabBtn(wrapper, 'Classes')!.trigger('click')

      // Default is 'isq', so all visible class rows should have ontology 'isq'
      const classesSection = wrapper.find('[data-section="classes"]')
      const rows = classesSection.findAll('tbody tr')
      expect(rows.length).toBeGreaterThan(0)

      // Each row's last cell should contain the ontology badge text 'isq'
      for (const row of rows) {
        const cells = row.findAll('td')
        const ontologyCell = cells[cells.length - 1]
        expect(ontologyCell.text().trim()).toBe('isq')
      }
    })

    it('switches ontology filter to smart and shows smart entities', async () => {
      const wrapper = mountBrowser()
      await findTabBtn(wrapper, 'Classes')!.trigger('click')

      // Click the "SMART Core" ontology filter button
      await findTabBtn(wrapper, 'SMART Core')!.trigger('click')

      const classesSection = wrapper.find('[data-section="classes"]')
      const rows = classesSection.findAll('tbody tr')
      expect(rows.length).toBeGreaterThan(0)

      // All visible rows should have 'smart' ontology badge
      for (const row of rows) {
        const cells = row.findAll('td')
        const ontologyCell = cells[cells.length - 1]
        expect(ontologyCell.text().trim()).toBe('smart')
      }
    })

    it('switches ontology filter to all and shows more entities', async () => {
      const wrapper = mountBrowser()
      await findTabBtn(wrapper, 'Classes')!.trigger('click')

      // Default is isq: count rows
      const classesSection = wrapper.find('[data-section="classes"]')
      const isqRows = classesSection.findAll('tbody tr').length

      // Switch to "All"
      await findTabBtn(wrapper, 'All')!.trigger('click')
      const allRows = classesSection.findAll('tbody tr').length

      // "All" should show at least as many as isq-only
      expect(allRows).toBeGreaterThanOrEqual(isqRows)
    })

    it('combines text filter and ontology filter', async () => {
      const wrapper = mountBrowser()
      await findTabBtn(wrapper, 'Classes')!.trigger('click')

      // Set ontology to smart
      await findTabBtn(wrapper, 'SMART Core')!.trigger('click')

      // Also search for something
      const smartClass = classes.find(c => c.ontology === 'smart')!
      const searchInput = wrapper.find('input[placeholder="Filter entities..."]')
      await searchInput.setValue(smartClass.label)

      const classesSection = wrapper.find('[data-section="classes"]')
      const rows = classesSection.findAll('tbody tr')
      expect(rows.length).toBeGreaterThanOrEqual(1)
      expect(classesSection.text()).toContain(smartClass.label)

      // Should still be smart ontology
      for (const row of rows) {
        const cells = row.findAll('td')
        const ontologyCell = cells[cells.length - 1]
        expect(ontologyCell.text().trim()).toBe('smart')
      }
    })
  })
})
