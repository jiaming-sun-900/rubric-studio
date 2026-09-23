// The app mark: a card with three rubric rows, the top one checked off. Drawn
// inline rather than shipped as an image so it scales, needs no second asset,
// and picks up the app's indigo from the palette.
export default function BrandMark({ className = '' }) {
  return (
    <svg viewBox="0 0 36 36" fill="none" className={className} aria-hidden="true">
      <rect x="2" y="2" width="32" height="32" rx="8" className="fill-clay-600" />
      <path
        d="M9.5 12.5l2.2 2.2 4.3-4.3"
        stroke="white"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect x="19" y="11" width="8.5" height="2.2" rx="1.1" fill="white" opacity="0.95" />
      <rect x="9.5" y="17.4" width="18" height="2.2" rx="1.1" fill="white" opacity="0.6" />
      <rect x="9.5" y="23.4" width="12.5" height="2.2" rx="1.1" fill="white" opacity="0.6" />
    </svg>
  )
}
