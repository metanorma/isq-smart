import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getPartMeta, isBilingual, getPartEditions, partUrl, EntryModel } from '../data/index'
import { generateEntryJsonLd } from '../data/serialization'
import { entryDualUrn } from '../data/urn'
import { renderInline } from '../data/asciidoc'
import { reverseXref } from '../data/generated/reverse-xref'
import { xrefMap } from '../data/generated/xref-map'
import { units } from '../data/generated/unitsdb'
import { useRecentEntries } from './useRecentEntries'
import { usePartData } from './usePartData'
import { useEntryNav } from './useEntryNav'
import type { Entry, Lang } from '../data/types'
import { accentGlow, accentGradient, accentColors } from './useAccent'

const unitSlugMap = new Map(units.map(u => [u.name, u.slug]))

export function useEntryPage() {
  const route = useRoute()
  const router = useRouter()
  const { track: trackRecent } = useRecentEntries()

  const partParam = computed(() => route.params.part as string)
  const idParam = computed(() => route.params.id as string)
  const domainRoute = computed(() =>
    route.path.startsWith('/math') ? 'math' : 'quantities'
  )

  const meta = computed(() => getPartMeta(partParam.value))
  const bilingual = computed(() => isBilingual(partParam.value))
  const editions = computed(() => getPartEditions(partParam.value))
  const edition = computed(() => editions.value.join(', '))

  const { entries, mathCache, latexCache, loading, initialPromise } = usePartData(partParam)

  const lang = ref<'en' | 'fr' | 'both'>('en')

  const entry = computed(() => entries.value.find(e => e.id === idParam.value))

  watch(entry, (e) => {
    if (e) trackRecent(e, partParam.value)
  }, { immediate: true })

  const jsonLdData = computed(() =>
    entry.value && meta.value ? generateEntryJsonLd(entry.value, meta.value, edition.value) : null
  )

  const dualUrn = computed(() =>
    entry.value && meta.value ? entryDualUrn(entry.value, partParam.value, edition.value) : null
  )

  const { siblings } = useEntryNav(entries, idParam, partParam)

  const sectionEntries = computed(() => {
    if (!entry.value) return []
    const group = EntryModel.sectionGroup(entry.value)
    return entries.value.filter(e => EntryModel.sectionGroup(e) === group)
  })

  const sectionLabel = computed(() =>
    entry.value ? EntryModel.sectionGroup(entry.value) : ''
  )

  const referencedBy = computed(() => {
    if (!entry.value) return []
    const ids = reverseXref[entry.value.id]
    if (!ids) return []
    return ids.map((id: string) => {
      const ref = xrefMap[id]
      return ref ? { id, name: ref.name, href: ref.href } : null
    }).filter(Boolean) as { id: string; name: string; href: string }[]
  })

  function unitLink(name: string): string {
    const slug = unitSlugMap.get(name)
    return slug ? `/units/${slug}` : `/units?q=${encodeURIComponent(name)}`
  }

  function def(e: Entry, l: Lang = 'en') { return EntryModel.definition(e, l, mathCache.value) }
  function rem(e: Entry, l: Lang = 'en') { return EntryModel.remarks(e, l, mathCache.value) }
  function showBoth() { return bilingual.value && lang.value === 'both' }
  function activeLang(): Lang { return lang.value === 'both' ? 'en' : lang.value }
  function renderedName(e: Entry, l: Lang | 'both' = 'en') { return EntryModel.renderedName(e, l, mathCache.value) }
  function desText(text: string) { return renderInline(text, mathCache.value) }
  function stripStem(text: string): string {
    return text.replace(/stem:\[([^\]]+)\]/g, (_, expr) => expr.replace(/^"|"$/g, ''))
  }

  function handleDefClick(e: MouseEvent) {
    const link = (e.target as HTMLElement).closest('a.xref')
    if (link) {
      e.preventDefault()
      router.push((link as HTMLAnchorElement).getAttribute('href')!)
    }
  }

  function symbolGlow() {
    if (!meta.value) return {}
    const { from } = accentColors(meta.value)
    return { boxShadow: `0 0 32px ${from}18, 0 0 64px ${from}0a` }
  }

  function heroGlow() {
    return meta.value ? accentGlow(meta.value, 0.05, 180) : {}
  }

  function defAccent() {
    if (!meta.value) return { background: accentGradient({ accent: 'blue', partKey: '0', domain: 'quantities', title: '', description: '', icon: '' }) }
    return { background: accentGradient(meta.value, 160) }
  }

  function showcasePattern() {
    if (!meta.value) return {}
    const { from } = accentColors(meta.value)
    return {
      backgroundImage: `radial-gradient(circle 1px at center, ${from}08 1px, transparent 1px)`,
      backgroundSize: '24px 24px',
    }
  }

  return {
    route, router, partParam, idParam, domainRoute,
    meta, bilingual, editions, edition,
    entries, mathCache, latexCache, loading, initialPromise,
    lang, entry, jsonLdData, dualUrn,
    siblings, sectionEntries, sectionLabel,
    referencedBy, unitLink,
    def, rem, showBoth, activeLang, renderedName, desText, stripStem,
    handleDefClick,
    symbolGlow, heroGlow, defAccent, showcasePattern,
  }
}
