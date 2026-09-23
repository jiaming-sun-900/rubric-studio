# Rubric Studio

A web app where domain experts author benchmark data points: a question, and the
rubric a grader (human or model) uses to score an answer to it. Seven question
types, each with its own rubric shape, all rendered by one config-driven form
engine.

Built as an internship project at Mimir, summer 2026.

**[Open the demo](https://jiaming-sun-900.github.io/rubric-studio/).** No account, nothing to install.

## What it does

- **Seven question types.** Value Retrieval, Scientific Calculation, Scientific
  Procedure, Information Synthesis, Material Selection, Experimental Design,
  Failure Analysis. Each declares its own rubric fields in
  [`src/lib/formConfigs.js`](src/lib/formConfigs.js); one component
  ([`SubmissionForm`](src/forms/SubmissionForm.jsx)) renders all seven.
- **Rubrics, not free text.** Answer components are tagged must-have or
  nice-to-have; themes and details are tagged ideal, tangential, or unrelated;
  supporting papers go in a repeatable DOI table. A submission cannot be
  submitted without at least one must-have component.
- **Worked examples in place.** The question and the rubric sections carry
  Example buttons, each showing its own slice of a fully worked example for that
  question type.
- **Draft recovery.** Unsaved typing is cached as you go, so a refresh or a
  closed tab does not lose the form.
- **Submit locks the entry.** Drafts are editable and deletable; submitted
  entries are read-only.
- **Reviewer view.** Every submission across contributors, filterable by type and
  status, with a read-only detail view and a CSV export of the submitted entries,
  one row per entry and one column per rubric field.

## What is in this repository

The app and its empty forms. The one piece of content is a worked example per
question type, written for this demo from published sources. There is no
benchmark or contributor data in it, and no accounts or server: every submission
lives in the visitor's own `localStorage`, and a Contributor / Reviewer switch in
the header lets one visitor see both halves. It starts empty, and Reset demo
empties it again.

## Stack

React 19, Vite 8, Tailwind CSS 3, React Router 7. No backend, no build-time secrets.

## Run it

Needs Node 20.19+ or 22.12+, the versions Vite 8 supports.

```bash
npm install
npm run dev
```

## Deploy it

Every push to `main` publishes the demo to GitHub Pages through
[`.github/workflows/deploy.yml`](.github/workflows/deploy.yml).

Elsewhere, `npm run build` writes a static site to `dist/` that any static
host can serve. Two settings matter. The host has to answer unknown paths with
`index.html`, or opening a link such as `/dashboard` directly is a 404. And if
the site is served from a sub-path rather than a domain root, build with
`BASE_PATH` set to that path, e.g. `BASE_PATH=/demo/ npm run build`.
