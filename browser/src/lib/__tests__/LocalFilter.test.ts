import { describe, it, expect } from 'vitest'
import { LocalFilter } from '../LocalFilter'

interface TestItem {
  id: string
  name: string
  tags: string[]
}

const items: TestItem[] = [
  { id: '1', name: 'length', tags: ['l', 'L'] },
  { id: '2', name: 'width', tags: ['b'] },
  { id: '3', name: 'mass', tags: ['m', 'M'] },
]

const filter = new LocalFilter(items, ['name', 'tags'])

describe('LocalFilter', () => {
  it('returns all items for empty query', () => {
    expect(filter.filter('')).toHaveLength(3)
  })

  it('returns all items for whitespace query', () => {
    expect(filter.filter('   ')).toHaveLength(3)
  })

  it('filters by name field', () => {
    expect(filter.filter('length')).toHaveLength(1)
    expect(filter.filter('length')[0].name).toBe('length')
  })

  it('filters by array field (tags)', () => {
    expect(filter.filter('m')).toHaveLength(1)
    expect(filter.filter('m')[0].name).toBe('mass')
  })

  it('is case-insensitive', () => {
    expect(filter.filter('LENGTH')).toHaveLength(1)
    expect(filter.filter('Mass')).toHaveLength(1)
  })

  it('returns empty array when no match', () => {
    expect(filter.filter('nonexistent')).toHaveLength(0)
  })

  it('paginates results', () => {
    expect(filter.paginate(items, 2)).toHaveLength(2)
    expect(filter.paginate(items, 10)).toHaveLength(3)
  })
})
