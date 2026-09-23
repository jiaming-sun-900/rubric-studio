// Central definition of the 7 benchmark question types.
//
// Each config drives:
//   * the route slug            (/form/<slug>)
//   * the table name it is stored under
//   * the question/prompt field (label + helper)
//   * the rubric fields rendered by the shared SubmissionForm

// The extended-rubric forms (Information Synthesis, Material Selection,
// Experimental Design, Failure Analysis) share a three-section rubric:
// Components, Themes, Details.
//
// Each section is a single repeatable *tagged list* (type: 'tagged-list'): every
// row is a { text, tag } object, stored as an array on the row. Rows can be
// added/removed freely; a new form seeds one blank row.
//   * Components → component_items, tags must-have / nice-to-have
//   * Themes     → theme_items,     tags ideal / tangential [/ unrelated]
//   * Details    → detail_items,    tags ideal / tangential [/ unrelated]
// At least one component tagged "must-have" is required to submit.
//
// All four offer "Unrelated" as a third tag on the Themes and Details dropdowns
// — the SME folds unrelated points into the same tagged list rather than a
// separate field.
//
// `withCitations` adds the repeatable Important-citations table (type:
// 'citations', rows of { doi, reason }) as its own card at the foot of the
// rubric. Offered by Information Synthesis, Material Selection,
// Experimental Design, and Failure Analysis.
//
// Scientific Procedure (see its config below) uses the same tagged Components
// list as the extended forms (rows are { text, tag }, must-have / nice-to-have,
// ≥1 must-have required). It differs only in scope: it has ONLY a Components
// section — no Themes, Details, or citations.
export const CITATION_REASONS = [
  'Definitive paper in research area',
  'Provides evidence of answer component(s)',
  'Includes specific data point(s)',
]

// Tag options for the tagged-list dropdowns. `value` is what is stored;
// `label` is what the SME sees. The explanations used to be relative clauses
// with nothing to hang from ("Ideal (which the answer should include)"), and
// the longest was cut off in the closed dropdown.
export const COMPONENT_TAGS = [
  { value: 'must-have', label: 'Must-have' },
  { value: 'nice-to-have', label: 'Nice-to-have' },
]
export const THEME_TAGS = [
  { value: 'ideal', label: 'Ideal (the answer should include it)' },
  { value: 'tangential', label: 'Tangential (the answer could benefit from it)' },
]
// Themes/Details dropdown for the forms that fold "Unrelated" points into the
// same tagged list: Information Synthesis, Material Selection, Experimental
// Design, and Failure Analysis (NOT Scientific Procedure).
export const THEME_TAGS_WITH_UNRELATED = [
  ...THEME_TAGS,
  { value: 'unrelated', label: 'Unrelated (an answer might include it by mistake)' },
]

// Options:
//   withCitations  — add the repeatable citations table as its own card at the
//                    foot of the rubric (Information Synthesis, Material Selection,
//                    Experimental Design, Failure Analysis).
//   withUnrelated  — offer "Unrelated" as a third tag on the Themes/Details
//                    dropdowns (see THEME_TAGS_WITH_UNRELATED). All four extended
//                    forms pass this.
function extendedSections({ withCitations = false, withUnrelated = false } = {}) {
  const themeTags = withUnrelated ? THEME_TAGS_WITH_UNRELATED : THEME_TAGS
  const componentFields = [
    {
      name: 'component_items',
      type: 'tagged-list',
      tags: COMPONENT_TAGS,
      addLabel: 'Component',
      // No visible helper: the must-have requirement is enforced at submit and
      // surfaced via the submit-time error message instead.
      required: true,
      requiredTag: 'must-have',
    },
  ]
  const themeFields = [
    {
      name: 'theme_items',
      type: 'tagged-list',
      tags: themeTags,
      addLabel: 'Theme',
    },
  ]
  const detailFields = [
    {
      name: 'detail_items',
      type: 'tagged-list',
      tags: themeTags,
      addLabel: 'Detail',
    },
  ]

  const sections = [
    {
      title: 'Components',
      description:
        'Claims/explanations that should be included in the answer, and their relative importance.',
      fields: componentFields,
    },
  ]
  sections.push(
    {
      title: 'Themes',
      description:
        'Discussion points that should guide the answer but weren’t part of the question.',
      fields: themeFields,
    },
    {
      title: 'Details',
      description:
        'Specific values that should be included in the answer, though the question did not ask for them.',
      fields: detailFields,
    },
  )
  if (withCitations) {
    // Important citations closes the rubric. It is a different kind of data
    // (supporting references, not answer claims) so it keeps its own card, but
    // it used to sit between Components and Themes, which split the three
    // tagged-list sections apart and put the references before the thing they
    // support. `plain: true` tells SubmissionForm to render just a heading and
    // the field, with no Tip badge or Example button (see the "never on
    // citations" rule).
    sections.push({
      title: 'Important Citations',
      plain: true,
      fields: [
        {
          name: 'important_citations',
          label: 'Important Citations',
          type: 'citations',
          helper: 'Add each supporting paper: its DOI and why it is included.',
        },
      ],
    })
  }
  return sections
}

// Pair a rubric-section layout with the flat `fields` list the save and
// validation layers read. Always build a section-based config through this:
// Scientific Procedure used to spell its one field out twice, once under
// `rubricSections` and once under `fields`, so editing either copy alone would
// have left the form rendering one shape and validating another.
function sectionsConfig(rubricSections) {
  return {
    rubricSections,
    fields: rubricSections.flatMap((s) => s.fields),
  }
}

// Returns the config slice shared by the extended-rubric forms.
function extendedConfig({ withCitations = false, withUnrelated = false } = {}) {
  return sectionsConfig(extendedSections({ withCitations, withUnrelated }))
}

export const FORM_CONFIGS = {
  'value-retrieval': {
    slug: 'value-retrieval',
    table: 'value_retrieval',
    number: 1,
    name: 'Value Retrieval',
    definition:
      'A request for a specific value that can be found in a single paper (not googleable).',
    questionLabel: 'Question',
    questionHelper: 'The specific value being requested.',
    // Each field renders in its own card with an "Example" button (exampleKey →
    // the matching heading in exampleData, which is the field's own label).
    fieldsAsCards: true,
    fields: [
      {
        name: 'literature_values',
        label: 'Literature Values',
        helper: 'The values found in papers, with their DOIs.',
        exampleKey: 'Literature Values',
        required: true,
      },
      {
        name: 'correct_answer',
        label: 'Correct Answer',
        helper: 'The final answer, stated concisely.',
        exampleKey: 'Correct Answer',
        required: true,
      },
    ],
  },

  'scientific-calculation': {
    slug: 'scientific-calculation',
    table: 'scientific_calculation',
    number: 2,
    name: 'Scientific Calculation',
    definition:
      'A problem whose answer requires scientific and/or mathematical reasoning through multiple steps.',
    questionLabel: 'Question',
    questionHelper: 'The problem statement the AI must solve.',
    // Like Value Retrieval: each field on its own card with an "Example" button.
    fieldsAsCards: true,
    fields: [
      {
        name: 'components',
        label: 'Components',
        helper: 'The reasoning checkpoints: the steps an AI must go through to arrive at the correct answer.',
        exampleKey: 'Components',
        required: true,
      },
      {
        name: 'correct_answer',
        label: 'Correct Answer',
        helper: 'The final answer, stated concisely.',
        exampleKey: 'Correct Answer',
        required: true,
      },
    ],
  },

  // Differs from the extended-rubric forms only by scope: it has a single
  // Components section and NO Themes, Details, or citations. That Components
  // section is the same tagged list as every other form (rows are { text, tag },
  // tagged must-have / nice-to-have; ≥1 must-have required to submit).
  'scientific-procedure': {
    slug: 'scientific-procedure',
    table: 'scientific_procedure',
    number: 3,
    name: 'Scientific Procedure',
    definition: 'A request for a step-by-step breakdown of how to carry out a scientific task.',
    questionLabel: 'Question',
    ...sectionsConfig([
      {
        title: 'Components',
        description: 'Step-by-step procedure broken into the simplest steps possible.',
        fields: [
          {
            name: 'component_items',
            type: 'tagged-list',
            tags: COMPONENT_TAGS,
            addLabel: 'Component',
            required: true,
            requiredTag: 'must-have',
          },
        ],
      },
    ]),
  },

  'information-synthesis': {
    slug: 'information-synthesis',
    table: 'information_synthesis',
    number: 4,
    name: 'Information Synthesis',
    definition: 'A question that requires surveying multiple papers to produce a summary.',
    questionLabel: 'Question',
    ...extendedConfig({ withCitations: true, withUnrelated: true }),
  },

  'material-selection': {
    slug: 'material-selection',
    table: 'material_selection',
    number: 5,
    name: 'Material Selection',
    definition: 'What material(s) could be used in a specific application.',
    questionLabel: 'Question',
    ...extendedConfig({ withCitations: true, withUnrelated: true }),
  },

  'experimental-design': {
    slug: 'experimental-design',
    table: 'experimental_design',
    number: 6,
    name: 'Experimental Design',
    definition:
      'How a scientific goal (synthesis, characterization, or optimization) could be reached.',
    questionLabel: 'Question',
    ...extendedConfig({ withCitations: true, withUnrelated: true }),
  },

  'failure-analysis': {
    slug: 'failure-analysis',
    table: 'failure_analysis',
    number: 7,
    name: 'Failure Analysis',
    definition:
      'Why something isn’t working, either system troubleshooting or a failure mechanism.',
    questionLabel: 'Question',
    ...extendedConfig({ withCitations: true, withUnrelated: true }),
  },
}

// Ordered list (1 → 7) for the type selector and reviewer filters.
export const FORM_LIST = Object.values(FORM_CONFIGS).sort((a, b) => a.number - b.number)

// Look up a config by route slug.
export function getConfigBySlug(slug) {
  return FORM_CONFIGS[slug] ?? null
}

// Look up a config by table name (used when merging rows from every type).
export function getConfigByTable(table) {
  return FORM_LIST.find((c) => c.table === table) ?? null
}

// Canonical display label for a form: its number then name, e.g. "3. Scientific
// Procedure". Use this everywhere a form is named (form header, dashboard/admin
// tables, filters) so the number is always reinforced. Accepts a config or null.
export function formLabel(config) {
  return config ? `${config.number}. ${config.name}` : ''
}
