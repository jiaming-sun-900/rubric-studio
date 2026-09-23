// The ✕ in the corner of a dismissible surface. Shared so the dialog shell and
// the intro letter cannot drift into two different close buttons.
//
// It stays pinned while a tall dialog scrolls (see Modal), so it carries its
// own white fill: the text passing underneath would otherwise show through the
// cross. The focus ring is the app's usual clay-400. It used to be clay-100,
// which on a white panel is a ring nobody can see.
export default function CloseButton({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Close"
      className="pointer-events-auto absolute right-3 top-3 rounded-md bg-white p-1.5 text-slate-400 transition hover:bg-cream hover:text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-clay-400"
    >
      <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5" aria-hidden="true">
        <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    </button>
  )
}
