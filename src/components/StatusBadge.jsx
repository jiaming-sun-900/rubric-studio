export default function StatusBadge({ status }) {
  const submitted = status === 'submitted'
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-base font-medium ${
        submitted ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
      }`}
    >
      {submitted ? 'Submitted' : 'Draft'}
    </span>
  )
}
