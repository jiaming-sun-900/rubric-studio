import Modal from './Modal'

// The note a visitor lands on. Without it the app opens on an empty dashboard
// with no indication of what it is or why it exists, so this says both before
// anything else is read.
//
// Where it came from gets exactly one sentence, the credit to Mimir. The letter
// says no more about the company, its system, or the study than that one line.
//
// The job is to be *read*, which is mostly a matter of not asking for much.
// It is short and written the way the sentence would be said out loud, in the
// first person, with no dashes holding clauses together. The body is set a
// size up from the app's 16px so it reads as a letter, not as interface copy.
//
// "No account, no server, it stays in your browser" is said in a sentence, with
// the reason for it. It used to be three chips under the prose, and three
// fragments with nothing around them did not tell anyone what they meant.
//
// Soft corners, a rule above the signature, and one ink for every word on the
// sheet. A letter is not a page of an interface: setting the body a shade
// lighter than the heading, or tinting a line to mark it as a label, is how a
// UI signals hierarchy, and doing it here made the note read like a product
// panel dressed as a letter. Emphasis comes from size and weight instead. The
// letter quality comes from the sheet, the writing, and the signature at the
// foot, not from a serif body face.
//
// It rides the shared Modal shell, so Esc, a click outside, the ✕ and the
// focus handling all behave exactly as they do in every other dialog. Once
// dismissed it stays dismissed (see Layout), and "About this demo" in the
// banner brings it back.
export default function IntroLetter({ onClose }) {
  return (
    <Modal
      onClose={onClose}
      labelledBy="intro-letter-title"
      showClose
      className="max-w-[42rem] rounded-2xl px-8 py-9 shadow-2xl sm:px-14 sm:py-11"
    >
      <h2 id="intro-letter-title" className="text-3xl font-semibold tracking-tight text-ink">
        About this demo
      </h2>

      <p className="mt-5 text-[22px] leading-relaxed text-ink">
        This is an internal tool, rebuilt so that I could show it to you.
      </p>

      <div className="mt-5 space-y-4 text-lg leading-relaxed text-ink">
        <p>
          It is where a benchmark gets written. An expert picks a question type, writes a
          question, then writes the rubric that says what a correct answer has to contain. I
          built it as an internship project at Mimir in the summer of 2026.
        </p>
        <p>
          Because this copy is only here to be shown, you do not need an account and there is
          no server behind it. Everything you type stays in your own browser.
        </p>
        <p>
          The forms start empty. The worked examples behind each Example button are my own,
          written from published sources. Try writing a submission, then switch to{' '}
          <span className="font-semibold">Reviewer</span> at the top right. That is the other
          half of the app: every submission, the filters, and the CSV export.
        </p>
      </div>

      <div className="mt-7 border-t-2 border-cream-200 pt-5">
        {/* The one serif on the page. A signature is the place where a different
            face reads as intent rather than as an inconsistency. */}
        <p className="font-serif text-xl text-ink">Jiaming Sun</p>
      </div>
    </Modal>
  )
}
