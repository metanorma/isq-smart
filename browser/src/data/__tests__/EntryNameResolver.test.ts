import { describe, it, expect } from 'vitest'
import { EntryNameResolver } from '../EntryNameResolver'
import type { Entry } from '../types'

function makeEntry(overrides: Partial<Entry> = {}): Entry {
  return {
    _tag: 'quantity',
    id: 't3-1.1',
    num: '3-1.1',
    partKey: '3',
    designations: [
      { designation: { en: { text: 'length' }, fr: { text: 'longueur' } } },
    ],
    def: { en: 'extent in space', fr: 'étendue dans l\'espace' },
    ...overrides,
  } as unknown as Entry
}

describe('EntryNameResolver', () => {
  it('resolves English name', () => {
    expect(EntryNameResolver.resolve(makeEntry(), 'en')).toBe('length')
  })

  it('resolves French name', () => {
    expect(EntryNameResolver.resolve(makeEntry(), 'fr')).toBe('longueur')
  })

  it('resolves both names separated by slash', () => {
    expect(EntryNameResolver.resolve(makeEntry(), 'both')).toBe('length / longueur')
  })

  it('falls back to English only when French is identical', () => {
    const entry = makeEntry({
      designations: [
        { designation: { en: { text: 'length' }, fr: { text: 'length' } } },
      ],
    })
    expect(EntryNameResolver.resolve(entry, 'both')).toBe('length')
  })

  it('joins multiple designations with commas', () => {
    const entry = makeEntry({
      designations: [
        { designation: { en: { text: 'length' } } },
        { designation: { en: { text: 'distance' } } },
      ],
    })
    expect(EntryNameResolver.resolve(entry, 'en')).toBe('length, distance')
  })

  it('plain strips stem wrapper', () => {
    const entry = makeEntry({
      designations: [{ designation: { en: { text: 'stem:[x^2]' } } }],
    })
    expect(EntryNameResolver.plain(entry, 'en')).toBe('x^2')
  })
})
