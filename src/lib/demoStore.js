// Browser-local data store.
//
// This demo has no accounts and no server: every submission lives in this
// visitor's own localStorage, so the app can be opened by anyone and still
// behave like the real thing. It starts empty and nothing is planted in it.
//
// Rows are stored as one flat array. Each row carries `__table`, the question
// type it belongs to, matching `table` in lib/formConfigs.js.

const STORAGE_KEY = 'rubric-studio:rows'

// Whether this browser lets the page keep anything. Storage can be switched off
// in the privacy settings, and then every read and write throws. The banner
// reads this so it does not promise a save that is not happening.
export const storageWorks = (() => {
  try {
    const probe = 'rubric-studio:probe'
    localStorage.setItem(probe, probe)
    localStorage.removeItem(probe)
    return true
  } catch {
    return false
  }
})()

// The rows a write could not put in storage. Once one has failed, this copy is
// the store for the rest of the visit. Every call reads storage afresh, so
// dropping the write left the demo reporting "Draft saved." and then showing
// an empty dashboard a moment later: nothing lasted even until a reload.
let unsaved = null

function readAll() {
  if (unsaved) return [...unsaved]
  try {
    const rows = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
    return Array.isArray(rows) ? rows : []
  } catch {
    // Storage unavailable, or holding something that is not ours to parse:
    // start empty, so the demo still opens.
    return []
  }
}

function writeAll(rows) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rows))
    unsaved = null
  } catch {
    unsaved = rows
  }
}

// Every row, newest first. `table` narrows to one question type.
export async function listRows({ table = null } = {}) {
  const rows = readAll()
  return rows
    .filter((r) => !table || r.__table === table)
    .sort((a, b) => new Date(b.updated_at ?? 0) - new Date(a.updated_at ?? 0))
}

export async function getRow(table, id) {
  return readAll().find((r) => r.__table === table && r.id === id) ?? null
}

export async function insertRow(table, values) {
  const now = new Date().toISOString()
  const row = { ...values, __table: table, id: newId(), created_at: now, updated_at: now }
  writeAll([...readAll(), row])
  return row
}

export async function updateRow(table, id, values) {
  const rows = readAll()
  const i = rows.findIndex((r) => r.__table === table && r.id === id)
  if (i === -1) return null
  rows[i] = { ...rows[i], ...values, updated_at: new Date().toISOString() }
  writeAll(rows)
  return rows[i]
}

export async function removeRow(table, id) {
  const rows = readAll()
  const next = rows.filter((r) => !(r.__table === table && r.id === id))
  writeAll(next)
  return rows.length - next.length
}

// Throw away everything the visitor has done, back to the empty store of a
// first visit. Also clears the per-form draft caches so no half-typed form
// survives.
export async function resetDemoData() {
  unsaved = null
  try {
    for (const key of Object.keys(localStorage)) {
      if (key.startsWith('rubric-studio:draft:')) localStorage.removeItem(key)
    }
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignore — nothing to clean up if storage is unavailable
  }
}

function newId() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID()
  return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`
}
