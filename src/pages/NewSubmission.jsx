import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FORM_LIST } from '../lib/formConfigs'
import { getExampleBySlug } from '../lib/exampleData'
import ExampleButton from '../components/ExampleButton'
import ExampleModal from '../components/ExampleModal'

export default function NewSubmission() {
  // The type whose worked example is shown in the read-only modal. `null` = closed.
  const [exampleType, setExampleType] = useState(null)

  const example = exampleType ? getExampleBySlug(exampleType.slug) : null

  return (
    // No padding of its own above the title: every page starts at <main>'s edge,
    // so the title does not jump when moving between them. The header's
    // "Submissions" link, which stays selected across this whole area, is the
    // way back.
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">New Submission</h1>
        <p className="mt-1 text-base text-slate-500">
          Pick the kind of question you want to write. Each type asks for a different rubric.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {FORM_LIST.map((config) => (
          // The card is not itself a link: the title's stretched ::before covers
          // the card, so the whole surface is clickable while the example button
          // stays a real sibling button. It used to be a <Link> wrapping a
          // <button>, which is invalid nesting and put the button out of reach
          // of the keyboard.
          <div
            key={config.slug}
            className="group relative flex flex-col rounded-2xl border-2 border-cream-200 bg-white p-7 shadow-sm transition focus-within:border-clay-400 hover:border-clay-400 hover:shadow-md"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-clay-100 text-base font-bold text-clay-700 transition group-hover:bg-clay-200">
                {config.number}
              </span>
              {/* 20px, on the ladder between the 30px page title and the 16px
                  definition. It was 18px, a size nothing else on the site uses.
                  A heading, so the seven types can be walked by heading. */}
              <h2 className="text-xl font-semibold">
                <Link
                  to={`/form/${config.slug}`}
                  className="text-slate-900 transition before:absolute before:inset-0 before:rounded-2xl group-hover:text-clay-700 focus:outline-none focus-visible:underline"
                >
                  {config.name}
                </Link>
              </h2>
            </div>
            <p className="mt-4 text-base leading-relaxed text-slate-500">{config.definition}</p>
            {/* Always visible. Hidden behind :hover it did not exist on a touch
                screen and could not be reached by keyboard. */}
            <div className="relative z-10 mt-auto flex justify-end pt-5">
              <ExampleButton
                label="See example"
                ariaLabel={`See example: ${config.name}`}
                onClick={() => setExampleType(config)}
              />
            </div>
          </div>
        ))}
      </div>

      {example && (
        <ExampleModal
          title={`${exampleType.name}: worked example`}
          sections={[{ heading: 'Question', text: example.question }, ...example.sections]}
          onClose={() => setExampleType(null)}
        />
      )}
    </div>
  )
}
