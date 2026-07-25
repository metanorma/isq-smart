import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import yaml from 'js-yaml'

const datasetDir = resolve(process.env.ISO_80000_DIR || '../../iso-iec-80000', 'sources/dataset')

function load(file: string) {
  return yaml.load(readFileSync(resolve(datasetDir, file), 'utf-8')) as any[]
}

interface Issue {
  source: string
  part: string
  id: string
  field: string
  detail: string
}

function checkEntry(entry: any, source: string): Issue[] {
  const issues: Issue[] = []
  const id = entry.id || entry.num || '(unknown)'
  const part = entry.part

  for (let i = 0; i < (entry.designations?.length ?? 0); i++) {
    const des = entry.designations[i].designation
    if (des.en?.text && !des.fr?.text) {
      issues.push({ source, part, id, field: `designation[${i}]`, detail: `en="${des.en.text}" → missing fr` })
    } else if (!des.en?.text && des.fr?.text) {
      issues.push({ source, part, id, field: `designation[${i}]`, detail: `fr="${des.fr.text}" → missing en` })
    }
  }

  if (entry.def?.en && !entry.def?.fr) {
    issues.push({ source, part, id, field: 'def', detail: 'en present → missing fr' })
  } else if (entry.def?.fr && !entry.def?.en) {
    issues.push({ source, part, id, field: 'def', detail: 'fr present → missing en' })
  }

  if (entry.remarks?.en && !entry.remarks?.fr) {
    issues.push({ source, part, id, field: 'remarks', detail: 'en present → missing fr' })
  } else if (entry.remarks?.fr && !entry.remarks?.en) {
    issues.push({ source, part, id, field: 'remarks', detail: 'fr present → missing en' })
  }

  return issues
}

function run() {
  const math = load('math.yaml')
  const quantities = load('quantities.yaml')

  const allIssues: Issue[] = []
  let totalEntries = 0
  let entriesWithFrench = 0
  let entriesFullyBilingual = 0
  let entriesMissingFrench = 0

  const perPart: Record<string, { total: number; fr: number; en: number }> = {}

  function tally(entry: any) {
    totalEntries++
    const part = entry.part
    if (!perPart[part]) perPart[part] = { total: 0, fr: 0, en: 0 }
    perPart[part].total++

    const hasFr = entry.designations?.some((d: any) => d.designation.fr?.text) || entry.def?.fr
    const hasEn = entry.designations?.some((d: any) => d.designation.en?.text) || entry.def?.en

    if (hasFr) { entriesWithFrench++; perPart[part].fr++ }
    if (hasEn) { perPart[part].en++ }
    if (hasFr && hasEn) entriesFullyBilingual++
    if (hasEn && !hasFr) entriesMissingFrench++
  }

  for (const e of math) {
    tally(e)
    allIssues.push(...checkEntry(e, 'math'))
  }
  for (const e of quantities) {
    tally(e)
    allIssues.push(...checkEntry(e, 'qty'))
  }

  console.log('=== Coverage summary ===')
  console.log(`Total entries: ${totalEntries}`)
  console.log(`Entries with French: ${entriesWithFrench} (${(entriesWithFrench / totalEntries * 100).toFixed(1)}%)`)
  console.log(`Fully bilingual (en+fr): ${entriesFullyBilingual}`)
  console.log(`Missing French (en only): ${entriesMissingFrench}`)
  console.log()

  console.log('=== Per-part coverage ===')
  for (const [part, stats] of Object.entries(perPart).sort()) {
    const frPct = (stats.fr / stats.total * 100).toFixed(0)
    const enPct = (stats.en / stats.total * 100).toFixed(0)
    console.log(`  part ${part}: ${stats.total} entries | en=${stats.en} (${enPct}%) | fr=${stats.fr} (${frPct}%)`)
  }
  console.log()

  if (allIssues.length) {
    console.log(`=== Issues (${allIssues.length}) ===`)
    const byPart: Record<string, Issue[]> = {}
    for (const issue of allIssues) {
      const key = `${issue.source}/part-${issue.part}`
      if (!byPart[key]) byPart[key] = []
      byPart[key].push(issue)
    }
    for (const [key, issues] of Object.entries(byPart).sort()) {
      console.log(`\n  ${key} (${issues.length} issues):`)
      for (const issue of issues.slice(0, 10)) {
        console.log(`    [${issue.field}] ${issue.id}: ${issue.detail}`)
      }
      if (issues.length > 10) console.log(`    ... and ${issues.length - 10} more`)
    }
  } else {
    console.log('=== No issues found — all entries have both en and fr ===')
  }
}

run()
