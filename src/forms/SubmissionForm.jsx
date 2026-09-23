import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getRow, insertRow, updateRow } from '../lib/demoStore'
import ConfirmDialog from '../components/ConfirmDialog'
import Field from '../components/Field'
import CitationsField from '../components/CitationsField'
import TaggedListField from '../components/TaggedListField'
import Modal from '../components/Modal'
import Spinner from '../components/Spinner'
import StatusBadge from '../components/StatusBadge'
import InfoHint from '../components/InfoHint'
import ExampleButton from '../components/ExampleButton'
import ExampleModal from '../components/ExampleModal'
import { btn } from '../lib/buttonStyles'
import { formLabel } from '../lib/formConfigs'
import { getExampleSlice } from '../lib/exampleData'
import { rowKey, withRowKeys, stripRowKeys } from '../lib/rowKey'

// Fixed list of application domains. "Other" is the catch-all.
const APPLICATION_OPTIONS = [
  'Aerospace',
  'Batteries',
  'Catalysis',
  'Computing',
  'Decarbonization',
  'Electrocatalysis',
  'Energy Harvesting',
  'Magnets',
  'Nuclear',
  'Photonics',
  'Robotics',
  'Sensors',
  'Superconductors',
  'Telecommunications',
  'Wastewater Remediation',
  'Other',
]

const METADATA_FIELDS = [
  { name: 'sme_name', label: 'Name', required: true },
  { name: 'affiliation', label: 'Affiliation', required: true },
  {
    name: 'application',
    label: 'Application Domain',
    required: true,
    placeholder: 'Select an application…',
    options: APPLICATION_OPTIONS,
  },
]

// The rubric cards all head themselves at the same tier: 20px semibold,
// between the 30px page title and the 16px labels and body. It used to be
// 24px bold over 20px labels, four points apart from the page title, which
// left the whole form reading as one heavy block.
const sectionHeading = 'text-xl font-semibold tracking-tight text-slate-900'

// Every card heads itself at that tier, whichever of the three kinds of card
// it is. The Question card and the Value Retrieval cards used to be headed by
// their field's own label instead, which left them a size below the rubric
// sections sitting right beneath them on the same page.
//
// Declared out here, not inside SubmissionForm: a component defined in a render
// body is a brand-new component *type* on every render, so React threw away and
// rebuilt every card heading on the form with each keystroke.
//
// An h2, because the page title is the h1 and nothing sits between them. The
// heading also names the card's control (see `labelledBy` in Field), which is
// why the asterisk is hidden from assistive tech: the control says it is
// required itself, and "Question star" is not a name.
function CardHeading({ id, children, required }) {
  return (
    <h2 id={id} className={sectionHeading}>
      {children}
      {required && (
        <span className="ml-1 text-rose-500" aria-hidden="true">
          *
        </span>
      )}
    </h2>
  )
}

// What the Tip badge on a tagged-list card says. It names that card's own add
// button. It used to list all three ("+ Component / + Theme / + Detail") on
// every card, including Scientific Procedure, which only has the one.
function listHint(section) {
  const add = section.fields.find((f) => f.type === 'tagged-list')?.addLabel ?? 'Row'
  return `Add one row per point. Pick a tag for the row, then write the point in the box under it. “+ ${add}” adds another row.`
}

// Shared engine behind all 7 question-type forms. Each form file passes its
// config (see lib/formConfigs.js); this component handles load / draft / submit.
export default function SubmissionForm({ config }) {
  const { id } = useParams()
  const navigate = useNavigate()

  const [values, setValues] = useState(() => initialValues(config))
  const [status, setStatus] = useState('draft')
  const [rowId, setRowId] = useState(id ?? null)
  const [loading, setLoading] = useState(Boolean(id))
  const [notFound, setNotFound] = useState(false)
  const [saving, setSaving] = useState(false)
  const [notice, setNotice] = useState(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [clearOpen, setClearOpen] = useState(false)
  // Submit-time validation error, shown as a centered modal so the SME sees it
  // immediately (rather than an inline banner scrolled off the top of the page).
  const [submitError, setSubmitError] = useState(null)
  // Per-section read-only "Example" popup: { title, sections } or null.
  const [exampleSlice, setExampleSlice] = useState(null)

  // Open the worked-example popup for one section. `key` is 'question' or a
  // rubric section title ('Components' / 'Themes' / 'Details'); `title` is the
  // popup heading. No-op if the form has no example content for that section.
  function openExample(key, title) {
    const sections = getExampleSlice(config.slug, key)
    if (sections.length > 0) setExampleSlice({ title, sections })
  }

  const locked = status === 'submitted'

  // Local (browser) draft cache so a page refresh / accidental close doesn't
  // wipe unsaved typing. It is separate from the store itself (lib/demoStore.js):
  // it holds edits nobody has saved yet. Keyed per form + row; `new` for an
  // unsaved form. `hydrated` gates writes so we never overwrite the cache with
  // the initial blank defaults before we've had a chance to restore from it.
  const draftKey = `rubric-studio:draft:${config.table}:${id ?? 'new'}`
  const [hydrated, setHydrated] = useState(false)

  // The id this instance put in the URL itself, by saving a new draft. See the
  // load effect below.
  const justSavedId = useRef(null)

  // What a blank form of this type looks like, ignoring the per-row keys (which
  // are freshly minted every time and never equal). The cache effect compares
  // against it so an empty form is never written out as if it were unsaved work.
  const blankSnapshot = useMemo(() => compareKey(config, initialValues(config)), [config])

  // The same comparison for what the store already holds for this entry. A form
  // that matches it has no unsaved edits, so it has nothing to cache. Without
  // this, merely opening a saved draft wrote a full copy of it into the cache,
  // and so did the first save of a new one, which left the cache holding saved
  // work rather than the unsaved edits it is for.
  const savedSnapshot = useRef(null)

  // Ids for the card headings that name the controls under them. Section
  // titles can hold spaces, and aria-labelledby reads a space as the start of
  // a second id, so they are joined with hyphens.
  const uid = useId()
  const headingId = (name) => `${uid}-${name.replace(/\s+/g, '-')}`

  // Names of every column this form writes, plus which are required to submit.
  const requiredNames = useMemo(
    () => [
      ...METADATA_FIELDS.filter((f) => f.required).map((f) => f.name),
      'question',
      ...config.fields.filter((f) => f.required).map((f) => f.name),
    ],
    [config],
  )

  // Load the existing entry when editing. Either way, unsaved edits cached in
  // the browser take priority, so a refresh restores exactly what was typed.
  useEffect(() => {
    // Saving a new draft replaces the URL with the row's id, which lands right
    // back here. The values in hand are already exactly what was just written,
    // so re-fetching them would only blank the form into a spinner for a frame
    // and throw away the visitor's scroll position and focus.
    if (id && id === justSavedId.current) return

    let active = true
    setHydrated(false)
    if (id) {
      setLoading(true)
      getRow(config.table, id).then((data) => {
        if (!active) return
        if (!data) {
          setNotFound(true)
        } else {
          const base = rowToValues(config, data)
          savedSnapshot.current = compareKey(config, base)
          // A submitted entry is locked and view-only — never restore a cache
          // over it. For drafts, layer any cached edits on top of the saved row.
          // The merge goes back through rowToValues so a cached list gets the
          // same shape checks and row keys as a stored one.
          const cached = data.status === 'submitted' ? null : readDraftCache(draftKey)
          setValues(cached ? rowToValues(config, { ...data, ...cached }) : base)
          setStatus(data.status)
          setRowId(data.id)
        }
        setLoading(false)
        setHydrated(true)
      })
    } else {
      const cached = readDraftCache(draftKey)
      if (cached) setValues((v) => rowToValues(config, { ...v, ...cached }))
      setHydrated(true)
    }
    return () => {
      active = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, config.table])

  // Persist every change to the browser cache (skip while still hydrating and
  // once the entry is locked/submitted).
  useEffect(() => {
    if (!hydrated || locked) return
    try {
      // A blank form is not unsaved work, so it clears the cache instead of
      // filling it. Otherwise "Clear all" on a saved draft wrote an empty cache
      // that got layered back over the stored row on the next visit, and the
      // draft the visitor had saved looked like it had been thrown away. A form
      // that matches what is saved is not unsaved work either.
      const snapshot = compareKey(config, values)
      if (snapshot === blankSnapshot || snapshot === savedSnapshot.current) {
        localStorage.removeItem(draftKey)
      } else {
        localStorage.setItem(draftKey, JSON.stringify(values))
      }
    } catch {
      // Storage unavailable (private mode / quota) — degrade silently.
    }
  }, [values, hydrated, locked, draftKey, config, blankSnapshot])

  // The save result appears below the buttons, which on a long form can be the
  // last thing on the page and just past the bottom of the screen. Bring it
  // into view, moving only as far as it takes.
  const noticeRef = useRef(null)
  useEffect(() => {
    if (notice) noticeRef.current?.scrollIntoView({ block: 'nearest' })
  }, [notice])

  // Let a "Draft saved." confirmation clear itself; an error stays until the
  // next save attempt replaces it.
  useEffect(() => {
    if (notice?.type !== 'success') return
    const timer = setTimeout(() => setNotice(null), 5000)
    return () => clearTimeout(timer)
  }, [notice])

  function setValue(name, value) {
    setValues((v) => ({ ...v, [name]: value }))
  }

  function buildPayload(nextStatus) {
    return { ...sanitizeValues(config, values), status: nextStatus }
  }

  async function persist(nextStatus) {
    setSaving(true)
    setNotice(null)
    const payload = buildPayload(nextStatus)
    try {
      if (rowId) {
        // The row can change under an open form: another tab can delete it,
        // submit it, or reset the demo. Writing blindly reported "Draft saved."
        // for a row that no longer existed (and then dropped the cache holding
        // the only copy of the typing), and a Save draft here could turn an
        // entry submitted elsewhere back into an editable draft.
        const current = await getRow(config.table, rowId)
        if (!current) {
          return {
            error: new Error(
              'This draft is no longer saved in this browser. It was deleted, or the demo was reset, in another tab.',
            ),
          }
        }
        if (current.status === 'submitted') {
          return {
            error: new Error('This entry was submitted in another tab, so it can no longer be changed.'),
          }
        }
        await updateRow(config.table, rowId, payload)
        return { id: rowId }
      }
      const row = await insertRow(config.table, payload)
      return { id: row.id }
    } catch (err) {
      return { error: err }
    } finally {
      setSaving(false)
    }
  }

  async function handleSaveDraft() {
    const result = await persist('draft')
    if (result.error) {
      setNotice({ type: 'error', text: result.error.message })
      return
    }
    // Saved to the store — the unsaved-edits cache is now redundant, so drop it.
    savedSnapshot.current = compareKey(config, values)
    clearDraftCache(draftKey)
    setNotice({ type: 'success', text: 'Draft saved.' })
    // Reflect the saved id in the URL so further saves update the same row.
    if (!rowId) {
      setRowId(result.id)
      // Tell the load effect this id is already in hand, so the URL change does
      // not bounce the form through a reload.
      justSavedId.current = result.id
      navigate(`/form/${config.slug}/${result.id}`, { replace: true })
    }
  }

  // Empty the form. This is a form reset, not a delete: an entry already saved
  // to the store is left exactly as it is until the visitor saves again.
  function handleClearAll() {
    setValues(initialValues(config))
    setNotice(null)
    setClearOpen(false)
  }

  // A required field is "filled" depending on its type:
  //   * tagged-list with a requiredTag → needs ≥1 row with text AND that tag
  //   * tagged-list without requiredTag → needs ≥1 row with text
  //   * everything else (metadata, question, textareas) → non-empty string
  function isFilled(name) {
    const field = config.fields.find((f) => f.name === name)
    const value = values[name]
    if (field?.type === 'tagged-list') {
      const rows = Array.isArray(value) ? value : []
      return rows.some(
        (r) =>
          String(r?.text ?? '').trim() &&
          (!field.requiredTag || r?.tag === field.requiredTag),
      )
    }
    return Boolean(String(value ?? '').trim())
  }

  function missingFields() {
    return requiredNames.filter((name) => !isFilled(name))
  }

  // Human label for a required field name, used in the concise submit-error list.
  // The required components list has no visible label and its must-have rule
  // isn't shown inline, so it gets an explicit name here.
  function requiredLabel(name) {
    const meta = METADATA_FIELDS.find((f) => f.name === name)
    if (meta) return meta.label
    if (name === 'question') return config.questionLabel
    const field = config.fields.find((f) => f.name === name)
    if (field?.type === 'tagged-list' && field.requiredTag) return 'Components (needs a “must-have”)'
    return field?.label ?? name
  }

  function handleSubmitClick() {
    const missing = missingFields()
    if (missing.length > 0) {
      setSubmitError(missing.map(requiredLabel))
      return
    }
    setNotice(null)
    setConfirmOpen(true)
  }

  // The dialog stays up while the write is in flight, so its "Submitting…"
  // busy label is actually reachable (closing first made it dead code).
  async function handleConfirmSubmit() {
    const result = await persist('submitted')
    setConfirmOpen(false)
    if (result.error) {
      setNotice({ type: 'error', text: result.error.message })
      return
    }
    clearDraftCache(draftKey)
    navigate('/dashboard')
  }

  if (loading) return <Spinner label="Loading submission…" />

  if (notFound) {
    return (
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
          Submission Not Found
        </h1>
        <p className="mt-1 text-base text-slate-500">
          It may have been deleted, or the demo may have been reset.
        </p>
        <Link to="/dashboard" className={`${btn()} mt-6`}>
          Go to submissions
        </Link>
      </div>
    )
  }

  // `labelledBy` is the id of the card heading that names the field, for the
  // cards that head themselves and so hand the field label={null}.
  const renderField = (f, labelledBy) => {
    let el
    if (f.type === 'tagged-list') {
      el = (
        <TaggedListField
          label={f.label}
          labelledBy={labelledBy}
          helper={f.helper}
          tags={f.tags}
          placeholder={f.placeholder}
          addLabel={f.addLabel}
          value={values[f.name]}
          onChange={(v) => setValue(f.name, v)}
          disabled={locked}
        />
      )
    } else if (f.type === 'citations') {
      el = (
        <CitationsField
          label={f.label}
          labelledBy={labelledBy}
          helper={f.helper}
          value={values[f.name]}
          onChange={(v) => setValue(f.name, v)}
          disabled={locked}
        />
      )
    } else {
      el = (
        <Field
          label={f.label}
          labelledBy={labelledBy}
          helper={f.helper}
          required={f.required}
          rows={4}
          value={values[f.name]}
          onChange={(v) => setValue(f.name, v)}
          disabled={locked}
        />
      )
    }
    return <div key={f.name}>{el}</div>
  }

  return (
    // No top padding of its own, like every other page, so the title sits at the
    // same height everywhere. The header's "Submissions" link stays selected on
    // every form and is the way back.
    <div className="mx-auto max-w-3xl">
      <div className="mb-6">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
            {formLabel(config)}
          </h1>
          {rowId && <StatusBadge status={status} />}
        </div>
        <p className="mt-1 text-base text-slate-500">{config.definition}</p>
      </div>

      {locked && (
        <div className="mb-6 rounded-lg border-2 border-emerald-600 bg-emerald-600 px-4 py-3 text-base font-bold text-white">
          This entry has been submitted and can no longer be edited.
        </div>
      )}

      <form onSubmit={(e) => e.preventDefault()} className="space-y-8">
        {/* Metadata */}
        <section className="rounded-xl border-2 border-cream-200 bg-white p-5 shadow-sm">
          {/* Three columns for three short fields. At two, Application Domain sat
              alone on a second row with an empty cell beside it. */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {METADATA_FIELDS.map((f) => (
              <Field
                key={f.name}
                label={f.label}
                required={f.required}
                multiline={false}
                placeholder={f.placeholder}
                options={f.options}
                value={values[f.name]}
                onChange={(v) => setValue(f.name, v)}
                disabled={locked}
              />
            ))}
          </div>
        </section>

        {/* Question / prompt */}
        <section className="relative rounded-xl border-2 border-cream-200 bg-white p-5 shadow-sm">
          {getExampleSlice(config.slug, 'question').length > 0 && (
            <ExampleButton
              className="absolute right-5 top-5"
              ariaLabel={`Example: ${config.questionLabel}`}
              onClick={() => openExample('question', `${config.questionLabel} — example`)}
            />
          )}
          <CardHeading id={headingId('question')} required>
            {config.questionLabel}
          </CardHeading>
          <div className="mt-1.5">
            <Field
              label={null}
              labelledBy={headingId('question')}
              helper={config.questionHelper}
              required
              rows={4}
              value={values.question}
              onChange={(v) => setValue('question', v)}
              disabled={locked}
            />
          </div>
        </section>

        {/* Rubric — each section is its own card so they read as distinct groups */}
        {config.rubricSections ? (
          <>
            {config.rubricSections.map((section) =>
              // `plain` sections (Important citations) render a heading and their
              // field, with no description, Tip badge, or Example button.
              section.plain ? (
                <section
                  key={section.title}
                  className="rounded-xl border-2 border-cream-200 bg-white p-5 shadow-sm"
                >
                  <CardHeading id={headingId(section.title)}>{section.title}</CardHeading>
                  {/* The field drops its own label: the card heading above is
                      the label now, and the field's helper reads as the section
                      description that the other cards carry. */}
                  <div className="mt-1.5">
                    {section.fields.map((f) =>
                      renderField({ ...f, label: null }, headingId(section.title)),
                    )}
                  </div>
                </section>
              ) : (
                <section
                  key={section.title}
                  className="space-y-4 rounded-xl border-2 border-cream-200 bg-white p-5 shadow-sm"
                >
                  {/* The description runs the full width of the card, under
                      the heading and its buttons. Beside the buttons it was
                      squeezed into a column a few words wide on a phone. */}
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <CardHeading
                        id={headingId(section.title)}
                        required={section.fields.some((f) => f.required)}
                      >
                        {section.title}
                      </CardHeading>
                      <div className="mr-[14px] flex shrink-0 items-start gap-2">
                        {/* "Example" shows this section's slice of the worked
                            example; Important Citations is a `plain` section and
                            never reaches this branch, so it never gets one. */}
                        {getExampleSlice(config.slug, section.title).length > 0 && (
                          <ExampleButton
                            ariaLabel={`Example: ${section.title}`}
                            onClick={() => openExample(section.title, `${section.title} — example`)}
                          />
                        )}
                        <InfoHint
                          placement="right"
                          label={`Tip: ${section.title}`}
                          text={listHint(section)}
                        />
                      </div>
                    </div>
                    <p className="mt-1 text-base text-slate-500">{section.description}</p>
                  </div>
                  {section.fields.map((f) => renderField(f, headingId(section.title)))}
                </section>
              ),
            )}
          </>
        ) : config.fieldsAsCards ? (
          // Simple forms that want each rubric field on its own card (Value
          // Retrieval), each with an optional format-only "Example" button.
          config.fields.map((f) => (
            <section
              key={f.name}
              className="relative rounded-xl border-2 border-cream-200 bg-white p-5 shadow-sm"
            >
              {f.exampleKey && getExampleSlice(config.slug, f.exampleKey).length > 0 && (
                <ExampleButton
                  className="absolute right-5 top-5"
                  ariaLabel={`Example: ${f.label}`}
                  onClick={() => openExample(f.exampleKey, `${f.label} — example`)}
                />
              )}
              <CardHeading id={headingId(f.name)} required={f.required}>
                {f.label}
              </CardHeading>
              <div className="mt-1.5">{renderField({ ...f, label: null }, headingId(f.name))}</div>
            </section>
          ))
        ) : (
          <section className="space-y-8 rounded-xl border-2 border-cream-200 bg-white p-5 shadow-sm">
            {config.fields.map((f) => renderField(f))}
          </section>
        )}

        {!locked && (
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setClearOpen(true)}
                disabled={saving}
                className={`${btn({ variant: 'dangerSoft' })} min-w-[8rem]`}
              >
                Clear all
              </button>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleSaveDraft}
                  disabled={saving}
                  className={`${btn({ variant: 'draft' })} min-w-[8rem]`}
                >
                  {saving ? 'Saving…' : 'Save draft'}
                </button>
                <button
                  type="button"
                  onClick={handleSubmitClick}
                  disabled={saving}
                  className={`${btn()} min-w-[8rem]`}
                >
                  Submit
                </button>
              </div>
            </div>
            {/* The result of Save draft belongs beside the button that caused
                it. It used to sit at the top of the page, several screens above
                the button on a full rubric, so saving looked like it did
                nothing at all.

                It sits below the buttons, not above them. Above, its arrival
                pushed the buttons down by its own height, so on a phone a
                second tap aimed at Save draft landed on Clear all. The live
                region itself is always mounted: one that is inserted together
                with its text is often not announced at all. */}
            <div role="status" aria-live="polite">
              {notice && (
                <div
                  ref={noticeRef}
                  className={`mt-3 rounded-lg border-2 px-4 py-3 text-base font-bold ${
                    notice.type === 'error'
                      ? 'border-rose-600 bg-rose-600 text-white'
                      : 'border-emerald-600 bg-emerald-600 text-white'
                  }`}
                >
                  {notice.text}
                </div>
              )}
            </div>
          </div>
        )}
      </form>

      {exampleSlice && (
        <ExampleModal
          title={exampleSlice.title}
          sections={exampleSlice.sections}
          onClose={() => setExampleSlice(null)}
        />
      )}

      {submitError && (
        <Modal
          onClose={() => setSubmitError(null)}
          label="Still Missing"
          showClose
          className="max-w-md rounded-xl border-2 border-amber-400 p-6 text-center shadow-xl"
        >
          <h3 className="text-2xl font-bold tracking-tight text-amber-600">Still Missing</h3>
          <ul className="mt-4 space-y-3 text-base text-slate-700">
            {submitError.map((label) => (
              <li key={label}>{label}</li>
            ))}
          </ul>
        </Modal>
      )}

      {confirmOpen && (
        <ConfirmDialog
          title="Submit this entry?"
          confirmLabel="Submit"
          busyLabel="Submitting…"
          busy={saving}
          variant="primary"
          onConfirm={handleConfirmSubmit}
          onCancel={() => setConfirmOpen(false)}
        >
          Submitting locks it from further edits.
        </ConfirmDialog>
      )}

      {clearOpen && (
        <ConfirmDialog
          title="Clear all fields?"
          confirmLabel="Clear all"
          onConfirm={handleClearAll}
          onCancel={() => setClearOpen(false)}
        >
          {rowId
            ? 'This empties every field on the form. The draft you have already saved is left as it is until you save again.'
            : 'This empties every field on the form. Nothing has been saved yet, so there is nothing to go back to.'}
        </ConfirmDialog>
      )}
    </div>
  )
}

// ---- helpers ---------------------------------------------------------------

// Browser-side draft cache (localStorage). Read/clear are guarded so a disabled
// or full store never throws. Anything but a plain object is treated as no
// cache, since it gets spread over the form's values.
function readDraftCache(key) {
  try {
    const raw = localStorage.getItem(key)
    const parsed = raw ? JSON.parse(raw) : null
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : null
  } catch {
    return null
  }
}

function clearDraftCache(key) {
  try {
    localStorage.removeItem(key)
  } catch {
    // ignore — nothing to clean up if storage is unavailable
  }
}

function fieldNames(config) {
  return [...METADATA_FIELDS.map((f) => f.name), 'question', ...config.fields.map((f) => f.name)]
}

// Empty value for a field: the list fields (tagged lists, citations) start
// with a single blank row to nudge SMEs — all optional-to-leave, so they can
// fill, delete, or leave it blank. Everything else starts as an empty string.
function emptyValue(config, name) {
  const field = config.fields.find((f) => f.name === name)
  if (field?.type === 'tagged-list') return [{ text: '', tag: '', _key: rowKey() }]
  if (field?.type === 'citations') return [{ doi: '', reason: '', _key: rowKey() }]
  return ''
}

// Coerce a stored value into the shape the form expects. The list fields
// must be arrays; a null/legacy value collapses to an empty list. Stored rows
// carry no `_key` (it is stripped on save), so they are given one here.
function coerceValue(config, name, raw) {
  const field = config.fields.find((f) => f.name === name)
  if (field?.type === 'tagged-list' || field?.type === 'citations') {
    return Array.isArray(raw) ? withRowKeys(raw) : []
  }
  return raw ?? ''
}

// Serialise the form for comparison only, with the per-row keys taken out —
// they are minted fresh on every call and would make two identical forms look
// different. Used to recognise a blank form (see the draft-cache effect).
function compareKey(config, values) {
  const listNames = new Set(
    config.fields.filter((f) => f.type === 'tagged-list' || f.type === 'citations').map((f) => f.name),
  )
  return JSON.stringify(
    Object.fromEntries(
      fieldNames(config).map((name) => [
        name,
        listNames.has(name) && Array.isArray(values[name])
          ? stripRowKeys(values[name])
          : values[name],
      ]),
    ),
  )
}

// Build the payload from the form state. Only the fields this config actually
// declares (fieldNames) are included, so stray keys left in a stale browser
// draft cache from before a section was removed never reach the store.
// Also drop placeholder rows so list fields never store empty entries:
// tagged-list rows with no text, citation rows with no DOI/reason.
function sanitizeValues(config, values) {
  const next = {}
  for (const name of fieldNames(config)) {
    next[name] = values[name]
  }
  for (const field of config.fields) {
    if (!Array.isArray(next[field.name])) continue
    // `_key` is the client-side row identity (lib/rowKey.js) and is never
    // stored, so it comes off here on the way to the store.
    if (field.type === 'tagged-list') {
      next[field.name] = stripRowKeys(
        next[field.name].filter((row) => String(row?.text ?? '').trim()),
      )
    } else if (field.type === 'citations') {
      next[field.name] = stripRowKeys(
        next[field.name].filter(
          (row) => String(row?.doi ?? '').trim() || String(row?.reason ?? '').trim(),
        ),
      )
    }
  }
  return next
}

function initialValues(config) {
  return Object.fromEntries(fieldNames(config).map((name) => [name, emptyValue(config, name)]))
}

function rowToValues(config, row) {
  return Object.fromEntries(
    fieldNames(config).map((name) => [name, coerceValue(config, name, row[name])]),
  )
}
