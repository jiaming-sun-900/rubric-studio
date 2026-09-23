import { useEffect, useId, useRef, useState } from 'react'

// Small filled "Tip" badge that reveals a short explanatory tooltip. Used to
// surface non-obvious mechanics (e.g. how the repeatable tagged lists work, or
// that reviewer rows are clickable) without cluttering the UI.
//
// It used to open on hover alone, which meant it did not exist on a phone: a
// touch screen has no hover, and the badge was a <button> with nothing bound to
// it, so tapping it did nothing at all. Every rubric section carries one of
// these, and what they explain is exactly what a first-time visitor needs, so
// it now opens on click and closes on Escape, on a click outside, or on a
// second click.
//
// Click is the *only* trigger. It used to also carry `group-hover:block`, and
// because Tailwind emits variants after plain utilities that hover rule beat
// the `hidden` class the closed state relies on: on a desktop the bubble
// appeared on hover while `aria-expanded` still read `false`, and since the
// bubble is click-through, moving the pointer into it un-hovered the group and
// made it vanish mid-sentence.
//
// The bubble is a bottom-anchored sheet on a phone and an absolutely placed
// bubble from `sm` up. The old version was absolute at every width with a fixed
// 320 to 384px width, which ran clean off the right edge of a 390px screen.
//   * placement="right" — opens to the right of the badge (into the empty page
//     margin) so it never covers the section content. Use when the badge sits at
//     a card's right edge with open space beside it.
//   * placement="bottom" (default) — opens below; `align` picks the edge it
//     anchors to ("right" opens leftward to avoid clipping).
//
// `label` is the button's accessible name. It starts with the word on the
// badge, so a visitor using speech input can say what they see. It used to be
// "More information", which is not the word on the badge, and it was the same
// on every card.
export default function InfoHint({
  text,
  label = 'Tip',
  align = 'left',
  placement = 'bottom',
  className = '',
}) {
  const [open, setOpen] = useState(false)
  const root = useRef(null)
  const bubbleId = useId()

  useEffect(() => {
    if (!open) return
    function onKey(e) {
      if (e.key === 'Escape') setOpen(false)
    }
    function onPointerDown(e) {
      if (!root.current?.contains(e.target)) setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    window.addEventListener('pointerdown', onPointerDown)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('pointerdown', onPointerDown)
    }
  }, [open])

  // Desktop-only placement. Below `sm` the bubble is pinned to the bottom of the
  // viewport instead, where it always fits.
  //
  // "right" only opens into the margin where there is a margin to open into.
  // The bubble reaches about 340px past the edge of the 768px form, which the
  // page only has from roughly 1500px wide. Narrower than that it ran off the
  // right of the screen, clipped mid-sentence and scrolling the page sideways,
  // on every laptop. Below 1500px it opens underneath instead, anchored to the
  // badge's right edge so it grows back over the card.
  const bubble =
    placement === 'right'
      ? // Clear the section card (~36px of margin+padding+border) plus a gap, and
        // top-align with the badge so the bubble never rises above it.
        'sm:right-0 sm:top-full sm:mt-2 sm:w-80 min-[1500px]:left-full min-[1500px]:right-auto min-[1500px]:top-0 min-[1500px]:mt-0 min-[1500px]:ml-14'
      : `sm:top-full sm:mt-2 sm:w-96 ${align === 'right' ? 'sm:right-0' : 'sm:left-0'}`

  return (
    <span ref={root} className={`relative inline-flex align-middle ${className}`}>
      <button
        type="button"
        aria-label={label}
        aria-expanded={open}
        aria-describedby={open ? bubbleId : undefined}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center justify-center rounded-lg bg-clay-100 px-2.5 py-1 text-base font-semibold text-clay-700 transition hover:bg-clay-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-clay-400"
      >
        Tip
      </button>
      <span
        id={bubbleId}
        role="tooltip"
        className={`fixed inset-x-4 bottom-4 z-30 rounded-lg border-2 border-cream-200 bg-white p-4 text-base font-normal leading-relaxed text-slate-700 shadow-lg sm:absolute sm:inset-x-auto sm:bottom-auto ${
          open ? 'block' : 'hidden'
        } ${bubble}`}
      >
        {text}
      </span>
    </span>
  )
}
