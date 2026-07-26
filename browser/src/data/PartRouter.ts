import type { Domain, PartKey } from './types'
import { asset } from '../lib/asset'
import { PartCatalog } from './PartCatalog'

export const PartRouter = {
  partUrl(partKey: PartKey): string {
    const meta = PartCatalog.getPartMeta(partKey)
    if (!meta) return '/'
    return asset(`${meta.domain === 'math' ? '/math' : '/quantities'}/part-${meta.partKey}`)
  },

  entryUrl(partKey: PartKey, id: string): string {
    return `${this.partUrl(partKey)}/${id}`
  },

  domainPath(domain: Domain): string {
    return asset(domain === 'math' ? '/math' : '/quantities')
  },
}
