// Shorten text for a table cell. Line breaks are folded into spaces first, so a
// multi-line question is measured the way it will actually render, and the cut
// falls back to the last word boundary so a cell never ends mid-word. It counts
// characters, not UTF-16 units, so an emoji or other astral character is never
// cut in half.
export function truncate(text, max = 90) {
  if (!text) return ''
  const chars = Array.from(String(text).replace(/\s+/g, ' ').trim())
  if (chars.length <= max) return chars.join('')
  const cut = chars.slice(0, max).join('')
  const space = cut.lastIndexOf(' ')
  return (space > max * 0.6 ? cut.slice(0, space) : cut).trimEnd() + '…'
}

export function formatDate(value) {
  if (!value) return '-'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '-'
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

// Today as YYYY-MM-DD in the visitor's own time zone, for file names.
// toISOString() is UTC, which dates an evening export in the Americas
// tomorrow.
export function localDateStamp(date = new Date()) {
  const pad = (n) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}
