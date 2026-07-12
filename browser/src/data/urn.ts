import { publisherOf } from './PartRegistry'
import { basePartKey } from './partKey'

const YEAR_TO_ED: Record<string, string> = {
  '2019': '2', '2020': '1', '2022': '1',
}

const IEC_ED_DATES: Record<string, string> = {
  '6': '2022-11', '13': '2025-02',
}

// ── Edition resolution ──

function resolveIsoEdition(_partKey: string, edition: string): string {
  return YEAR_TO_ED[edition] || edition.replace(/^.*?(\d+).*$/, '$1') || '1'
}

function resolveIecEditionDate(partKey: string, edition: string): string {
  return IEC_ED_DATES[partKey] || edition
}

// ── Publisher-specific URN builders ──

function resolveIsoUrn(partKey: string, edition: string, suffix: string): string {
  const edNum = resolveIsoEdition(partKey, edition)
  return `urn:iso:std:iso:80000:-${basePartKey(partKey)}:ed-${edNum}:${suffix}`
}

function resolveIecUrn(partKey: string, edition: string): string {
  const edDate = resolveIecEditionDate(partKey, edition)
  return `urn:iec:std:iec:80000-${partKey}:${edDate}:::`
}

// ── Exported API (signatures unchanged) ──

export function partUrn(partKey: string, edition: string): string {
  if (publisherOf(partKey) === 'IEC') return resolveIecUrn(partKey, edition)
  return resolveIsoUrn(partKey, edition, 'en')
}

export function partUrnBilingual(partKey: string, edition: string): string {
  if (publisherOf(partKey) === 'IEC') return resolveIecUrn(partKey, edition)
  return resolveIsoUrn(partKey, edition, 'en,fr')
}

export function entryUrn(entry: { num: string }, partKey: string, edition: string): string {
  if (publisherOf(partKey) === 'IEC') return `${resolveIecUrn(partKey, edition)}${entry.num}`
  return `${resolveIsoUrn(partKey, edition, 'en')}:item:${entry.num}`
}

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
  const bp = basePartKey(partKey)
  const edNum = resolveIsoEdition(partKey, edition)
  const edDate = resolveIecEditionDate(bp, edition)
  return {
    iso: `urn:iso:std:iso:80000:-${bp}:ed-${edNum}:en:item:${entry.num}`,
    iec: `urn:iec:std:iec:80000-${bp}:${edDate}:::item:${entry.num}`,
  }
}
