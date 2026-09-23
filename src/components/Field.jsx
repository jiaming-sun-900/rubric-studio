import { useId } from 'react'

// Labeled input/textarea/select with helper text and an optional "required" marker.
// Used by the metadata section and every rubric field.
// Pass `options` (array of strings) to render a dropdown instead of a text field.
//
// A card that heads itself passes label={null} and names the control through
// `labelledBy`, the id of that card heading. The whole field used to be one
// <label> wrapping the helper as well, so a label-less control was named by its
// helper sentence at best, and on the forms whose question has no helper it had
// no name at all.
export default function Field({
  label,
  labelledBy,
  helper,
  value,
  onChange,
  required = false,
  disabled = false,
  multiline = true,
  rows = 3,
  placeholder = '',
  options = null,
}) {
  const id = useId()
  const helperId = `${id}-helper`

  // Disabled text is slate-600 rather than slate-500: a submitted entry is shown
  // in disabled controls, and slate-500 on the grey fill fell short of a
  // readable contrast for what is, at that point, the content of the page.
  const base =
    'w-full rounded-lg border-2 border-cream-300 bg-white px-3 py-2 text-base shadow-sm transition placeholder:text-slate-400 focus:border-clay-400 focus:outline-none focus:ring-2 focus:ring-clay-100 disabled:cursor-not-allowed disabled:bg-cream-200 disabled:text-slate-600 disabled:opacity-100'

  const shared = {
    id,
    value: value ?? '',
    onChange: (e) => onChange(e.target.value),
    disabled,
    'aria-labelledby': label ? undefined : labelledBy,
    'aria-describedby': helper ? helperId : undefined,
    'aria-required': required || undefined,
  }

  function renderControl() {
    if (options) {
      // The colour is one class or the other, never both. With text-slate-900 in
      // the base and slate-400 added for the placeholder, the stylesheet order
      // let 900 win, so "Select an application…" looked like a chosen value.
      return (
        <select {...shared} className={`${base} ${value ? 'text-slate-900' : 'text-slate-400'}`}>
          <option value="" disabled>
            {placeholder || 'Select…'}
          </option>
          {options.map((opt) => (
            <option key={opt} value={opt} className="text-slate-900">
              {opt}
            </option>
          ))}
        </select>
      )
    }
    if (multiline) {
      return (
        <textarea
          {...shared}
          className={`${base} text-slate-900`}
          rows={rows}
          placeholder={placeholder}
        />
      )
    }
    return (
      <input
        {...shared}
        type="text"
        className={`${base} text-slate-900`}
        placeholder={placeholder}
      />
    )
  }

  return (
    <div>
      {label && (
        <label htmlFor={id} className="block text-base font-semibold text-slate-800">
          {label}
          {required && (
            <span className="ml-1 text-rose-500" aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}
      {helper && (
        <p id={helperId} className="mt-0.5 text-base text-slate-500">
          {helper}
        </p>
      )}
      <div className="mt-1.5">{renderControl()}</div>
    </div>
  )
}
