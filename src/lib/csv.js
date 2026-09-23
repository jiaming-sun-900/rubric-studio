import { getConfigByTable } from './formConfigs'

// CSV column layout, one row per submitted entry:
//   Subject Matter Expert | Affiliation | Question Class | Application |
//   Question | <rubric fields, union across all types> | Answer
//
// Different question types use different rubric fields, so the rubric columns are
// the union of every type's fields. A given row only fills the columns it uses.
// Exported so the reviewer detail modal can render a full read-only submission
// using the same field definitions the CSV export uses (single source of truth).
//
// `get` is the flat text that goes into the spreadsheet cell. The list-shaped
// columns also carry `groups`, the same content before it is flattened, so the
// detail modal can show a real list instead of a cell's worth of semicolons.
export const COLUMNS = [
  { header: 'Subject Matter Expert', get: (r) => r.sme_name },
  { header: 'Affiliation', get: (r) => r.affiliation },
  { header: 'Question Class', get: (r) => getConfigByTable(r.__table)?.name ?? r.__table },
  { header: 'Application', get: (r) => r.application },
  { header: 'Question', get: (r) => r.question },
  // Rubric columns follow the 7-type sequence: Value Retrieval → Scientific
  // Calculation → Scientific Procedure → Information Synthesis → Material
  // Selection → Experimental Design → Failure Analysis.
  { header: 'Literature Values', get: (r) => r.literature_values },
  // Components column carries two different shapes:
  //   * the extended forms and Scientific Procedure — a tagged list
  //     (component_items { text, tag }), grouped by tag.
  //   * Scientific Calculation — plain-text reasoning steps (components).
  {
    header: 'Components',
    get: (r) => {
      if (Array.isArray(r.component_items)) return formatGroups(componentGroups(r))
      return r.components
    },
    groups: (r) => (Array.isArray(r.component_items) ? componentGroups(r) : null),
  },
  {
    header: 'Themes',
    get: (r) => formatGroups(groupTagged(r.theme_items, THEME_ORDER)),
    groups: (r) => groupTagged(r.theme_items, THEME_ORDER),
  },
  {
    header: 'Details',
    get: (r) => formatGroups(groupTagged(r.detail_items, THEME_ORDER)),
    groups: (r) => groupTagged(r.detail_items, THEME_ORDER),
  },
  {
    header: 'Important Citations',
    get: (r) => formatGroups(citationGroups(r.important_citations)),
    groups: (r) => citationGroups(r.important_citations),
  },
  { header: 'Answer', get: (r) => r.correct_answer },
]

// Human-readable labels + display order for the tagged-list tags.
const TAG_LABELS = {
  'must-have': 'Must-have',
  'nice-to-have': 'Nice-to-have',
  ideal: 'Ideal',
  tangential: 'Tangential',
  unrelated: 'Unrelated',
}
const COMPONENT_ORDER = ['must-have', 'nice-to-have']
// Themes/Details: Ideal → Tangential → Unrelated. Only a group with at least
// one item is emitted, so a row that never used "Unrelated" has no such line.
const THEME_ORDER = ['ideal', 'tangential', 'unrelated']

function componentGroups(r) {
  return groupTagged(r.component_items, COMPONENT_ORDER)
}

// One line of a cell. Item text comes from a textarea, so it can hold its own
// line breaks, and in a cell where every line is one tag group a stray break
// would read as the start of a group that does not exist.
function oneLine(value) {
  return String(value ?? '').replace(/\s+/g, ' ').trim()
}

// Group a tagged-list array ([{ text, tag }]) by tag, as
// [{ label: 'Must-have', items: ['item A', 'item B'] }, ...]. Tags are emitted
// in `order` first; any unknown or untagged rows follow, so nothing a
// contributor wrote is dropped from the export.
function groupTagged(items, order) {
  if (!Array.isArray(items)) return []
  const byTag = new Map()
  for (const item of items) {
    const text = oneLine(item?.text)
    if (!text) continue
    const tag = String(item?.tag ?? '').trim()
    if (!byTag.has(tag)) byTag.set(tag, [])
    byTag.get(tag).push(text)
  }
  const known = order.filter((tag) => byTag.has(tag))
  const rest = [...byTag.keys()].filter((tag) => !order.includes(tag))
  return [...known, ...rest].map((tag) => ({
    label: tag ? (TAG_LABELS[tag] ?? tag) : 'Untagged',
    items: byTag.get(tag),
  }))
}

// The citations table (Information Synthesis, Material Selection, Experimental
// Design, Failure Analysis) stores an array of { doi, reason } objects. It is
// one unlabelled group, each entry reading "10.1000/xyz123 (Definitive paper in
// research area)".
function citationGroups(value) {
  if (!Array.isArray(value)) return []
  const items = value
    .map((c) => {
      const doi = oneLine(c?.doi)
      const reason = oneLine(c?.reason)
      if (doi && reason) return `${doi} (${reason})`
      return doi || reason
    })
    .filter(Boolean)
  return items.length ? [{ label: null, items }] : []
}

// Flatten groups into one readable cell, one line per group, e.g.:
//   "Must-have: item A; item B\nNice-to-have: item C"
function formatGroups(groups) {
  return groups
    .map((g) => (g.label ? `${g.label}: ${g.items.join('; ')}` : g.items.join('; ')))
    .join('\n')
}

// Escape a single CSV cell. Wraps in quotes when the value contains a comma,
// quote, or newline, and doubles any embedded quotes.
//
// A leading =, +, -, @, tab or carriage return also gets a ' in front of it.
// Those characters start a formula in Excel and Sheets, and this file is
// written for Excel (see the BOM below), so a rubric line an SME began with
// "=" would otherwise be evaluated rather than read. A bare negative number
// such as "-40" is left alone: it is not a formula, a spreadsheet reads it as
// the number it is, just as it does "40", and an Answer like that belongs in
// the export exactly as written.
function escapeCell(value) {
  const s = value == null ? '' : String(value)
  const formulaLike = /^[=+\-@\t\r]/.test(s) && !/^-\d+(\.\d+)?$/.test(s)
  const safe = formulaLike ? `'${s}` : s
  if (/[",\n\r]/.test(safe)) {
    return `"${safe.replace(/"/g, '""')}"`
  }
  return safe
}

export function buildBenchmarkCsv(rows) {
  const lines = [COLUMNS.map((c) => escapeCell(c.header)).join(',')]
  for (const row of rows) {
    lines.push(COLUMNS.map((c) => escapeCell(c.get(row))).join(','))
  }
  // A UTF-8 byte-order mark up front so Excel opens accented characters
  // correctly. Spelled as an escape because the character itself is invisible
  // in an editor, and deleting it by accident would go unnoticed. Every record,
  // the last one included, ends in CRLF.
  return '﻿' + lines.map((line) => `${line}\r\n`).join('')
}

export function downloadCsv(filename, content) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  // Revoking in the same tick sometimes cancels the download before the browser
  // has read the blob. One turn of the event loop is enough.
  setTimeout(() => URL.revokeObjectURL(url), 0)
}
