import { readFileSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import yaml from 'js-yaml'

const __dirname = dirname(fileURLToPath(import.meta.url))
const yamlPath = resolve(__dirname, '../src/i18n/messages.yaml')
const tsPath = resolve(__dirname, '../src/i18n/messages.ts')

const messages = yaml.load(readFileSync(yamlPath, 'utf-8'))
const json = JSON.stringify(messages, null, 2)

writeFileSync(
  tsPath,
  `// AUTO-GENERATED from messages.yaml — do not edit directly.\n` +
  `// Run: node scripts/generate-messages.mjs\n\n` +
  `export const messages = ${json} as const\n`,
)

console.log(`[i18n] Generated ${tsPath}`)
