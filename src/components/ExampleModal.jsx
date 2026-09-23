import ExampleSection from './ExampleSection'
import Modal from './Modal'

// Read-only popup showing a slice of a form type's real worked example. Used two
// ways:
//   * New Submission "See Example" — the whole example (title "Worked Example").
//   * A form's per-section "Example" button — just that section's slice (title
//     e.g. "Themes — example").
//
// `sections` is an array of { heading, text?, items?, ordered? } — whatever slice
// the caller wants shown. It writes to no input and starts no submission.
//
// There is intentionally NO visible black modal title: each section's own indigo
// heading is self-explanatory and serves as the heading (promoted to the title
// tier in ExampleSection). `title` is kept only as the dialog's aria-label so
// screen readers still get context. Because there is no title bar and no Cancel
// button, it carries the ✕ so the way out is visible.
//
// The line at the foot says where the example came from, so nobody takes it for
// a row of a real benchmark.
export default function ExampleModal({ title = 'Worked example', sections, onClose }) {
  return (
    <Modal
      onClose={onClose}
      label={title}
      showClose
      className="max-w-2xl rounded-xl p-5 shadow-xl sm:p-7"
    >
      {/* The ✕ stays pinned to the top while a long example scrolls, so every
          line, not just the first heading, keeps clear of it; otherwise the
          ends of lines would slide under the cross. On a phone the panel's own
          padding drops to 20px and this gutter to 28px, which still clears the
          ✕ and gives the text back about 20px of a 390px screen. */}
      <div className="space-y-6 pr-7 sm:pr-8">
        {sections.map((section) => (
          <ExampleSection
            key={section.heading}
            heading={section.heading}
            text={section.text}
            items={section.items}
            ordered={section.ordered}
          />
        ))}
      </div>
      <p className="mt-6 border-t-2 border-cream-200 pt-4 text-base text-slate-500 sm:mt-7">
        Written for this demo from published sources.
      </p>
    </Modal>
  )
}
