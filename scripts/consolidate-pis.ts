import { prisma } from '../lib/prisma'

// ---------------------------------------------------------------------------
// PI consolidation script
//
// Merges "fragment" PIs into single, meaningful PIs, then renumbers each
// competency's PIs sequentially. Detection is tiered and conservative:
//
//   TIER 1 — Challenge/Solution/Benefit triples: a "Challenge:"/"Problem:" CD
//            plus its preceding topic header and following Solution/Benefits/
//            Impact/... fragments.
//   TIER 2 — Named concept + sub-points: a short bare label (proper noun /
//            acronym, no colon, no period, <= 6 words) followed by 2+ short
//            sub-points (< 40 chars).
//   TIER 3 — Sibling prefix runs: consecutive "Label: description" PIs whose
//            labels share a structural prefix (e.g. "Principle 1.1",
//            "Principle 1.2"), run >= 3.
//   TIER 4 — Same-topic colon runs: consecutive "Label: description" PIs that
//            form a run of >= 3 (bounded to <= 12 members) — captures the
//            overbuilt fragment lists that dominate this corpus.
//
// LOs, timeline (year-prefixed) entries, and numbered list items are never
// merged. The script is idempotent: a second run finds no clusters.
//
// Usage:
//   tsx scripts/consolidate-pis.ts              (dry-run, default)
//   tsx scripts/consolidate-pis.ts --dry-run    (dry-run, explicit)
//   tsx scripts/consolidate-pis.ts --execute    (modify the DB)
// ---------------------------------------------------------------------------

const DRY_RUN = process.argv.includes('--dry-run') || !process.argv.includes('--execute')

const MAX_SAME_TOPIC_RUN = 12
const SUB_POINT_MAX_CHARS = 40

const LO_VERBS = [
  'understand', 'explain', 'describe', 'identify', 'analyze', 'evaluate',
  'apply', 'assess', 'recognize', 'compare', 'discuss', 'determine',
  'differentiate', 'interpret', 'examine', 'implement', 'establish',
  'map', 'plan', 'scope', 'test', 'validate', 'manage', 'monitor',
  'ensure', 'integrate', 'know',
]

const CLUSTER_STARTERS = ['challenge:', 'problem:']

const FRAGMENT_PREFIXES = [
  'challenge:', 'problem:',
  'solution:', 'ai solution:', 'proposed solution:',
  'benefits:', 'benefit:', 'impact:', 'impacts:', 'result:', 'results:',
  'consequence:', 'consequences:',
]

interface RawPI {
  id: number
  code: string
  description: string
  competencyId: number
  _num: number
}

interface CompetencyGroup {
  competencyId: number
  competencyCode: string
  pis: RawPI[]
}

interface Cluster {
  competencyCode: string
  pattern: string
  members: RawPI[]
  mergedDescription: string
}

// --- Text helpers ----------------------------------------------------------

function isLearningObjective(description: string): boolean {
  const firstWord = description.split(/\s+/)[0].toLowerCase().replace(/[^a-z]/g, '')
  return LO_VERBS.indexOf(firstWord) !== -1
}

function isYearStart(description: string): boolean {
  return /^\d{4}([\s\-,–]|$)/.test(description.trim())
}

function isNumberedListItem(description: string): boolean {
  return /^\d{1,2}[\.\)]\s+/.test(description.trim())
}

function startsWithPrefix(description: string, prefixes: string[]): boolean {
  const lower = description.trim().toLowerCase()
  for (let i = 0; i < prefixes.length; i++) {
    if (lower.indexOf(prefixes[i]) === 0) return true
  }
  return false
}

// A bare "named concept" label: short, no colon, no trailing period, <= 6
// words, contains a letter. Examples: "Objects", "Decision Trees",
// "Supervised Learning", "Neural Networks".
function isNamedConcept(description: string): boolean {
  const t = description.trim()
  if (t.length === 0 || t.length > 60) return false
  if (t.indexOf(':') !== -1) return false
  if (/[.!?]$/.test(t)) return false
  if (!/[a-zA-Z]/.test(t)) return false
  if (t.split(/\s+/).length > 6) return false
  return true
}

// A "sub-point" under a named concept: a short dependent fragment.
function isSubPoint(description: string): boolean {
  const t = description.trim()
  if (t.length === 0) return false
  return t.length <= SUB_POINT_MAX_CHARS
}

// The label before the first colon (for "Label: description" PIs), or null.
function keyPortion(description: string): string | null {
  const t = description.trim()
  const idx = t.indexOf(':')
  if (idx === -1) return null
  const key = t.slice(0, idx).trim()
  if (key.length === 0 || key.length > 60) return null
  return key
}

// Two labels share a structural prefix if they share the same first word and
// diverge at a digit/dot boundary (e.g. "Principle 1.1" vs "Principle 1.2"),
// or one is a full prefix of the other.
function sharesPrefix(a: string, b: string): boolean {
  if (a === b) return true
  const minLen = Math.min(a.length, b.length)
  let common = 0
  while (common < minLen && a.charAt(common) === b.charAt(common)) common++
  if (common === 0) return false
  if (a.split(' ')[0] !== b.split(' ')[0]) return false
  if (common === minLen) return true
  const isDigitOrDot = (c: string) => /[0-9.]/.test(c)
  return isDigitOrDot(a.charAt(common)) && isDigitOrDot(b.charAt(common))
}

// A "hard stop" for any cluster walk: an LO, year entry, challenge-starter, or
// numbered list item ends the current run.
function isHardStop(description: string): boolean {
  return (
    isLearningObjective(description) ||
    isYearStart(description) ||
    startsWithPrefix(description, CLUSTER_STARTERS) ||
    isNumberedListItem(description)
  )
}

function normalizeFragment(text: string): string {
  return text.trim().replace(/\s+/g, ' ')
}

function mergedDescriptionOf(members: RawPI[]): string {
  return members.map((m) => normalizeFragment(m.description)).join(' | ')
}

// --- Grouping --------------------------------------------------------------

function groupPisByCompetency(all: RawPI[]): CompetencyGroup[] {
  const byId: { [key: number]: CompetencyGroup } = {}
  const order: number[] = []
  for (let i = 0; i < all.length; i++) {
    const pi = all[i]
    const parts = pi.code.split('.')
    if (parts.length < 3) continue
    const num = parseInt(parts[parts.length - 1], 10)
    const competencyCode = parts.slice(0, parts.length - 1).join('.')
    let group = byId[pi.competencyId]
    if (!group) {
      group = { competencyId: pi.competencyId, competencyCode, pis: [] }
      byId[pi.competencyId] = group
      order.push(pi.competencyId)
    }
    group.pis.push({ id: pi.id, code: pi.code, description: pi.description, competencyId: pi.competencyId, _num: num })
  }
  const groups: CompetencyGroup[] = []
  for (let i = 0; i < order.length; i++) {
    const g = byId[order[i]]
    g.pis.sort((a, b) => a._num - b._num)
    groups.push(g)
  }
  return groups
}

// --- Tier 1: Challenge/Solution/Benefit triples ----------------------------

function findChallengeClusters(group: CompetencyGroup, consumed: Set<number>): Cluster[] {
  const clusters: Cluster[] = []
  const pis = group.pis
  for (let i = 0; i < pis.length; i++) {
    const pi = pis[i]
    if (consumed.has(pi.id)) continue
    if (isLearningObjective(pi.description) || isYearStart(pi.description)) continue
    if (!startsWithPrefix(pi.description, CLUSTER_STARTERS)) continue

    // The CD immediately before the challenge is the topic header.
    const header = i > 0 ? pis[i - 1] : null
    if (!header || consumed.has(header.id)) continue
    if (isLearningObjective(header.description) || isYearStart(header.description)) continue

    const members: RawPI[] = [header, pi]
    consumed.add(header.id)
    consumed.add(pi.id)

    let j = i + 1
    while (j < pis.length) {
      const next = pis[j]
      if (consumed.has(next.id)) break
      if (isHardStop(next.description)) break
      if (startsWithPrefix(next.description, FRAGMENT_PREFIXES)) {
        members.push(next)
        consumed.add(next.id)
        j++
        continue
      }
      break
    }

    if (members.length >= 3) {
      clusters.push({
        competencyCode: group.competencyCode,
        pattern: 'challenge-solution',
        members,
        mergedDescription: mergedDescriptionOf(members),
      })
    } else {
      for (let k = 0; k < members.length; k++) consumed.delete(members[k].id)
    }
  }
  return clusters
}

// --- Tier 2: Named concept + sub-points ------------------------------------

function findNamedConceptClusters(group: CompetencyGroup, consumed: Set<number>): Cluster[] {
  const clusters: Cluster[] = []
  const pis = group.pis
  for (let i = 0; i < pis.length; i++) {
    const pi = pis[i]
    if (consumed.has(pi.id)) continue
    if (!isNamedConcept(pi.description)) continue
    if (isHardStop(pi.description)) continue

    const subPoints: RawPI[] = []
    let j = i + 1
    while (j < pis.length) {
      const next = pis[j]
      if (consumed.has(next.id)) break
      if (isHardStop(next.description)) break
      if (isNamedConcept(next.description)) break
      if (isSubPoint(next.description)) {
        subPoints.push(next)
        j++
        continue
      }
      break
    }

    if (subPoints.length >= 2) {
      const members = [pi].concat(subPoints)
      clusters.push({
        competencyCode: group.competencyCode,
        pattern: 'named-concept',
        members,
        mergedDescription: mergedDescriptionOf(members),
      })
      consumed.add(pi.id)
      for (let k = 0; k < subPoints.length; k++) consumed.add(subPoints[k].id)
      i += subPoints.length
      continue
    }
  }
  return clusters
}

// --- Tier 3: Sibling prefix runs -------------------------------------------

function findSiblingClusters(group: CompetencyGroup, consumed: Set<number>): Cluster[] {
  const clusters: Cluster[] = []
  const pis = group.pis
  let i = 0
  while (i < pis.length) {
    const pi = pis[i]
    if (consumed.has(pi.id)) { i++; continue }
    if (isHardStop(pi.description) || isNamedConcept(pi.description)) { i++; continue }

    const key = keyPortion(pi.description)
    if (key === null) { i++; continue }

    const run: RawPI[] = [pi]
    let j = i + 1
    while (j < pis.length) {
      const next = pis[j]
      if (consumed.has(next.id)) break
      if (isHardStop(next.description) || isNamedConcept(next.description)) break
      const nk = keyPortion(next.description)
      if (nk === null) break
      if (sharesPrefix(key, nk)) {
        run.push(next)
        j++
        continue
      }
      break
    }

    if (run.length >= 3) {
      clusters.push({
        competencyCode: group.competencyCode,
        pattern: 'sibling-list',
        members: run,
        mergedDescription: mergedDescriptionOf(run),
      })
      for (let k = 0; k < run.length; k++) consumed.add(run[k].id)
      i = j
      continue
    }
    i++
  }
  return clusters
}

// --- Tier 4: Same-topic colon runs -----------------------------------------
// Consecutive "Label: description" PIs that form a run of >= 3. This is the
// dominant fragment pattern in this corpus (the PDF parser split nearly every
// "Label: text" line into its own PI). Runs are bounded to MAX_SAME_TOPIC_RUN
// to avoid collapsing an entire competency into one mega-PI.

function findSameTopicClusters(group: CompetencyGroup, consumed: Set<number>): Cluster[] {
  const clusters: Cluster[] = []
  const pis = group.pis
  let i = 0
  while (i < pis.length) {
    const pi = pis[i]
    if (consumed.has(pi.id)) { i++; continue }
    if (isHardStop(pi.description) || isNamedConcept(pi.description)) { i++; continue }
    if (keyPortion(pi.description) === null) { i++; continue }

    const run: RawPI[] = [pi]
    let j = i + 1
    while (j < pis.length && run.length < MAX_SAME_TOPIC_RUN) {
      const next = pis[j]
      if (consumed.has(next.id)) break
      if (isHardStop(next.description) || isNamedConcept(next.description)) break
      if (keyPortion(next.description) === null) break
      run.push(next)
      j++
    }

    if (run.length >= 3) {
      clusters.push({
        competencyCode: group.competencyCode,
        pattern: 'same-topic',
        members: run,
        mergedDescription: mergedDescriptionOf(run),
      })
      for (let k = 0; k < run.length; k++) consumed.add(run[k].id)
      i = j
      continue
    }
    i++
  }
  return clusters
}

// --- Planning --------------------------------------------------------------

interface Plan {
  before: number
  clusters: Cluster[]
  after: number
  deletions: number[]
  updates: { id: number; newDescription: string }[]
  renumber: { id: number; oldCode: string; newCode: string }[]
  chunkRepoint: { chunkId: number; toPi: number }[]
  questionRepoint: { questionId: number; toPi: number }[]
  flashcardRepoint: { flashcardId: number; toPi: number }[]
}

async function buildPlan(): Promise<Plan> {
  const rawPis = await prisma.performanceIndicator.findMany({
    select: { id: true, code: true, description: true, competencyId: true },
  })
  const allPis: RawPI[] = rawPis.map((p) => ({
    id: p.id,
    code: p.code,
    description: p.description,
    competencyId: p.competencyId,
    _num: parseInt(p.code.split('.').pop() || '0', 10),
  }))
  const groups = groupPisByCompetency(allPis)

  const clusters: Cluster[] = []
  const survivorById: { [key: number]: number } = {}
  const deleteIds = new Set<number>()

  for (let g = 0; g < groups.length; g++) {
    const group = groups[g]
    const consumed = new Set<number>()
    const p1 = findChallengeClusters(group, consumed)
    const p2 = findNamedConceptClusters(group, consumed)
    const p3 = findSiblingClusters(group, consumed)
    const p4 = findSameTopicClusters(group, consumed)
    const local = p1.concat(p2).concat(p3).concat(p4)
    for (let c = 0; c < local.length; c++) {
      const cluster = local[c]
      clusters.push(cluster)
      const survivor = cluster.members[0]
      for (let m = 0; m < cluster.members.length; m++) {
        survivorById[cluster.members[m].id] = survivor.id
        if (cluster.members[m].id !== survivor.id) deleteIds.add(cluster.members[m].id)
      }
    }
  }

  // Renumber survivors per competency (ordered by original numeric suffix).
  const renumber: Plan['renumber'] = []
  let after = 0
  for (let g = 0; g < groups.length; g++) {
    const group = groups[g]
    const survivors = group.pis.filter((p) => !deleteIds.has(p.id))
    survivors.sort((a, b) => a._num - b._num)
    for (let i = 0; i < survivors.length; i++) {
      const s = survivors[i]
      const newCode = group.competencyCode + '.' + (i + 1)
      renumber.push({ id: s.id, oldCode: s.code, newCode })
      after++
    }
  }

  const updates: Plan['updates'] = []
  for (let c = 0; c < clusters.length; c++) {
    const cluster = clusters[c]
    if (cluster.members.length < 2) continue
    updates.push({ id: cluster.members[0].id, newDescription: cluster.mergedDescription })
  }

  const deletedArray = Array.from(deleteIds)
  const chunkRepoint: Plan['chunkRepoint'] = []
  const questionRepoint: Plan['questionRepoint'] = []
  const flashcardRepoint: Plan['flashcardRepoint'] = []

  if (deletedArray.length > 0) {
    const chunks = await prisma.contentChunk.findMany({
      where: { performanceIndicatorId: { in: deletedArray } },
      select: { id: true, performanceIndicatorId: true },
    })
    for (let i = 0; i < chunks.length; i++) {
      chunkRepoint.push({ chunkId: chunks[i].id, toPi: survivorById[chunks[i].performanceIndicatorId] })
    }
    const questions = await prisma.question.findMany({
      where: { performanceIndicatorId: { in: deletedArray } },
      select: { id: true, performanceIndicatorId: true },
    })
    for (let i = 0; i < questions.length; i++) {
      const qPiId = questions[i].performanceIndicatorId
      if (qPiId === null) continue
      questionRepoint.push({ questionId: questions[i].id, toPi: survivorById[qPiId] })
    }
    const flashcards = await prisma.flashcard.findMany({
      where: { performanceIndicatorId: { in: deletedArray } },
      select: { id: true, performanceIndicatorId: true },
    })
    for (let i = 0; i < flashcards.length; i++) {
      flashcardRepoint.push({ flashcardId: flashcards[i].id, toPi: survivorById[flashcards[i].performanceIndicatorId] })
    }
  }

  return {
    before: allPis.length,
    clusters,
    after,
    deletions: deletedArray,
    updates,
    renumber,
    chunkRepoint,
    questionRepoint,
    flashcardRepoint,
  }
}

function printSummary(plan: Plan): void {
  console.log('==========================================================')
  console.log('  PI CONSOLIDATION ' + (DRY_RUN ? 'DRY RUN' : 'EXECUTE'))
  console.log('==========================================================')
  console.log('PIs before:      ' + plan.before)
  console.log('Clusters found:  ' + plan.clusters.length)
  console.log('PIs deleted:     ' + plan.deletions.length)
  console.log('PIs after:       ' + plan.after)
  console.log('')
  console.log('Reference repoints:')
  console.log('  ContentChunks: ' + plan.chunkRepoint.length)
  console.log('  Questions:     ' + plan.questionRepoint.length)
  console.log('  Flashcards:    ' + plan.flashcardRepoint.length)
  console.log('')

  const byPattern: { [key: string]: number } = {}
  for (let c = 0; c < plan.clusters.length; c++) {
    const pp = plan.clusters[c].pattern
    byPattern[pp] = (byPattern[pp] || 0) + 1
  }
  const patKeys = Object.keys(byPattern).sort()
  console.log('Clusters by pattern:')
  for (let i = 0; i < patKeys.length; i++) {
    console.log('  ' + patKeys[i] + ': ' + byPattern[patKeys[i]])
  }
  console.log('')

  // Per-competency before/after counts (rebuild from renumber + clusters).
  const compBefore: { [key: string]: number } = {}
  const compAfter: { [key: string]: number } = {}
  for (let r = 0; r < plan.renumber.length; r++) {
    const comp = plan.renumber[r].newCode.split('.').slice(0, -1).join('.')
    compAfter[comp] = (compAfter[comp] || 0) + 1
  }
  for (let c = 0; c < plan.clusters.length; c++) {
    const comp = plan.clusters[c].competencyCode
    compBefore[comp] = (compBefore[comp] || 0) + (plan.clusters[c].members.length - 1)
    if (!compAfter[comp]) compAfter[comp] = 0
  }
  // Add back the non-merged PIs to compBefore.
  for (const comp in compAfter) {
    compBefore[comp] = (compBefore[comp] || 0) + compAfter[comp]
  }
  const compKeys = Object.keys(compBefore).sort()
  console.log('Per competency (before -> after):')
  for (let i = 0; i < compKeys.length; i++) {
    const k = compKeys[i]
    console.log('  ' + k + ': ' + compBefore[k] + ' -> ' + compAfter[k])
  }
  console.log('')

  console.log('Merges (survivor code, pattern, member count, preview):')
  for (let c = 0; c < plan.clusters.length; c++) {
    const cluster = plan.clusters[c]
    const survivor = cluster.members[0]
    const preview = cluster.mergedDescription.length > 90
      ? cluster.mergedDescription.slice(0, 87) + '...'
      : cluster.mergedDescription
    console.log('  [' + cluster.pattern + '] ' + survivor.code + ' (' + cluster.members.length + ')')
    console.log('      ' + preview)
  }
}

async function execute(plan: Plan): Promise<void> {
  await prisma.$transaction(async (tx) => {
    for (let i = 0; i < plan.updates.length; i++) {
      const u = plan.updates[i]
      await tx.performanceIndicator.update({ where: { id: u.id }, data: { description: u.newDescription } })
    }
    for (let i = 0; i < plan.chunkRepoint.length; i++) {
      const r = plan.chunkRepoint[i]
      await tx.contentChunk.update({ where: { id: r.chunkId }, data: { performanceIndicatorId: r.toPi } })
    }
    for (let i = 0; i < plan.questionRepoint.length; i++) {
      const r = plan.questionRepoint[i]
      await tx.question.update({ where: { id: r.questionId }, data: { performanceIndicatorId: r.toPi } })
    }
    for (let i = 0; i < plan.flashcardRepoint.length; i++) {
      const r = plan.flashcardRepoint[i]
      await tx.flashcard.update({ where: { id: r.flashcardId }, data: { performanceIndicatorId: r.toPi } })
    }
    for (let i = 0; i < plan.deletions.length; i++) {
      await tx.performanceIndicator.delete({ where: { id: plan.deletions[i] } })
    }
    for (let i = 0; i < plan.renumber.length; i++) {
      const r = plan.renumber[i]
      if (r.oldCode !== r.newCode) {
        await tx.performanceIndicator.update({ where: { id: r.id }, data: { code: r.newCode } })
      }
    }
  })
  console.log('Done. ' + plan.deletions.length + ' PIs merged, ' + plan.after + ' PIs remain.')
}

async function main(): Promise<void> {
  const plan = await buildPlan()
  printSummary(plan)

  if (DRY_RUN) {
    console.log('')
    console.log('Dry run complete. Re-run with --execute to apply changes.')
    return
  }

  if (plan.clusters.length === 0) {
    console.log('')
    console.log('No clusters found — nothing to do (idempotent).')
    return
  }

  await execute(plan)
}

main()
  .catch((err) => {
    console.error('ERROR:', err)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
