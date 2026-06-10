import type { RawEntry } from './types'

const ASCIIMATH_KNOWN = new Set([
  'sin', 'cos', 'tan', 'csc', 'sec', 'cot', 'sinh', 'cosh', 'tanh',
  'log', 'ln', 'exp', 'det', 'mod', 'gcd', 'lcm', 'min', 'max',
  'abs', 'ceil', 'floor', 'norm', 'sqrt', 'root', 'sum', 'prod', 'int', 'oint',
  'del', 'grad', 'sub', 'sup', 'deg', 'oo',
  'alpha', 'beta', 'gamma', 'delta', 'epsilon', 'varepsilon', 'zeta', 'eta',
  'theta', 'vartheta', 'iota', 'kappa', 'lambda', 'mu', 'nu', 'xi',
  'omicron', 'pi', 'rho', 'sigma', 'tau', 'upsilon', 'phi', 'varphi',
  'chi', 'psi', 'omega', 'Gamma', 'Delta', 'Theta', 'Lambda', 'Xi',
  'Pi', 'Sigma', 'Upsilon', 'Phi', 'Psi', 'Omega',
  'bb', 'ii', 'sf', 'tt', 'fr', 'cc', 'hat', 'bar', 'vec', 'dot', 'ddot', 'tilde', 'ul', 'rm',
])

function quoteMultiLetter(expr: string): string {
  const quoted: string[] = []
  let result = expr.replace(/"([^"]*)"/g, (m) => {
    quoted.push(m)
    return `\x00${quoted.length - 1}\x00`
  })
  result = result.replace(/([a-zA-Z]{2,})/g, (m) => {
    if (ASCIIMATH_KNOWN.has(m)) return m
    return `"${m}"`
  })
  result = result.replace(/\x00(\d+)\x00/g, (_, i) => quoted[parseInt(i)])
  return result
}

export const MathCollector = {
  collect(entries: RawEntry[]): Set<string> {
    const exprs = new Set<string>()
    const stemRe = /stem:\[([^\]]+)\]/g
    const blockRe = /\[stem%unnumbered\]\n\+{4}\n([\s\S]*?)\n\+{4}/g
    const stemWrap = /^stem:\[([^\]]+)\]$/

    const collectFrom = (obj: Record<string, string | undefined> | undefined) => {
      if (!obj) return
      for (const text of Object.values(obj)) {
        if (typeof text !== 'string') continue
        stemRe.lastIndex = 0
        let m
        while ((m = stemRe.exec(text)) !== null) exprs.add(m[1])
        blockRe.lastIndex = 0
        while ((m = blockRe.exec(text)) !== null) exprs.add(m[1].trim())
      }
    }

    for (const entry of entries) {
      entry.symbols?.forEach(s => {
        const unwrapped = s.replace(stemWrap, '$1')
        exprs.add(unwrapped)
      })
      entry.units?.forEach(u => u.symbol?.forEach(s => exprs.add(s.replace(stemWrap, '$1'))))
      collectFrom(entry.def as unknown as Record<string, string | undefined>)
      if (entry.remarks) collectFrom(entry.remarks as unknown as Record<string, string | undefined>)
    }
    return exprs
  },

  async render(exprs: Set<string>): Promise<{ mathml: Record<string, string>; latex: Record<string, string> }> {
    const mathml: Record<string, string> = {}
    const latex: Record<string, string> = {}

    const decodeEntities = (s: string) => s.replace(/&#x([0-9A-Fa-f]+);/g, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))

    try {
      const { default: Plurimath } = await import('@plurimath/plurimath')
      for (const expr of exprs) {
        try {
          const decoded = decodeEntities(expr)
          const preprocessed = quoteMultiLetter(decoded)
          const f = new Plurimath(preprocessed, 'asciimath')
          mathml[expr] = f.toMathml().replace('display="block"', 'display="inline"')
          latex[expr] = f.toLatex()
        } catch { mathml[expr] = ''; latex[expr] = '' }
      }
    } catch { /* Plurimath unavailable */ }
    return { mathml, latex }
  },
}
