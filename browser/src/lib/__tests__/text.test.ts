import { describe, it, expect } from 'vitest'
import { highlightText, stripStem } from '../text'

describe('highlightText', () => {
  it('returns original text when query is empty', () => {
    expect(highlightText('hello world', '')).toBe('hello world')
    expect(highlightText('hello world', '   ')).toBe('hello world')
  })

  it('wraps the match in a <mark> tag', () => {
    const result = highlightText('length', 'length')
    expect(result).toBe('<mark class="bg-amber-200/80 text-amber-900 rounded-sm px-0.5 -mx-0.5">length</mark>')
  })

  it('is case-insensitive', () => {
    const result = highlightText('Length is long', 'length')
    expect(result).toContain('>Length</mark>')
  })

  it('escapes regex special characters in query', () => {
    const result = highlightText('test (value)', '(value)')
    expect(result).toContain('>(value)</mark>')
  })

  it('highlights multiple matches', () => {
    const result = highlightText('length and more length', 'length')
    expect(result.match(/<mark/g)?.length).toBe(2)
  })
})

describe('stripStem', () => {
  it('extracts content from stem: [...] syntax', () => {
    expect(stripStem('stem: [x^2 + y^2]')).toBe('x^2 + y^2')
  })

  it('handles whitespace around brackets', () => {
    expect(stripStem('stem:  [test] ')).toBe('test')
  })

  it('returns original text for non-stem strings', () => {
    expect(stripStem('plain text')).toBe('plain text')
    expect(stripStem('stem: plain')).toBe('stem: plain')
  })
})
