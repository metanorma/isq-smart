import { describe, it, expect } from 'vitest'
import { render, renderInline } from '../asciidoc'

describe('render', () => {
  it('wraps plain text in a paragraph', () => {
    expect(render('Hello world', {})).toBe('<p>Hello world</p>')
  })

  it('escapes HTML entities in stem fallback', () => {
    const result = render('stem:[a < b > c]', {})
    expect(result).toContain('&lt;')
    expect(result).toContain('&gt;')
  })

  it('renders block stem expressions using math cache', () => {
    const cache = { 'x^2 + y^2': '<math display="inline"><mi>x</mi></math>' }
    const result = render('[stem%unnumbered]\n++++\nx^2 + y^2\n++++', cache)
    expect(result).toContain('math-block')
    expect(result).toContain('display="block"')
  })

  it('renders block stem fallback when cache misses', () => {
    const result = render('[stem%unnumbered]\n++++\nunknown\n++++', {})
    expect(result).toContain('math-fallback')
    expect(result).toContain('unknown')
  })

  it('renders inline stem expressions using math cache', () => {
    const cache = { 'E = mc^2': '<math display="inline"><mi>E</mi></math>' }
    const result = render('The value stem:[E = mc^2] is important', cache)
    expect(result).toContain('<math')
  })

  it('renders inline stem fallback when cache misses', () => {
    const result = render('The stem:[unknown] here', {})
    expect(result).toContain('math-inline')
    expect(result).toContain('unknown')
  })

  it('handles empty or undefined input', () => {
    expect(render('', {})).toBe('')
  })

  it('wraps multiple paragraphs separately', () => {
    const result = render('First paragraph\n\nSecond paragraph', {})
    expect(result).toContain('<p>First paragraph</p>')
    expect(result).toContain('<p>Second paragraph</p>')
  })

  it('renders cross-references as links when xref map has href', () => {
    const xrefs = { 'cls-0.4': { href: '/quantities/part-3/t3-1', name: 'length' } }
    const result = render('See <<cls-0.4>>', {}, xrefs)
    expect(result).toContain('href="/quantities/part-3/t3-1"')
    expect(result).toContain('length')
  })

  it('renders cross-references as formatted text when no href', () => {
    const result = render('See <<iso80000-3>>', {}, {})
    expect(result).toContain('ISO 80000-3')
  })

  it('does not wrap div elements in paragraphs', () => {
    const cache = { 'x': '<math display="inline"><mi>x</mi></math>' }
    const result = render('[stem%unnumbered]\n++++\nx\n++++', cache)
    expect(result).not.toContain('<p><div')
  })
})

describe('renderInline', () => {
  it('renders inline stem within text using cache', () => {
    const cache = { 'E = mc^2': '<math display="inline"><mi>E</mi></math>' }
    const result = renderInline('The stem:[E = mc^2] equation', cache)
    expect(result).toContain('<math')
  })

  it('renders fallback for uncached inline stem', () => {
    const result = renderInline('The stem:[unknown] here', {})
    expect(result).toContain('math-inline')
    expect(result).toContain('unknown')
  })

  it('passes through plain text without stems', () => {
    expect(renderInline('plain text', {})).toBe('plain text')
  })

  it('handles empty string', () => {
    expect(renderInline('', {})).toBe('')
  })
})
