# 12 — Path resolver and asset management

## Problem
The `asset()` function uses `import.meta.env.BASE_URL` directly. This works but:
- No abstraction for different deployment contexts
- URL construction logic is duplicated in PartRouter, nav.ts, and individual pages
- No validation or type safety for paths

## Solution
Extract a `PathResolver` that centralizes all URL construction:

```ts
export class PathResolver {
  constructor(private readonly base: string) {}

  resolve(path: string): string {
    return (this.base + path.replace(/^\/+/, '')).replace(/\/{2,}/g, '/')
  }

  part(domain: Domain, partKey: PartKey): string {
    return this.resolve(`${domain === 'math' ? '/math' : '/quantities'}/part-${partKey}`)
  }

  entry(domain: Domain, partKey: PartKey, id: string): string {
    return `${this.part(domain, partKey)}/${id}`
  }

  static get default(): PathResolver {
    return new PathResolver(import.meta.env.BASE_URL)
  }
}
```

PartRouter, nav.ts, and all pages use `PathResolver.default` instead of calling `asset()` directly.

## Test plan
- PathResolver.resolve handles leading/trailing slashes
- PathResolver.part generates correct URLs for both domains
- PathResolver.entry generates correct entry URLs
