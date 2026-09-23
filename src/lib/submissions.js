import { listRows, removeRow } from './demoStore'

// Submissions of every question type in one list, newest first. Each row
// carries `__table` naming its type (see demoStore.js).
export async function fetchAllRows() {
  return listRows()
}

// Permanently delete one submission. Returns how many rows were removed, which
// callers use to detect a delete that did not take.
export async function deleteRow({ table, id }) {
  return removeRow(table, id)
}
