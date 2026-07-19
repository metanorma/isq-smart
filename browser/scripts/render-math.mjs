#!/usr/bin/env node
// Pre-render math expressions using plurimath, writing a cache file
// that the Vite build plugin reads. This runs outside Vite's module
// system to avoid "Vite module runner has been closed" errors.

import { createRequire } from 'node:module'
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const require = createRequire(import.meta.url)
const PlurimathModule = require('@plurimath/plurimath')
const Plurimath = PlurimathModule.default ?? PlurimathModule
const yaml = require('js-yaml')

const __dirname = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(__dirname, '..')
const datasetDir = resolve(repoRoot, '../iso-iec-80000/sources/dataset')
const generatedDir = resolve(__dirname, '../src/data/generated')

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

function quoteMultiLetter(expr) {
  const quoted = []
  let result = expr.replace(/"([^"]*)"/g, (m) => { quoted.push(m); return `\x00${quoted.length - 1}\x00` })
  result = result.replace(/([a-zA-Z]{2,})/g, (m) => ASCIIMATH_KNOWN.has(m) ? m : `"${m}"`)
  result = result.replace(/\x00(\d+)\x00/g, (_, i) => quoted[parseInt(i)])
  return result
}

function decodeEntities(s) {
  return s.replace(/&#x([0-9A-Fa-f]+);/g, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
}

function collectFromText(text, exprs) {
  if (typeof text !== 'string') return
  const stemRe = /stem:\[([^\]]+)\]/g
  const blockRe = /\[stem%unnumbered\]\n\+{4}\n([\s\S]*?)\n\+{4}/g
  let m
  while ((m = stemRe.exec(text)) !== null) exprs.add(m[1])
  while ((m = blockRe.exec(text)) !== null) exprs.add(m[1].trim())
}

function collectFromEntry(entry, exprs) {
  const stemWrap = /^stem:\[([^\]]+)\]$/
  entry.symbols?.forEach(s => exprs.add(s.replace(stemWrap, '$1')))
  entry.units?.forEach(u => u.symbol?.forEach(s => exprs.add(s.replace(stemWrap, '$1'))))
  if (entry.def) {
    collectFromText(entry.def.en, exprs)
    collectFromText(entry.def.fr, exprs)
  }
  if (entry.remarks) {
    collectFromText(entry.remarks.en, exprs)
    collectFromText(entry.remarks.fr, exprs)
  }
}

console.log('[math] Pre-rendering math expressions...')

const quantitiesPath = resolve(datasetDir, 'quantities.yaml')
const mathPath = resolve(datasetDir, 'math.yaml')
const cachePath = resolve(generatedDir, 'math-cache.json')

const exprs = new Set()

for (const path of [quantitiesPath, mathPath]) {
  if (!existsSync(path)) continue
  const data = yaml.load(readFileSync(path, 'utf-8'))
  for (const entry of data) collectFromEntry(entry, exprs)
}

console.log(`[math] Collected ${exprs.size} unique expressions`)

const mathml = {}
const latex = {}
let ok = 0

for (const expr of exprs) {
  try {
    const preprocessed = quoteMultiLetter(decodeEntities(expr))
    const f = new Plurimath(preprocessed, 'asciimath')
    mathml[expr] = f.toMathml().replace('display="block"', 'display="inline"')
    latex[expr] = f.toLatex()
    ok++
  } catch {
    mathml[expr] = ''
    latex[expr] = ''
  }
}

console.log(`[math] Rendered ${ok}/${exprs.size} expressions`)

if (!existsSync(generatedDir)) mkdirSync(generatedDir, { recursive: true })
writeFileSync(cachePath, JSON.stringify({ mathml, latex }, null, 0))
console.log(`[math] Cache written to ${cachePath}`)
