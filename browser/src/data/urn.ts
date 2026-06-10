import { publisherOf } from './PartRegistry'

const YEAR_TO_ED: Record<string, string> = {
  '2019': '2', '2020': '1', '2022': '1',
}

const IEC_ED_DATES: Record<string, string> = {
  '6': '2022-11', '13': '2025-02',
}

function basePart(partKey: string): string {
  return partKey.includes('-') ? partKey.split('-')[0] : partKey
}

const Urn = {
  part(partKey: string, edition: string): string {
    if (publisherOf(partKey) === 'IEC') {
      const edDate = IEC_ED_DATES[partKey] || edition
      return `urn:iec:std:iec:80000-${partKey}:${edDate}:::`
    }
    const edNum = YEAR_TO_ED[edition] || edition.replace(/^.*?(\d+).*$/, '$1') || '1'
    return `urn:iso:std:iso:80000:-${basePart(partKey)}:ed-${edNum}:en`
  },

  partBilingual(partKey: string, edition: string): string {
    if (publisherOf(partKey) === 'IEC') {
      const edDate = IEC_ED_DATES[partKey] || edition
      return `urn:iec:std:iec:80000-${partKey}:${edDate}:::`
    }
    const edNum = YEAR_TO_ED[edition] || edition.replace(/^.*?(\d+).*$/, '$1') || '1'
    return `urn:iso:std:iso:80000:-${basePart(partKey)}:ed-${edNum}:en,fr`
  },

  entry(entry: { num: string }, partKey: string, edition: string): string {
    if (publisherOf(partKey) === 'IEC') {
      return `${Urn.part(partKey, edition)}${entry.num}`
    }
    return `${Urn.part(partKey, edition)}:item:${entry.num}`
  },
}

export const partUrn = Urn.part
export const entryUrn = Urn.entry

export function unitUrns(unitsmlId: string | undefined): { iso: string; iec: string } | null {
  if (!unitsmlId) return null
  return {
    iso: `urn:iso:std:iso:80000:unit:${unitsmlId}`,
    iec: `urn:iec:std:iec:80000:unit:${unitsmlId}`,
  }
}

export function dimensionUrns(unitsmlId: string | undefined): { iso: string; iec: string } | null {
  if (!unitsmlId) return null
  return {
    iso: `urn:iso:std:iso:80000:dim:${unitsmlId}`,
    iec: `urn:iec:std:iec:80000:dim:${unitsmlId}`,
  }
}

export function entryDualUrn(entry: { num: string }, partKey: string, edition: string): { iso: string; iec: string } {
  const bp = basePart(partKey)
  const edNum = YEAR_TO_ED[edition] || edition.replace(/^.*?(\d+).*$/, '$1') || '1'
  const edDate = IEC_ED_DATES[bp] || `${edition}`
  return {
    iso: `urn:iso:std:iso:80000:-${bp}:ed-${edNum}:en:item:${entry.num}`,
    iec: `urn:iec:std:iec:80000-${bp}:${edDate}:::item:${entry.num}`,
  }
}
