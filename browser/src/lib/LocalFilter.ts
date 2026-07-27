import { highlightText } from './text'

export class LocalFilter<T> {
  constructor(
    private readonly items: readonly T[],
    private readonly fields: (keyof T)[],
  ) {}

  filter(query: string): T[] {
    const q = query.toLowerCase().trim()
    if (!q) return [...this.items]
    return this.items.filter(item =>
      this.fields.some(field => {
        const val = item[field]
        if (val == null) return false
        if (Array.isArray(val)) return val.some(v => String(v).toLowerCase().includes(q))
        return String(val).toLowerCase().includes(q)
      })
    )
  }

  highlight(text: string, query: string): string {
    return highlightText(text, query)
  }

  paginate(items: readonly T[], limit: number): T[] {
    return items.slice(0, limit)
  }
}
