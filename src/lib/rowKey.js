// Client-only identity for one row of a repeatable list field.
//
// TaggedListField and CitationsField used the array index as the React key, so
// deleting a row re-pointed every key below it: React reused the DOM nodes, and
// whatever the visitor had focused was suddenly showing the *next* row's text.
// Each row carries a `_key` instead. It is minted here, rides along in the
// browser draft cache so it survives a refresh, and is stripped again by
// sanitizeValues before anything reaches the store.
//
// Because keys survive a refresh, a bare counter is not enough. It restarts at
// zero on every page load and walks through the same numbers in the same order,
// so the first row added after a reload was minted with the very key a row
// restored from the cache already had, and React was handed two siblings with
// one identity. The per-load prefix keeps this load's keys apart from any that
// came back from an earlier one.
const session = Math.random().toString(36).slice(2, 8)
let counter = 0

export function rowKey() {
  counter += 1
  return `row-${session}-${counter}`
}

// Give every row of a list a key, leaving any it already has alone unless a
// sibling claimed it first. Stored rows (saved submissions) have none, since the
// key never gets written. A draft cached before the prefix above existed can
// hold the same key twice, and this is what repairs it on the way back in.
export function withRowKeys(rows) {
  const seen = new Set()
  return rows.map((row) => {
    const keep = row && row._key && !seen.has(row._key)
    const next = keep ? row : { ...row, _key: rowKey() }
    seen.add(next._key)
    return next
  })
}

// Drop the key again on the way out.
export function stripRowKeys(rows) {
  return rows.map(({ _key, ...rest }) => rest)
}
