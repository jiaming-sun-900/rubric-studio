import { useLayoutEffect, useRef, useState } from 'react'

// Segmented switch between the two views of the app.
//
// The two labels are different lengths, so the thumb cannot be half the track:
// at 50% it either crops "Contributor" or leaves "Reviewer" swimming in white.
// It measures the active button instead and animates both its position and its
// width, so it always sits exactly on the label it belongs to.
const OPTIONS = [
  { value: false, label: 'Contributor' },
  { value: true, label: 'Reviewer' },
]

export default function RoleSwitch({ isAdmin, onChange }) {
  const buttons = useRef([])
  const [thumb, setThumb] = useState(null)
  // The very first placement jumps into position rather than sliding in from
  // the left edge; every later move animates.
  const [ready, setReady] = useState(false)

  useLayoutEffect(() => {
    const el = buttons.current[isAdmin ? 1 : 0]
    if (!el) return

    function measure() {
      setThumb({ left: el.offsetLeft, width: el.offsetWidth })
    }
    measure()
    // Web fonts landing after first paint change the label widths, so keep the
    // thumb tied to the button rather than to a one-time measurement. Both
    // buttons are watched: when Reviewer is on, a change in the width of
    // Contributor moves Reviewer along without resizing it.
    const observer = new ResizeObserver(measure)
    for (const button of buttons.current) if (button) observer.observe(button, { box: 'border-box' })
    const frame = requestAnimationFrame(() => setReady(true))
    return () => {
      observer.disconnect()
      cancelAnimationFrame(frame)
    }
  }, [isAdmin])

  return (
    <div
      role="group"
      aria-label="View the app as"
      className="relative inline-flex rounded-full bg-cream-200 p-1 ring-1 ring-slate-900/5"
    >
      <span
        aria-hidden="true"
        style={thumb ? { left: thumb.left, width: thumb.width } : { opacity: 0 }}
        className={`absolute bottom-1 top-1 rounded-full bg-white shadow-[0_1px_3px_rgba(15,23,42,0.14)] ${
          ready
            ? 'transition-[left,width] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none'
            : ''
        }`}
      />
      {OPTIONS.map((option, i) => {
        const active = option.value === isAdmin
        return (
          <button
            key={option.label}
            ref={(el) => (buttons.current[i] = el)}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(option.value)}
            className={`relative z-10 rounded-full px-4 py-1.5 text-base font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay-400 ${
              active ? 'text-clay-700' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
