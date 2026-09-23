// Small "Example" button that opens a read-only worked-example popup for a single
// form section (Question / Components / Themes / Details). Deliberately styled to
// echo the InfoHint "Tip" badge in size and weight, but with a distinct light
// *green*, rounded-square look so the two are never confused: the Tip badge
// explains the mechanic; this button shows a real worked example of the section.
//
// It is never rendered on the Important Citations section (a universal rule — see
// SubmissionForm): a sample DOI/reason in a popup wouldn't help an SME there. The
// citations do appear in the full worked example on New Submission.
//
// `ariaLabel` names the button for a screen reader when the visible word alone
// would not say which example it opens: seven "See example" buttons on New
// Submission, one "Example" per card on a form. Like InfoHint's `label`, it
// should start with the visible text, so a visitor using speech input can say
// what they see, e.g. "See example: Value Retrieval" or "Example: Components".
//
// The focus ring is the app's usual clay-400 on `focus-visible`, as on InfoHint.
// It used to be emerald-200 on an emerald-100 fill, which nobody could see.
//
// Lifts on hover like every other button (visual convention).
export default function ExampleButton({ onClick, label = 'Example', ariaLabel, className = '' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className={`inline-flex items-center justify-center rounded-md bg-emerald-100 px-2.5 py-1 text-base font-semibold text-emerald-700 shadow-sm transition duration-150 ease-out hover:-translate-y-0.5 hover:bg-emerald-200 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-clay-400 ${className}`}
    >
      {label}
    </button>
  )
}
