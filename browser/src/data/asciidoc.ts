/**
 * Metanorma AsciiDoc processor.
 * Renders AsciiDoc markup in ISO 80000 definitions and remarks to HTML.
 *
 * Handles: block math, inline math, cross-references, paragraph breaks.
 */

const BLOCK_STEM = /\[stem%unnumbered\]\n\+{4}\n([\s\S]*?)\n\+{4}/g
const INLINE_STEM = /stem:\[([^\]]+)\]/g
const ANY_XREF = /<<([^>]+)>>/g

/** Extract all math expressions (inline + block) from text for build-time rendering. */
export function collectMathExpressions(text: string): string[] {
  const exprs: string[] = []

  let m: RegExpExecArray | null
  const blockRe = new RegExp(BLOCK_STEM.source, BLOCK_STEM.flags)
  while ((m = blockRe.exec(text)) !== null) exprs.push(m[1].trim())

  const inlineRe = new RegExp(INLINE_STEM.source, INLINE_STEM.flags)
  while ((m = inlineRe.exec(text)) !== null) exprs.push(m[1])

  return exprs
}

/** Render Metanorma AsciiDoc text to HTML. */
export function render(text: string, mathCache: Record<string, string>, xrefs?: Record<string, { href?: string; name: string }>): string {
  if (!text) return ''
  let result = text

  // 1. Block stems
  result = result.replace(new RegExp(BLOCK_STEM.source, BLOCK_STEM.flags), (_, expr) => {
    const key = expr.trim()
    const mathml = mathCache[key]
    if (mathml) return `\n\n<div class="math-block">${toDisplay(mathml)}</div>\n\n`
    return `\n\n<div class="math-block math-fallback"><code>${esc(key)}</code></div>\n\n`
  })

  // 2. Inline stems
  result = result.replace(new RegExp(INLINE_STEM.source, INLINE_STEM.flags), (_, expr) => {
    const mathml = mathCache[expr]
    if (mathml) return mathml
    return `<code class="math-inline">${esc(expr)}</code>`
  })

  // 3. Cross-references — render as hyperlinks when xref map is available
  result = result.replace(new RegExp(ANY_XREF.source, ANY_XREF.flags), (_, id) => {
    const ref = xrefs?.[id]
    if (ref?.href) {
      return `<a class="xref" href="${ref.href}">${esc(ref.name)}</a>`
    }
    return `<span class="xref-std">${esc(formatExternalRef(id))}</span>`
  })

  // 4. Paragraphs
  return result
    .split(/\n{2,}/)
    .map(p => p.trim())
    .filter(Boolean)
    .map(p => p.startsWith('<div') ? p : `<p>${p.replace(/\n/g, ' ')}</p>`)
    .join('')
}

function toDisplay(mathml: string): string {
  return mathml.replace(/display="inline"/g, 'display="block"')
}

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function formatExternalRef(id: string): string {
  return id
    .replace(/^(iso|iec|cei)(\d+)-(.+)/i, (_, p, n, r) => `${p.toUpperCase()} ${n}-${r}`)
    .replace(/^(iso|iec|cei)(\d+)$/i, (_, p, n) => `${p.toUpperCase()} ${n}`)
}
