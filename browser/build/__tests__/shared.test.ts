import { describe, it, expect } from 'vitest'
import { PART_TITLES } from '../shared'

describe('PART_TITLES', () => {
  it('contains all 13 ISO/IEC 80000 parts', () => {
    const keys = Object.keys(PART_TITLES)
    expect(keys).toHaveLength(13)
    for (let i = 1; i <= 13; i++) {
      expect(keys).toContain(String(i))
    }
  })

  it('has correct titles for known parts', () => {
    expect(PART_TITLES['1']).toBe('General')
    expect(PART_TITLES['2']).toBe('Mathematics')
    expect(PART_TITLES['3']).toBe('Space and time')
    expect(PART_TITLES['6']).toBe('Electromagnetism')
    expect(PART_TITLES['13']).toBe('Information science')
  })

  it('has no local PART_TITLES definition in build-xrefs (uses shared)', () => {
    // Read the source file and verify it imports from shared, not defines locally.
    const fs = require('node:fs')
    const path = require('node:path')
    const xrefSrc = fs.readFileSync(
      path.resolve(__dirname, '..', 'stages', 'build-xrefs.ts'),
      'utf-8',
    )
    expect(xrefSrc).toContain("from '../shared'")
    expect(xrefSrc).not.toMatch(/^(?:const|export const) PART_TITLES\b/m)
  })

  it('has no local PART_TITLES definition in build-documents (uses shared)', () => {
    const fs = require('node:fs')
    const path = require('node:path')
    const docsSrc = fs.readFileSync(
      path.resolve(__dirname, '..', 'stages', 'build-documents.ts'),
      'utf-8',
    )
    expect(docsSrc).toContain("from '../shared'")
    expect(docsSrc).not.toMatch(/^(?:const|export const) PART_TITLES\b/m)
  })

  it('has string values for all parts', () => {
    for (const value of Object.values(PART_TITLES)) {
      expect(typeof value).toBe('string')
      expect(value.length).toBeGreaterThan(0)
    }
  })
})
