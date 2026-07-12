import { describe, it, expect } from 'vitest'
import { escapeTurtle, ttlObject, declarePrefixes, declareStandardPrefixes } from '../turtle-writer'

describe('escapeTurtle', () => {
  it('escapes double quotes', () => {
    expect(escapeTurtle('say "hello"')).toBe('say \\"hello\\"')
  })

  it('escapes backslashes', () => {
    expect(escapeTurtle('path\\to\\file')).toBe('path\\\\to\\\\file')
  })

  it('escapes newlines and tabs', () => {
    expect(escapeTurtle('line1\nline2')).toBe('line1\\nline2')
    expect(escapeTurtle('col1\tcol2')).toBe('col1\\tcol2')
  })

  it('passes through plain text unchanged', () => {
    expect(escapeTurtle('hello world')).toBe('hello world')
  })
})

describe('ttlObject', () => {
  it('wraps plain strings in quotes', () => {
    expect(ttlObject('hello')).toBe('"hello"')
  })

  it('does not quote URIs', () => {
    expect(ttlObject('http://example.org/foo')).toBe('http://example.org/foo')
  })

  it('does not quote prefixed names', () => {
    expect(ttlObject('rdfs:label')).toBe('rdfs:label')
    expect(ttlObject('skos:definition')).toBe('skos:definition')
  })
})

describe('declarePrefixes', () => {
  it('produces @prefix lines', () => {
    const result = declarePrefixes([
      { prefix: 'ex', uri: 'http://example.org/' },
    ])
    expect(result).toBe('@prefix ex: <http://example.org/> .')
  })

  it('joins multiple prefixes with newlines', () => {
    const result = declarePrefixes([
      { prefix: 'ex', uri: 'http://example.org/' },
      { prefix: 'foo', uri: 'http://foo.org/' },
    ])
    expect(result.split('\n')).toHaveLength(2)
  })
})

describe('declareStandardPrefixes', () => {
  it('includes rdfs, rdf, owl, skos', () => {
    const result = declareStandardPrefixes()
    expect(result).toContain('rdfs:')
    expect(result).toContain('rdf:')
    expect(result).toContain('owl:')
    expect(result).toContain('skos:')
  })
})
