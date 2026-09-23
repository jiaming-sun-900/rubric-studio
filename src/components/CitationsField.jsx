import { useEffect, useId, useRef } from 'react'
import { CITATION_REASONS } from '../lib/formConfigs'
import { listAddBtn, listRemoveBtn } from '../lib/buttonStyles'
import { rowKey } from '../lib/rowKey'
import TrashIcon from './TrashIcon'

// Repeatable citations table used by the four extended-rubric forms. The value
// is an array of { doi, reason } objects. The field is optional overall — zero
// rows is valid.
//
// Each row has a free-text DOI input and a reason dropdown (fixed options from
// CITATION_REASONS). Rows can be added and removed individually. Focus follows
// adds and removes the same way it does in TaggedListField.
export default function CitationsField({
  label,
  labelledBy,
  helper,
  value,
  onChange,
  disabled = false,
}) {
  const rows = Array.isArray(value) ? value : []
  const id = useId()

  const doiInputs = useRef(new Map())
  const removeButtons = useRef(new Map())
  const addButton = useRef(null)
  const pendingFocus = useRef(null)

  useEffect(() => {
    const target = pendingFocus.current
    if (!target) return
    pendingFocus.current = null
    if (target.kind === 'add') addButton.current?.focus()
    else if (target.kind === 'doi') doiInputs.current.get(target.key)?.focus()
    else removeButtons.current.get(target.key)?.focus()
  }, [value])

  function updateRow(index, patch) {
    onChange(rows.map((row, i) => (i === index ? { ...row, ...patch } : row)))
  }

  function addRow() {
    const key = rowKey()
    pendingFocus.current = { kind: 'doi', key }
    onChange([...rows, { doi: '', reason: '', _key: key }])
  }

  function removeRow(index) {
    const neighbour = rows[index + 1] ?? rows[index - 1]
    pendingFocus.current = neighbour?._key ? { kind: 'remove', key: neighbour._key } : { kind: 'add' }
    onChange(rows.filter((_, i) => i !== index))
  }

  // The text colour is one class or the other, never both: see Field.
  const inputBase =
    'w-full rounded-lg border-2 border-cream-300 bg-white px-3 py-2 text-base shadow-sm transition placeholder:text-slate-400 focus:border-clay-400 focus:outline-none focus:ring-2 focus:ring-clay-100 disabled:cursor-not-allowed disabled:bg-cream-200 disabled:text-slate-600 disabled:opacity-100'

  return (
    <div
      role="group"
      aria-labelledby={label ? `${id}-label` : labelledBy}
      aria-describedby={helper ? `${id}-helper` : undefined}
    >
      {label && (
        <span id={`${id}-label`} className="text-base font-semibold text-slate-800">
          {label}
        </span>
      )}
      {helper && (
        <span id={`${id}-helper`} className="mt-0.5 block text-base text-slate-500">
          {helper}
        </span>
      )}

      <div className="mt-1.5 space-y-3">
        {rows.map((row, index) => (
          // Card + p-3 matches the Components/Themes/Details rows so the trash
          // button lands at the same right edge. DOI + Reason flex to fill; the
          // trash is the fixed (shrink-0) icon column.
          <div
            key={row._key ?? index}
            className="rounded-lg border-2 border-cream-200 bg-cream/40 p-3"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="sm:flex-1">
                <input
                  ref={(el) => remember(doiInputs.current, row._key, el)}
                  type="text"
                  className={`${inputBase} text-slate-900`}
                  value={row.doi ?? ''}
                  onChange={(e) => updateRow(index, { doi: e.target.value })}
                  disabled={disabled}
                  placeholder="DOI (e.g. 10.1000/xyz123)"
                  aria-label={`Citation ${index + 1} DOI`}
                />
              </div>
              <div className="sm:flex-1">
                <select
                  className={`${inputBase} ${row.reason ? 'text-slate-900' : 'text-slate-400'}`}
                  value={row.reason ?? ''}
                  onChange={(e) => updateRow(index, { reason: e.target.value })}
                  disabled={disabled}
                  aria-label={`Citation ${index + 1} reason for including`}
                >
                  <option value="" disabled>
                    Reason for including…
                  </option>
                  {CITATION_REASONS.map((opt) => (
                    <option key={opt} value={opt} className="text-slate-900">
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
              {/* self-end: stacked on a phone, the column stretched the icon
                  button across the whole card and parked the icon at the left,
                  where it read as belonging to nothing. */}
              {!disabled && (
                <button
                  ref={(el) => remember(removeButtons.current, row._key, el)}
                  type="button"
                  onClick={() => removeRow(index)}
                  className={`${listRemoveBtn} self-end sm:self-auto`}
                  aria-label={`Remove citation ${index + 1}`}
                >
                  <TrashIcon />
                </button>
              )}
            </div>
          </div>
        ))}

        {disabled && rows.length === 0 && (
          <p className="text-base text-slate-500">None added.</p>
        )}

        {!disabled && (
          <button ref={addButton} type="button" onClick={addRow} className={listAddBtn}>
            + Citation
          </button>
        )}
      </div>
    </div>
  )
}

// Elements are kept per row key, not per index, so focus can still find a row
// after the rows around it have gone.
function remember(map, key, el) {
  if (el) map.set(key, el)
  else map.delete(key)
}
