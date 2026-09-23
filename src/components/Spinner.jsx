// role="status" so a screen reader hears the label; the ring is decoration.
export default function Spinner({ label = 'Loading…' }) {
  return (
    <div
      role="status"
      className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-slate-500"
    >
      <div
        aria-hidden="true"
        className="h-8 w-8 animate-spin rounded-full border-2 border-cream-300 border-t-clay-600"
      />
      <span className="text-base">{label}</span>
    </div>
  )
}
