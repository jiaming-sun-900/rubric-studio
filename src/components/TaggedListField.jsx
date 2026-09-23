import { useEffect, useId, useRef } from 'react'
import { listAddBtn, listRemoveBtn } from '../lib/buttonStyles'
import { rowKey } from '../lib/rowKey'
import TrashIcon from './TrashIcon'

// Repeatable tagged list used by the extended-rubric sections (Components,
// Themes, Details). The value is an array of { text, tag } objects. Each row is
// a free-text input plus a tag dropdown; rows can be added and removed. Blank
// rows are seeded on a new form and stripped on save.
//
// `addLabel` doubles as the name of one row ("Component 2 tag"). The controls
// used to be "Row 1 tag" on every card, so a screen reader could not tell the
// first Component from the first Theme.
export default function TaggedListField({
  label,
  labelledBy,
  helper,
  value,
  onChange,
  disabled = false,
  tags = [],
  placeholder = '',
  addLabel = 'Row',
}) {
  const rows = Array.isArray(value) ? value : []
  const id = useId()
  const noun = addLabel.toLowerCase()

  // Keyboard focus follows the list as it changes. Adding a row puts focus on
  // its tag dropdown, the first thing to fill in. Removing one used to leave
  // focus on a button that no longer existed, which drops it back to the top
  // of the page; it now moves to the next row's remove button, or to the add
  // button once the list is empty.
  const tagSelects = useRef(new Map())
  const removeButtons = useRef(new Map())
  const addButton = useRef(null)
  const pendingFocus = useRef(null)

  useEffect(() => {
    const target = pendingFocus.current
    if (!target) return
    pendingFocus.current = null
    if (target.kind === 'add') addButton.current?.focus()
    else if (target.kind === 'tag') tagSelects.current.get(target.key)?.focus()
    else removeButtons.current.get(target.key)?.focus()
  }, [value])

  function updateRow(index, patch) {
    onChange(rows.map((row, i) => (i === index ? { ...row, ...patch } : row)))
  }

  function addRow() {
    // Inherit the tag from the most recent row so consecutive same-tag entries
    // don't require re-selecting the dropdown each time. Text still starts blank.
    // If the last row is still unselected, the new row stays unselected too.
    const previousTag = rows.length > 0 ? (rows[rows.length - 1].tag ?? '') : ''
    const key = rowKey()
    pendingFocus.current = { kind: 'tag', key }
    onChange([...rows, { text: '', tag: previousTag, _key: key }])
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

      <div className="mt-1.5 space-y-4">
        {rows.map((row, index) => (
          <div
            key={row._key ?? index}
            className="space-y-2 rounded-lg border-2 border-cream-200 bg-cream/40 p-3"
          >
            {/* Top row: tag dropdown (left) + Remove (right) */}
            <div className="flex items-center justify-between gap-3">
              <div className="w-full sm:w-80">
                <select
                  ref={(el) => remember(tagSelects.current, row._key, el)}
                  className={`${inputBase} ${row.tag ? 'text-slate-900' : 'text-slate-400'}`}
                  value={row.tag ?? ''}
                  onChange={(e) => updateRow(index, { tag: e.target.value })}
                  disabled={disabled}
                  aria-label={`${addLabel} ${index + 1} tag`}
                >
                  <option value="" disabled>
                    Select tag…
                  </option>
                  {tags.map((t) => (
                    <option key={t.value} value={t.value} className="text-slate-900">
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
              {!disabled && (
                <button
                  ref={(el) => remember(removeButtons.current, row._key, el)}
                  type="button"
                  onClick={() => removeRow(index)}
                  className={listRemoveBtn}
                  aria-label={`Remove ${noun} ${index + 1}`}
                >
                  <TrashIcon />
                </button>
              )}
            </div>
            {/* Full-width multi-line content */}
            <textarea
              className={`${inputBase} text-slate-900`}
              rows={3}
              value={row.text ?? ''}
              onChange={(e) => updateRow(index, { text: e.target.value })}
              disabled={disabled}
              placeholder={placeholder}
              aria-label={`${addLabel} ${index + 1}`}
            />
          </div>
        ))}

        {/* A submitted entry can carry an empty list. Without a line here the
            card was a heading and a description over nothing, which read as a
            page that had failed to load. */}
        {disabled && rows.length === 0 && (
          <p className="text-base text-slate-500">None added.</p>
        )}

        {!disabled && (
          <button ref={addButton} type="button" onClick={addRow} className={listAddBtn}>
            + {addLabel}
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
