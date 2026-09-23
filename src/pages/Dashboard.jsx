import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { fetchAllRows, deleteRow } from '../lib/submissions'
import { getConfigByTable, formLabel } from '../lib/formConfigs'
import { btn } from '../lib/buttonStyles'
import { truncate, formatDate } from '../lib/format'
import ConfirmDialog from '../components/ConfirmDialog'
import Spinner from '../components/Spinner'
import StatusBadge from '../components/StatusBadge'
import TrashIcon from '../components/TrashIcon'

// The keyboard's way into a clickable table row: a real button wearing the
// cell's own text, so it reads as plain content until it is focused.
const rowOpenButton =
  'rounded-sm text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-clay-400'
const rowDeleteButton = 'rounded-md p-2 text-rose-600 transition hover:bg-rose-50'

function sameRow(a, b) {
  return a.__table === b.__table && a.id === b.id
}

// Every trash button used to be named just "Delete draft", so a screen reader's
// list of buttons was the same words over and over. Every row here is by the
// same visitor, so it is the type and the question that tell them apart.
function deleteLabel(row) {
  const type = getConfigByTable(row.__table)?.name
  const question = truncate(row.question, 50)
  return `Delete ${type ? `${type} draft` : 'draft'}${question ? `: ${question}` : ''}`
}

export default function Dashboard() {
  const navigate = useNavigate()
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState(null)
  const heading = useRef(null)
  const list = useRef(null)
  const refocusAt = useRef(null)

  // `loading` starts true and this runs once per visit, so it has no need to
  // set it again before the fetch.
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

  // A deleted row takes the focused trash button with it, and the dialog's own
  // hand-back has nothing left to return to, so a keyboard visitor was dropped
  // on <body> after every delete. Land on the row that moved up into its place
  // instead (or the one above, at the end of the list), and on the page heading
  // once there is nothing left to land on. The same rule as the reviewer page.
  // The query skips whichever of the table and the card list is hidden.
  useEffect(() => {
    const index = refocusAt.current
    if (index == null) return
    refocusAt.current = null
    const openers = [...(list.current?.querySelectorAll('[data-row-open]') ?? [])].filter(
      (el) => el.getClientRects().length > 0,
    )
    ;(openers[Math.min(index, openers.length - 1)] ?? heading.current)?.focus()
  }, [rows])

  function openRow(row) {
    const slug = getConfigByTable(row.__table)?.slug
    if (slug) navigate(`/form/${slug}/${row.id}`)
  }

  function requestDelete(e, row) {
    e.stopPropagation() // don't also open the row for editing
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
        setDeleteError('That draft was no longer there to delete.')
        return
      }
      refocusAt.current = rows.findIndex((r) => sameRow(r, deleteTarget))
      setRows((rs) => rs.filter((r) => !sameRow(r, deleteTarget)))
      setDeleteTarget(null)
    } catch (err) {
      setDeleteError(err.message)
    } finally {
      setDeleting(false)
    }
  }

  // One solid indigo button per page. With no rows the empty state carries it,
  // so the header's copy steps aside; there used to be two identical calls to
  // action stacked on the first screen every visitor sees. It stays hidden
  // while loading so it does not flash in and out on an empty store.
  const actionButtonClass = btn()
  const showHeaderAction = !loading && (Boolean(error) || rows.length > 0)

  // No vertical padding of its own: <main>'s py-8 is the page margin, and every
  // page title sits at the same height.
  return (
    <div>
      <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1
            ref={heading}
            tabIndex={-1}
            className="text-3xl font-semibold tracking-tight text-slate-900 focus:outline-none"
          >
            Submissions
          </h1>
          <p className="mt-1 text-base text-slate-500">
            Drafts can be edited or deleted. Submitted entries are locked and view-only.
          </p>
        </div>
        {showHeaderAction && (
          <Link to="/new" className={actionButtonClass}>
            + New Submission
          </Link>
        )}
      </div>

      {loading ? (
        <Spinner label="Loading your submissions…" />
      ) : error ? (
        <p className="rounded-md bg-rose-50 px-4 py-3 text-base text-rose-700">{error}</p>
      ) : rows.length === 0 ? (
        // The demo starts empty, so this is the first thing every visitor sees.
        <div className="rounded-xl border-2 border-dashed border-cream-300 bg-white p-10 text-center">
          <p className="text-base text-slate-500">No submissions yet.</p>
          <Link to="/new" className={`${actionButtonClass} mt-5`}>
            Create the first submission
          </Link>
        </div>
      ) : (
        <div ref={list}>
          {/* Six columns do not fit a phone, and the table needs about 830px,
              so from `sm` to `lg` the delete column sat off the right edge.
              Below `lg` the card list carries the same rows, two to a line from
              `sm`, as on the reviewer page. The wrapper used to be
              overflow-hidden, which clipped the right-hand columns with no way
              to reach them. `relative` gives the sr-only "Actions" heading,
              which is absolutely positioned, a containing block inside the
              scroller; without it the span escaped and pushed the page
              sideways. */}
          <div className="relative hidden overflow-x-auto rounded-xl border-2 border-cream-200 bg-white shadow-sm lg:block">
            {/* Header text is slate-600: slate-500 on the header's grey fill is
                4.4:1, just short of what 16px text needs. */}
            <table className="min-w-full divide-y-2 divide-cream-200 text-base">
              <thead className="bg-cream text-left text-base font-semibold uppercase tracking-wide text-slate-600">
                <tr>
                  <th className="whitespace-nowrap px-4 py-3">Question Type</th>
                  <th className="px-4 py-3">Application</th>
                  <th className="w-2/5 px-4 py-3">Question</th>
                  <th className="whitespace-nowrap px-4 py-3">Status</th>
                  <th className="whitespace-nowrap px-4 py-3">Last Updated</th>
                  <th className="px-4 py-3 text-right">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-cream-200">
                {rows.map((row) => (
                  <tr
                    key={`${row.__table}-${row.id}`}
                    onClick={() => openRow(row)}
                    className="cursor-pointer transition hover:bg-cream"
                  >
                    <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-900">
                      {/* The row stays clickable for the mouse, but the click
                          needs a real control behind it or the table is
                          unreachable by keyboard — on desktop this is the only
                          way to open a submission. The button carries the
                          action; the row is the convenience. */}
                      <button
                        type="button"
                        data-row-open
                        onClick={(e) => {
                          e.stopPropagation()
                          openRow(row)
                        }}
                        className={rowOpenButton}
                      >
                        {formLabel(getConfigByTable(row.__table))}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{row.application || '-'}</td>
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
                      {row.status === 'draft' && (
                        <button
                          type="button"
                          onClick={(e) => requestDelete(e, row)}
                          aria-label={deleteLabel(row)}
                          className={rowDeleteButton}
                        >
                          <TrashIcon />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ul className="grid gap-3 sm:grid-cols-2 lg:hidden">
            {rows.map((row) => (
              <li
                key={`${row.__table}-${row.id}`}
                className="flex flex-col rounded-xl border-2 border-cream-200 bg-white p-4 shadow-sm"
              >
                {/* Spans, not a div and paragraphs: a button may only hold
                    phrasing content. */}
                <button
                  type="button"
                  data-row-open
                  onClick={() => openRow(row)}
                  className="block w-full text-left"
                >
                  <span className="flex items-start justify-between gap-3">
                    <span className="font-medium text-slate-900">
                      {formLabel(getConfigByTable(row.__table))}
                    </span>
                    <StatusBadge status={row.status} />
                  </span>
                  <span className="mt-2 block break-words text-base text-slate-600">
                    {truncate(row.question) || '-'}
                  </span>
                  {/* A draft with no application yet used to open this line
                      with a bare "- ·". */}
                  <span className="mt-2 block text-base text-slate-500">
                    {[row.application, formatDate(row.updated_at)].filter(Boolean).join(' · ')}
                  </span>
                </button>
                {row.status === 'draft' && (
                  <div className="mt-auto flex justify-end pt-2">
                    <button
                      type="button"
                      onClick={(e) => requestDelete(e, row)}
                      aria-label={deleteLabel(row)}
                      className={rowDeleteButton}
                    >
                      <TrashIcon />
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Delete this draft?"
          confirmLabel="Delete"
          busyLabel="Deleting…"
          busy={deleting}
          error={deleteError}
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeleteTarget(null)}
        >
          This cannot be undone.
        </ConfirmDialog>
      )}
    </div>
  )
}
