// One rubric section rendered inside a read-only worked-example popup: an indigo
// bold subtitle, then its content. Shared by the New Submission "See Example"
// modal and the per-section "Example" popups on the form.
//
// A section provides content one of two ways:
//   * `items` (array) — an explicit list, `ordered` for numbered steps. Each
//     item is a string or { text, sub: [...] } for a nested sub-list.
//   * `text` (string) — ";"-separated, one bullet per item.
//
// The question and the correct answer are prose, so they are never split and
// never bulleted. Every other section is a rubric list and is bulleted even when
// it holds a single entry: a lone "Unrelated themes" point used to drop to a
// paragraph, and next to its bulleted neighbours it read as a caption rather
// than as one row of the list.
const PROSE_HEADINGS = new Set(['question', 'correct answer'])

export default function ExampleSection({ heading, text, items, ordered }) {
  const prose = !items && PROSE_HEADINGS.has(heading.toLowerCase())
  const list =
    items ??
    (text ?? '')
      .split(';')
      .map((s) => s.trim())
      .filter(Boolean)
  const ListTag = ordered ? 'ol' : 'ul'
  return (
    <section>
      {/* With no black modal title above it, this indigo heading IS the popup's
          title, so from `sm` up it sits on the 24px title tier (content below
          stays 16px). On a phone it steps down to 20px so that "Nice-to-have
          components" fits on one line. It is a real heading, so a screen reader
          can move from section to section. */}
      <h2 className="text-xl font-bold tracking-tight text-clay-700 sm:text-2xl">{heading}</h2>
      {prose ? (
        <p className="mt-1 break-words text-base leading-relaxed text-slate-800">
          {display(text)}
        </p>
      ) : (
        <ListTag
          className={`mt-2 space-y-1 break-words pl-6 text-base leading-relaxed text-slate-800 ${
            ordered ? 'list-decimal' : 'list-disc'
          }`}
        >
          {list.map((item, i) => {
            const main = typeof item === 'object' ? item.text : item
            const sub = typeof item === 'object' ? item.sub : null
            return (
              <li key={i}>
                {display(main)}
                {sub && (
                  <ul className="mt-1 list-disc space-y-1 pl-6">
                    {sub.map((s, j) => (
                      <li key={j}>{display(s)}</li>
                    ))}
                  </ul>
                )}
              </li>
            )
          })}
        </ListTag>
      )}
    </section>
  )
}

// An entry as it is shown: capitalised, kept from breaking inside short
// notation, and with each DOI turned into a link to the paper.
function display(s) {
  return linkDois(keepTogether(capitalizeItem(s)))
}

// Every DOI in the examples is there to be checked, so each one opens the paper
// at doi.org, in a new tab so the popup and the form behind it stay put. The
// link is an inline block, so a DOI that will not fit on the rest of a line
// moves down whole instead of splitting at one of its own hyphens, where
// "S1369-7021(05)70934-2" read as a hyphenated word.
const DOI = /10\.\d{4,9}\/\S+/g
function linkDois(str) {
  const parts = []
  let last = 0
  for (const match of str.matchAll(DOI)) {
    let doi = match[0]
    // Trailing punctuation belongs to the sentence, and so does a closing
    // bracket the DOI did not open: "(DOI 10.1021/ja800073m)".
    while (/[.,:]$/.test(doi) || (doi.endsWith(')') && count(doi, ')') > count(doi, '('))) {
      doi = doi.slice(0, -1)
    }
    parts.push(str.slice(last, match.index))
    parts.push(
      <a
        key={match.index}
        href={`https://doi.org/${doi}`}
        target="_blank"
        rel="noreferrer"
        className="inline-block max-w-full rounded-sm text-clay-700 underline decoration-clay-200 underline-offset-2 transition hover:decoration-clay-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-clay-400"
      >
        {doi}
        <span className="sr-only"> (opens in a new tab)</span>
      </a>,
    )
    last = match.index + doi.length
  }
  if (parts.length === 0) return str
  parts.push(str.slice(last))
  return parts
}

function count(str, ch) {
  return str.split(ch).length - 1
}

// Stop a line from breaking inside a short piece of notation. On a 390px screen
// "√(h² + k² + l²)" used to end one line at the second "+", and "λ =" sat at the
// end of a line with its value on the next. Swapping in no-break spaces keeps
// together:
//   * an "=" or a "×" with both sides: "θ = 21.65°", "11 × 10⁻⁶/K"
//   * a number with the short unit or word after it: "2.088 Å", "5 at%",
//     "10 mA/cm²", "1 W/(m·K)", "0.40320(1) nm"
//   * a short bracket: "(h² + k² + l²)", "(2 sin 21.65°)", "(98.07 N)"
// Longer runs still wrap, and `break-words` on the text catches any piece that
// is wider than the line on its own.
const NBSP = '\u00a0'
function keepTogether(s) {
  return (s ?? '')
    .replace(/ ([=×]) /g, `${NBSP}$1${NBSP}`)
    .replace(/(\d\)?) (?=[^\s\d(]\S{0,7}(?:[\s,.:)]|$))/g, `$1${NBSP}`)
    .replace(/\([^()]{1,18}\)/g, (m) => m.replace(/ /g, NBSP))
}

// Capitalise the first letter of an example entry for display. Display-only: it
// never touches what SMEs type.
//
// It only ever raises an ordinary lowercase word, because in scientific text the
// case of the first character is often the meaning. Left alone:
//   * links and identifiers ("https://…", "doi:…", "10.1021/…")
//   * symbols and units: "a = 0.403 nm" is a lattice constant, not the article,
//     and "d(111)", "n-type", "pH", "mV/s" or "sp2" would all be changed in
//     meaning by a capital
//   * anything that starts with a digit, a capital, a Greek letter or a sign
// The article "a" is told apart from the symbol by what follows it: a word for
// the article, an "=", a bracket or a comparison for the symbol.
function capitalizeItem(s) {
  const str = s ?? ''
  if (/^(https?:\/\/|www\.|doi[:\s]|10\.\d{4,}\/)/i.test(str)) return str
  const first = str.match(/^\S+/)?.[0] ?? ''
  // An ordinary word: lowercase ASCII letters, perhaps with an apostrophe or
  // hyphenated tail ("graphite’s", "rare-earth"), and nothing else before any
  // trailing punctuation.
  if (!/^[a-z]{2,}([’'-][a-z]+)*[,.:]?$/.test(first) && !/^a\s+[a-z]/.test(str)) return str
  return str.charAt(0).toUpperCase() + str.slice(1)
}
