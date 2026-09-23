import { useId } from 'react'
import Modal from './Modal'
import { btn } from '../lib/buttonStyles'

// The five confirm dialogs in the app (reset the demo, delete a draft, delete a
// submission, submit an entry, clear a form) were five copies of the same
// markup that had drifted apart in button width and dismiss behaviour. They are
// one component now, so they cannot drift again.
//
// The body is the dialog's description, so a screen reader announces what is
// about to happen along with the question, not the question alone.
//
// Nothing dismisses it while the action is in flight. Cancel was already
// disabled for that stretch, but Escape and a click outside still closed the
// dialog, and the delete or submit it had started went on to finish unseen.
export default function ConfirmDialog({
  title,
  children,
  error,
  confirmLabel,
  busyLabel,
  busy = false,
  variant = 'danger',
  onConfirm,
  onCancel,
}) {
  const bodyId = useId()
  return (
    <Modal
      onClose={busy ? () => {} : onCancel}
      label={title}
      describedBy={children ? bodyId : undefined}
    >
      <h2 className="text-2xl font-semibold text-slate-900">{title}</h2>
      {children && (
        <div id={bodyId} className="mt-2 text-base text-slate-600">
          {children}
        </div>
      )}
      {error && (
        <p role="alert" className="mt-3 rounded-md bg-rose-50 px-3 py-2 text-base text-rose-700">
          {error}
        </p>
      )}
      <div className="mt-6 flex flex-wrap justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={busy}
          className={`${btn({ variant: 'secondary' })} min-w-[8rem]`}
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={busy}
          className={`${btn({ variant })} min-w-[8rem]`}
        >
          {busy && busyLabel ? busyLabel : confirmLabel}
        </button>
      </div>
    </Modal>
  )
}
