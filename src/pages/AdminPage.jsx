import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchAllRows, deleteRow } from '../lib/submissions'
import { FORM_LIST, getConfigByTable, formLabel } from '../lib/formConfigs'
import { buildBenchmarkCsv, downloadCsv, COLUMNS } from '../lib/csv'
import { btn } from '../lib/buttonStyles'
import { formatDate, localDateStamp, truncate } from '../lib/format'
import ConfirmDialog from '../components/ConfirmDialog'
import Modal from '../components/Modal'
import Spinner from '../components/Spinner'
import StatusBadge from '../components/StatusBadge'
import TrashIcon from '../components/TrashIcon'
import InfoHint from '../components/InfoHint'

// Fields shown in the read-only detail modal: everything the CSV carries except
// the columns already surfaced in the modal header (SME, affiliation, type).
const DETAIL_FIELDS = COLUMNS.filter(
  (c) => !['Subject Matter Expert', 'Affiliation', 'Question Class'].includes(c.header),
)

// The keyboard's way into a clickable table row, the same control the
// contributor dashboard uses: a real button wearing the cell's own text.
const rowOpenButton =
  'rounded-sm text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-clay-400'
const rowDeleteButton = 'rounded-md p-2 text-rose-600 transition hover:bg-rose-50'

const emptyBox = 'rounded-xl border-2 border-dashed border-cream-300 bg-white p-10 text-center'

function sameRow(a, b) {
  return a.__table === b.__table && a.id === b.id
}

// "Failure Analysis draft by <contributor name>". Every row has an open button and a
// delete button, so without this a screen reader lists a column of identical
// "Delete submission" buttons with nothing to tell them apart.
function describeRow(row) {
  const noun = row.status === 'submitted' ? 'submission' : 'draft'
  const type = getConfigByTable(row.__table)?.name ?? ''
  return `${type} ${noun} by ${row.sme_name || 'an unnamed contributor'}`.trim()
}

function hasContent(field, row) {
  const groups = field.groups?.(row)
  if (groups) return groups.length > 0
  return String(field.get(row) ?? '').trim() !== ''
}

// One field of the detail modal. The list-shaped fields render as real lists
// grouped by tag. They used to be the CSV cell split on its line breaks, which
// showed a whole group as one run of semicolons, and plain text was split the
// same way, so every line of a multi-line answer became its own spaced-out
// paragraph. Plain text now keeps the contributor's own line breaks instead.
function DetailField({ field, row }) {
  const groups = field.groups?.(row)
  return (
    <div>
      <h3 className="text-base font-semibold text-clay-700">{field.header}</h3>
      {groups ? (
        <div className="mt-1 space-y-3">
          {groups.map((group) => (
            <div key={group.label ?? 'items'}>
              {group.label && <p className="text-base font-medium text-slate-600">{group.label}</p>}
              <ul className="list-disc space-y-1 pl-6 text-base leading-relaxed text-slate-800">
                {group.items.map((item, i) => (
                  <li key={i} className="break-words">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-1 whitespace-pre-wrap break-words text-base leading-relaxed text-slate-800">
          {field.get(row)}
        </p>
      )}
    </div>
  )
}

export default function AdminPage() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [typeFilter, setTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [detailRow, setDetailRow] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState(null)
  const detailTitleId = useId()
  const heading = useRef(null)
  const list = useRef(null)
  const refocusAt = useRef(null)

  useEffect(() => {
    let active = true
    fetchAllRows()
      .then((data) => active && setRows(data))
      .catch((err) => active && setError(err.message))
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [])

  const filtered = useMemo(() => {
    return rows.filter((row) => {
      if (typeFilter !== 'all' && row.__table !== typeFilter) return false
      if (statusFilter !== 'all' && row.status !== statusFilter) return false
      return true
    })
  }, [rows, typeFilter, statusFilter])

  const filtersOn = typeFilter !== 'all' || statusFilter !== 'all'

  const submittedCount = useMemo(
    () => rows.filter((r) => r.status === 'submitted').length,
    [rows],
  )

  // A deleted row takes the focused control with it, and the dialog's own
  // hand-back has nothing left to return to, so a keyboard visitor was dropped
  // on <body> after every delete. Land on the row that moved up into its place
  // instead (or the one above, at the end of the list), and on the page heading
  // once there is nothing left to land on. The query skips whichever of the
  // table and the card list is hidden at this width.
  useEffect(() => {
    const index = refocusAt.current
    if (index == null) return
    refocusAt.current = null
    const openers = [...(list.current?.querySelectorAll('[data-row-open]') ?? [])].filter(
      (el) => el.getClientRects().length > 0,
    )
    ;(openers[Math.min(index, openers.length - 1)] ?? heading.current)?.focus()
  }, [rows])

  const closeDetail = () => setDetailRow(null)
  const cancelDelete = () => setDeleteTarget(null)

  function clearFilters() {
    setTypeFilter('all')
    setStatusFilter('all')
  }

  function handleExport() {
    const submitted = rows.filter((r) => r.status === 'submitted')
    downloadCsv(`rubric-studio-${localDateStamp()}.csv`, buildBenchmarkCsv(submitted))
  }

  function requestDelete(e, row) {
    e.stopPropagation() // don't also open the detail modal
    setDeleteError(null)
    setDeleteTarget(row)
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    setDeleteError(null)
    try {
      const removed = await deleteRow({ table: deleteTarget.__table, id: deleteTarget.id })
      if (removed === 0) {
        setDeleteError('That submission was no longer there to delete.')
        return
      }
      refocusAt.current = filtered.findIndex((r) => sameRow(r, deleteTarget))
      setRows((rs) => rs.filter((r) => !sameRow(r, deleteTarget)))
      setDeleteTarget(null)
    } catch (err) {
      setDeleteError(err.message)
    } finally {
      setDeleting(false)
    }
  }

  const selectClass =
    'min-w-0 flex-1 rounded-lg border-2 border-cream-300 bg-white px-3 py-1.5 text-base text-slate-700 shadow-sm focus:border-clay-400 focus:outline-none focus:ring-2 focus:ring-clay-100 sm:flex-none'

  // The label column is fixed on a phone so the two selects start at the same
  // edge instead of wherever "Type" and "Status" happen to end.
  const filterLabel = 'flex items-center gap-2 text-base text-slate-600'
  const filterLabelText = 'w-14 shrink-0 sm:w-auto'

  const detailFields = detailRow ? DETAIL_FIELDS.filter((f) => hasContent(f, detailRow)) : []
  const deleteNoun = deleteTarget?.status === 'submitted' ? 'submission' : 'draft'

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1
              ref={heading}
              tabIndex={-1}
              className="text-3xl font-semibold tracking-tight text-slate-900 focus:outline-none"
            >
              All Submissions
            </h1>
            {rows.length > 0 && (
              <InfoHint text="Open a row to read the whole submission. The trash icon deletes it, drafts and submitted entries alike." />
            )}
          </div>
          <p className="mt-1 text-base text-slate-500">
            Every contributor&rsquo;s entries, drafts included. Only submitted entries are exported.
          </p>
        </div>
        <button
          type="button"
          onClick={handleExport}
          disabled={submittedCount === 0}
          className={btn({ variant: 'success' })}
        >
          Export CSV ({submittedCount} submitted)
        </button>
      </div>

      {loading ? (
        <Spinner label="Loading submissions…" />
      ) : error ? (
        <p className="rounded-md bg-rose-50 px-4 py-3 text-base text-rose-700">{error}</p>
      ) : rows.length === 0 ? (
        // The store starts empty, and a visitor may well open Reviewer before
        // writing anything. Filters over nothing would only be noise here.
        // The Reviewer view already includes the contributor pages (the nav
        // carries both), so this is a plain link that leaves the switch alone
        // and keeps Review one click away once the entry is written.
        <div className={emptyBox}>
          <p className="text-base text-slate-500">No submissions yet.</p>
          <p className="mt-1 text-base text-slate-500">
            Anything written on the Contributor side shows up here.
          </p>
          <Link to="/new" className={`${btn()} mt-5`}>
            Create the first submission
          </Link>
        </div>
      ) : (
        <>
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <label className={filterLabel}>
              <span className={filterLabelText}>Type</span>
              <select
                className={selectClass}
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="all">All types</option>
                {FORM_LIST.map((c) => (
                  <option key={c.table} value={c.table}>
                    {formLabel(c)}
                  </option>
                ))}
              </select>
            </label>
            <label className={filterLabel}>
              <span className={filterLabelText}>Status</span>
              <select
                className={selectClass}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All statuses</option>
                <option value="draft">Draft</option>
                <option value="submitted">Submitted</option>
              </select>
            </label>
            {/* Announced, so changing a filter says what it did to a visitor
                who cannot see the table redraw. */}
            <p aria-live="polite" className="text-base text-slate-500 sm:ml-auto">
              {filtersOn ? `Showing ${filtered.length} of ${rows.length}` : ''}
            </p>
          </div>

          {filtered.length === 0 ? (
            // Also where a delete lands when it removes the last row a filter
            // matched, so it offers the way back rather than a dead end.
            <div className={emptyBox}>
              <p className="text-base text-slate-500">No submissions match these filters.</p>
              <button
                type="button"
                onClick={clearFilters}
                className={`${btn({ variant: 'secondary', size: 'sm' })} mt-4`}
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div ref={list}>
              {/* The table needs about 830px, more than a tablet held upright
                  has, and the delete button is the column that falls off the
                  right edge. Below `lg` the card list carries the same rows,
                  two to a line from `sm`. Affiliation rides under the name
                  rather than taking a column, which is what leaves room for the
                  question: one visitor writes every row under one name, so the
                  question is what tells rows apart.
                  `relative` gives the sr-only "Actions" heading, which is
                  absolutely positioned, a containing block inside the scroller.
                  Without it the span escaped the overflow and pushed the whole
                  page sideways wherever the table was wider than the screen. */}
              <div className="relative hidden overflow-x-auto rounded-xl border-2 border-cream-200 bg-white shadow-sm lg:block">
                <table className="min-w-full divide-y-2 divide-cream-200 text-base">
                  <thead className="bg-cream text-left text-base font-semibold uppercase tracking-wide text-slate-600">
                    <tr>
                      <th className="whitespace-nowrap px-4 py-3">Contributor</th>
                      <th className="whitespace-nowrap px-4 py-3">Question Type</th>
                      <th className="w-2/5 px-4 py-3">Question</th>
                      <th className="whitespace-nowrap px-4 py-3">Status</th>
                      <th className="whitespace-nowrap px-4 py-3">Last Updated</th>
                      <th className="px-4 py-3 text-right">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y-2 divide-cream-200">
                    {filtered.map((row) => (
                      <tr
                        key={`${row.__table}-${row.id}`}
                        onClick={() => setDetailRow(row)}
                        className="cursor-pointer transition hover:bg-cream"
                      >
                        <td className="px-4 py-3">
                          {/* The row stays clickable for the mouse, but opening a
                              detail view needs a real control or the reviewer
                              table cannot be used from the keyboard at all. */}
                          <button
                            type="button"
                            data-row-open
                            onClick={(e) => {
                              e.stopPropagation()
                              setDetailRow(row)
                            }}
                            aria-label={`Open ${describeRow(row)}`}
                            className={`${rowOpenButton} font-medium text-slate-900`}
                          >
                            {row.sme_name || '-'}
                          </button>
                          {row.affiliation && (
                            <p className="break-words text-slate-500">{row.affiliation}</p>
                          )}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                          {formLabel(getConfigByTable(row.__table))}
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          <span className="block break-words">{truncate(row.question) || '-'}</span>
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={row.status} />
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-slate-500">
                          {formatDate(row.updated_at)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            type="button"
                            onClick={(e) => requestDelete(e, row)}
                            aria-label={`Delete ${describeRow(row)}`}
                            className={rowDeleteButton}
                          >
                            <TrashIcon />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <ul className="grid gap-3 sm:grid-cols-2 lg:hidden">
                {filtered.map((row) => (
                  <li
                    key={`${row.__table}-${row.id}`}
                    className="flex flex-col rounded-xl border-2 border-cream-200 bg-white p-4 shadow-sm"
                  >
                    {/* Spans, not a div and paragraphs: a button may only hold
                        phrasing content. The same card as the dashboard's. */}
                    <button
                      type="button"
                      data-row-open
                      onClick={() => setDetailRow(row)}
                      className="block w-full text-left"
                    >
                      <span className="flex items-start justify-between gap-3">
                        <span className="font-medium text-slate-900">{row.sme_name || '-'}</span>
                        <StatusBadge status={row.status} />
                      </span>
                      <span className="mt-2 block text-base text-slate-600">
                        {formLabel(getConfigByTable(row.__table))}
                      </span>
                      <span className="mt-2 block break-words text-base text-slate-600">
                        {truncate(row.question) || '-'}
                      </span>
                      <span className="mt-2 block text-base text-slate-500">
                        {[row.affiliation, formatDate(row.updated_at)].filter(Boolean).join(' · ')}
                      </span>
                    </button>
                    <div className="mt-auto flex justify-end pt-2">
                      <button
                        type="button"
                        onClick={(e) => requestDelete(e, row)}
                        aria-label={`Delete ${describeRow(row)}`}
                        className={rowDeleteButton}
                      >
                        <TrashIcon />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}

      {detailRow && (
        <Modal
          onClose={closeDetail}
          labelledBy={detailTitleId}
          showClose
          className="max-w-2xl rounded-xl p-7 shadow-xl"
        >
          {/* pr-10 keeps the status badge clear of the ✕ in the corner. */}
          <div className="mb-6 pr-10">
            <div className="flex flex-wrap items-center gap-3">
              <h2
                id={detailTitleId}
                className="text-2xl font-semibold tracking-tight text-slate-900"
              >
                {formLabel(getConfigByTable(detailRow.__table))}
              </h2>
              <StatusBadge status={detailRow.status} />
            </div>
            <p className="mt-1 text-base text-slate-500">
              {detailRow.sme_name || 'No name given'}
              {detailRow.affiliation ? ` · ${detailRow.affiliation}` : ''} ·{' '}
              <span className="whitespace-nowrap">
                Last updated {formatDate(detailRow.updated_at)}
              </span>
            </p>
          </div>

          {detailFields.length > 0 ? (
            <div className="space-y-6">
              {detailFields.map((field) => (
                <DetailField key={field.header} field={field} row={detailRow} />
              ))}
            </div>
          ) : (
            // A draft can be saved before anything is typed into it.
            <p className="text-base text-slate-500">Nothing has been written in this draft yet.</p>
          )}
        </Modal>
      )}

      {deleteTarget && (
        <ConfirmDialog
          title={`Delete this ${deleteNoun}?`}
          confirmLabel="Delete"
          busyLabel="Deleting…"
          busy={deleting}
          error={deleteError}
          onConfirm={handleConfirmDelete}
          onCancel={cancelDelete}
        >
          This permanently deletes{' '}
          {deleteTarget.sme_name ? `${deleteTarget.sme_name}’s` : 'this'}{' '}
          {getConfigByTable(deleteTarget.__table)?.name} {deleteNoun}.
        </ConfirmDialog>
      )}
    </div>
  )
}
