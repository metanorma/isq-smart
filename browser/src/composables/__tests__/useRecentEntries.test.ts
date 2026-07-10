import { describe, it, expect, beforeEach } from 'vitest'
import { useRecentEntries } from '../useRecentEntries'
import type { Entry } from '../../data/types'

beforeEach(() => {
  localStorage.clear()
  useRecentEntries().clear()
})

function mkEntry(id: string, num: string, text?: string): Entry {
  return {
    _tag: 'quantity' as const,
    partKey: '3',
    edition: '2019',
    id,
    num,
    designations: [{ designation: { en: { text: text ?? `Entry ${num}` } } }],
    def: { en: 'x' },
  }
}

describe('useRecentEntries.track', () => {
  it('adds a new entry to the top of the list', () => {
    const { recent, track } = useRecentEntries()
    track(mkEntry('4-1', '4-1', 'length'), '3')
    expect(recent.value).toHaveLength(1)
    expect(recent.value[0]!.id).toBe('4-1')
    expect(recent.value[0]!.name).toBe('length')
    expect(recent.value[0]!.href).toBe('/quantities/part-3/4-1')
  })

  it('routes math-domain entries to /math/', () => {
    const { recent, track } = useRecentEntries()
    track(mkEntry('2-1', '2-1'), '2-1')
    expect(recent.value[0]!.href).toBe('/math/part-2-1/2-1')
  })

  it('moves a re-tracked entry to the top instead of duplicating', () => {
    const { recent, track } = useRecentEntries()
    track(mkEntry('4-1', '4-1'), '3')
    track(mkEntry('4-2', '4-2'), '3')
    track(mkEntry('4-1', '4-1'), '3')
    expect(recent.value).toHaveLength(2)
    expect(recent.value[0]!.id).toBe('4-1')
  })

  it('caps the list at 12 entries', () => {
    const { recent, track } = useRecentEntries()
    for (let i = 1; i <= 15; i++) track(mkEntry(`4-${i}`, `4-${i}`), '3')
    expect(recent.value).toHaveLength(12)
    expect(recent.value[0]!.id).toBe('4-15')
    expect(recent.value[11]!.id).toBe('4-4')
  })

  it('falls back to id when designation text is missing', () => {
    const { recent, track } = useRecentEntries()
    const e: Entry = {
      _tag: 'quantity' as const,
      partKey: '3',
      edition: '2019',
      id: '4-9',
      num: '4-9',
      designations: [],
      def: { en: 'x' },
    }
    track(e, '3')
    expect(recent.value[0]!.name).toBe('4-9')
  })

  it('persists to localStorage', () => {
    const { track } = useRecentEntries()
    track(mkEntry('4-1', '4-1'), '3')
    const raw = JSON.parse(localStorage.getItem('recent-entries') || '[]')
    expect(raw).toHaveLength(1)
    expect(raw[0].id).toBe('4-1')
  })
})

describe('useRecentEntries.clear', () => {
  it('empties the list and removes the storage key', () => {
    const { recent, track, clear } = useRecentEntries()
    track(mkEntry('4-1', '4-1'), '3')
    expect(recent.value).toHaveLength(1)
    clear()
    expect(recent.value).toHaveLength(0)
    expect(localStorage.getItem('recent-entries')).toBeNull()
  })
})
