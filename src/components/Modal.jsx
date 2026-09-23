import { useEffect, useLayoutEffect, useRef } from 'react'
import CloseButton from './CloseButton'

// The one dialog shell in the app.
//
// Before this existed there were eight hand-rolled backdrops, and they had
// drifted: some closed on a click outside and some did not, only the intro
// letter answered Escape, and none of them moved focus. One rule now holds
// everywhere: Escape or a click outside dismisses. That is always the safe
// direction, because on a confirm dialog dismissing *is* Cancel.
//
// `showClose` adds a visible ✕, for the read-only popups (a worked example, a
// submission detail) where there is no Cancel button to make the exit obvious.
//
// The outer layer scrolls, not the panel, so a long example still reaches its
// end on a phone and the backdrop stays tappable at the edges. That scrolling
// needs two layers, not one: centring a flex item that is taller than its
// scroll container puts the item's top edge above the scrollable area, where
// nothing can reach it. `min-h-full` on the inner layer means a tall panel
// grows that box instead of being centred, so the scroll covers all of it.

// Everything that can take focus inside a panel. Used to wrap Tab at the edges.
const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'

// Open dialogs, innermost last. Only the top one answers keys. With two open,
// both used to act on every press, so a single Escape closed the pair, and the
// outer dialog's Tab trap pulled focus back out of the inner one.
const openPanels = []

// The page behind holds still while a dialog is up. Without this a wheel or a
// swipe over the backdrop scrolled the page underneath, and closing the dialog
// left the visitor somewhere they had not been. It is counted, so closing a
// dialog that was opened over another does not unlock the page early.
let scrollLocks = 0
let bodyStyleBefore = null

function lockPageScroll() {
  if (scrollLocks++ > 0) return
  const { body, documentElement } = document
  // Hiding the scrollbar gives the page its width back, and everything centred
  // on the page would jump sideways by that much. Padding the same width back
  // in keeps it where it was.
  const scrollbar = window.innerWidth - documentElement.clientWidth
  bodyStyleBefore = { overflow: body.style.overflow, paddingRight: body.style.paddingRight }
  body.style.overflow = 'hidden'
  if (scrollbar > 0) body.style.paddingRight = `${scrollbar}px`
}

function unlockPageScroll() {
  if (--scrollLocks > 0) return
  Object.assign(document.body.style, bodyStyleBefore)
}

// `className` shapes the panel and owns its rounding, padding and shadow, so a
// surface that is not a rounded card (the intro letter is a sheet of paper) can
// say so without fighting a baked-in `rounded-xl` for stylesheet precedence.
export default function Modal({
  onClose,
  label,
  labelledBy,
  describedBy,
  showClose = false,
  className = 'max-w-md rounded-xl p-6 shadow-xl',
  children,
}) {
  const panel = useRef(null)

  // Read when a key or a click actually happens, never as an effect
  // dependency. Most callers pass a fresh arrow function on every render, and
  // while the effect below depended on it, any re-render of the page behind
  // tore the dialog down and set it up again: focus went to the opener and
  // then to the panel, out from under the button the visitor was on.
  const close = useRef(onClose)
  useLayoutEffect(() => {
    close.current = onClose
  })

  // Whether the press that ends in a click began on the backdrop. Selecting
  // text in the panel and letting go over the backdrop still fires a click
  // there, and that used to close a worked example in the middle of a copy.
  const pressedOnBackdrop = useRef(false)

  useEffect(() => {
    const self = panel.current
    const returnTo = document.activeElement
    openPanels.push(self)
    lockPageScroll()
    // preventScroll: focusing a panel taller than the viewport would otherwise
    // scroll it, opening the dialog a little way down its own content.
    self.focus({ preventScroll: true })

    function onKey(e) {
      if (openPanels[openPanels.length - 1] !== self) return
      if (e.key === 'Escape') {
        close.current()
        return
      }
      // Keep Tab inside the dialog. Without this the next Tab off the last
      // control walks into the page behind the backdrop, where a keyboard
      // visitor is operating a form they cannot see. Controls that are not
      // rendered are skipped, since focusing one silently does nothing and
      // would let Tab escape after all.
      if (e.key !== 'Tab') return
      const stops = [...self.querySelectorAll(FOCUSABLE)].filter(
        (el) => el.getClientRects().length > 0,
      )
      if (stops.length === 0) {
        e.preventDefault()
        return
      }
      const first = stops[0]
      const last = stops[stops.length - 1]
      const active = document.activeElement
      if (!self.contains(active)) {
        e.preventDefault()
        ;(e.shiftKey ? last : first).focus()
      } else if (e.shiftKey && (active === first || active === self)) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && active === last) {
        e.preventDefault()
        first.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      openPanels.splice(openPanels.indexOf(self), 1)
      unlockPageScroll()
      // Hand focus back to whatever opened the dialog, so a keyboard visitor is
      // not dropped at the top of the page each time one closes.
      returnTo?.focus?.()
    }
  }, [])

  // A control that is disabled or removed while it has focus drops that focus
  // on the page body, outside the dialog. ConfirmDialog disables its buttons
  // while it is busy, so this happened on every keyboard delete or submit.
  // After each render, a top dialog that has lost focus takes it back.
  useEffect(() => {
    const self = panel.current
    if (openPanels[openPanels.length - 1] === self && !self.contains(document.activeElement)) {
      self.focus({ preventScroll: true })
    }
  })

  return (
    <div
      className="fixed inset-0 z-20 overflow-y-auto overscroll-contain bg-slate-900/40"
      onPointerDown={(e) => {
        pressedOnBackdrop.current = !panel.current?.contains(e.target)
      }}
      onClick={() => {
        if (pressedOnBackdrop.current) close.current()
      }}
    >
      <div className="flex min-h-full items-start justify-center px-4 py-8 sm:items-center">
        <div
          ref={panel}
          tabIndex={-1}
          role="dialog"
          aria-modal="true"
          aria-label={labelledBy ? undefined : label}
          aria-labelledby={labelledBy}
          aria-describedby={describedBy}
          onClick={(e) => e.stopPropagation()}
          className={`relative w-full bg-white focus:outline-none ${className}`}
        >
          {showClose && (
            // The ✕ rides a strip pinned to the top of the scrolling layer, so
            // on a dialog taller than the screen it is still there once the
            // visitor has read to the end. Set in the panel's corner, it
            // scrolled away with the first line, and on a phone, with no
            // Escape key and only a thin strip of backdrop at each edge, that
            // left no way out but scrolling all the way back up.
            <div className="pointer-events-none absolute inset-0 z-10">
              <div className="sticky top-0 h-0">
                <CloseButton onClick={() => close.current()} />
              </div>
            </div>
          )}
          {children}
        </div>
      </div>
    </div>
  )
}
