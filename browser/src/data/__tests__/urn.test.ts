import { describe, it, expect } from 'vitest'
import {
  partUrn,
  entryUrn,
  unitUrns,
  dimensionUrns,
  entryDualUrn,
} from '../urn'

describe('partUrn', () => {
  it('builds ISO URN for ISO-published parts', () => {
    expect(partUrn('3', '2019')).toBe('urn:iso:std:iso:80000:-3:ed-2:en')
  })

  it('uses edition lookup table when year is known', () => {
    expect(partUrn('4', '2019')).toBe('urn:iso:std:iso:80000:-4:ed-2:en')
    expect(partUrn('5', '2020')).toBe('urn:iso:std:iso:80000:-5:ed-1:en')
    expect(partUrn('1', '2022')).toBe('urn:iso:std:iso:80000:-1:ed-1:en')
  })

  it('falls back to numeric extraction when year is not in lookup table', () => {
    expect(partUrn('7', '2024')).toBe('urn:iso:std:iso:80000:-7:ed-2024:en')
  })

  it('passes non-numeric edition through as-is (no "1" fallback)', () => {
    // The fallback only fires when replace returns empty string; 'draft' has
    // no digits so the regex returns the original string unchanged.
    expect(partUrn('3', 'draft')).toBe('urn:iso:std:iso:80000:-3:ed-draft:en')
  })

  it('strips sub-part suffix for base part in ISO URNs (Part 11)', () => {
    const u = partUrn('11-4', '2019')
    expect(u).toBe('urn:iso:std:iso:80000:-11:ed-2:en')
  })

  it('builds IEC URN for IEC-published parts with edition date', () => {
    expect(partUrn('6', '2022')).toBe('urn:iec:std:iec:80000-6:2022-11:::')
    expect(partUrn('13', '2025')).toBe('urn:iec:std:iec:80000-13:2025-02:::')
  })
})

describe('entryUrn', () => {
  it('appends ISO item segment for ISO parts', () => {
    expect(entryUrn({ num: '4-1' }, '3', '2019'))
      .toBe('urn:iso:std:iso:80000:-3:ed-2:en:item:4-1')
  })

  it('appends bare item number for IEC parts', () => {
    expect(entryUrn({ num: '6-1' }, '6', '2022'))
      .toBe('urn:iec:std:iec:80000-6:2022-11:::6-1')
  })
})

describe('unitUrns', () => {
  it('returns iso and iec URNs for a valid unitsml id', () => {
    expect(unitUrns('N')).toEqual({
      iso: 'urn:iso:std:iso:80000:unit:N',
      iec: 'urn:iec:std:iec:80000:unit:N',
    })
  })

  it('returns null when id is undefined', () => {
    expect(unitUrns(undefined)).toBeNull()
  })

  it('returns null when id is empty string', () => {
    expect(unitUrns('')).toBeNull()
  })
})

describe('dimensionUrns', () => {
  it('returns iso and iec dimension URNs', () => {
    expect(dimensionUrns('length')).toEqual({
      iso: 'urn:iso:std:iso:80000:dim:length',
      iec: 'urn:iec:std:iec:80000:dim:length',
    })
  })

  it('returns null when id is undefined', () => {
    expect(dimensionUrns(undefined)).toBeNull()
  })
})

describe('entryDualUrn', () => {
  it('emits both iso and iec URNs for a given entry', () => {
    const dual = entryDualUrn({ num: '4-1' }, '3', '2019')
    expect(dual.iso).toBe('urn:iso:std:iso:80000:-3:ed-2:en:item:4-1')
    expect(dual.iec).toBe('urn:iec:std:iec:80000-3:2019:::item:4-1')
  })

  it('strips sub-part suffix in both URNs', () => {
    const dual = entryDualUrn({ num: '11-4.1' }, '11-4', '2019')
    expect(dual.iso).toBe('urn:iso:std:iso:80000:-11:ed-2:en:item:11-4.1')
    expect(dual.iec).toBe('urn:iec:std:iec:80000-11:2019:::item:11-4.1')
  })
})
