import type { Domain, PartKey } from '../data/types'

export class PathResolver {
  constructor(private readonly base: string) {}

  resolve(path: string): string {
    return (this.base + path.replace(/^\/+/, '')).replace(/\/{2,}/g, '/')
  }

  part(domain: Domain, partKey: PartKey): string {
    const prefix = domain === 'math' ? '/math' : '/quantities'
    return this.resolve(`${prefix}/part-${partKey}`)
  }

  entry(domain: Domain, partKey: PartKey, id: string): string {
    return `${this.part(domain, partKey)}/${id}`
  }

  domainPath(domain: Domain): string {
    return this.resolve(domain === 'math' ? '/math' : '/quantities')
  }

  static get default(): PathResolver {
    const base = typeof import.meta !== 'undefined' && import.meta.env
      ? import.meta.env.BASE_URL
      : '/'
    return new PathResolver(base)
  }
}

export function asset(path: string): string {
  return PathResolver.default.resolve(path)
}
