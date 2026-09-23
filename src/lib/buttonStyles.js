// Shared button styling so every action button across the app looks and behaves
// the same: consistent size + shape, and clear hover feedback (the button lifts
// slightly, its shadow grows, and the background darkens). Works for both
// <button> and react-router <Link> elements — just spread it into className.
//
//   btn()                          → primary (indigo), medium
//   btn({ variant: 'secondary' })  → outlined (Save draft, Cancel, Sign out)
//   btn({ variant: 'success' })    → green (Export CSV)
//   btn({ variant: 'danger' })     → red (destructive confirm)
//   btn({ size: 'sm' })            → compact (header / dense areas)

const base =
  'inline-flex items-center justify-center rounded-lg font-semibold shadow-sm transition duration-150 ease-out hover:-translate-y-0.5 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-sm'

const sizes = {
  md: 'px-6 py-3 text-base',
  sm: 'px-3 py-1.5 text-base',
}

const variants = {
  primary: 'bg-clay-600 text-white hover:bg-clay-700',
  secondary: 'border-2 border-cream-300 bg-white text-slate-700 hover:bg-cream',
  // Soft neutral fill: reads as a real button on the light header without
  // competing with the solid-indigo primary or the indigo nav highlights.
  // Hover hints at ending the session with a subtle rose tint.
  neutral: 'border-2 border-cream-300 bg-white text-slate-600 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-400',
  // Yellow, matching the "Draft" status badge — used for Save draft. Base is the
  // original amber-400; hover is a midpoint toward amber-500 so it darkens gently
  // instead of jumping to the full (too-dark) amber-500.
  draft: 'bg-amber-400 text-amber-950 hover:bg-[#f8b117]',
  success: 'bg-emerald-600 text-white hover:bg-emerald-700',
  danger: 'bg-rose-600 text-white hover:bg-rose-700',
  // Rose outline (not solid) — a softer destructive action like "Clear all"
  // that shouldn't shout as loud as the solid-red confirm button.
  dangerSoft: 'border-2 border-rose-300 bg-white text-rose-600 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-400',
}

export function btn({ variant = 'primary', size = 'md' } = {}) {
  return `${base} ${sizes[size]} ${variants[variant]}`
}

// Small buttons used inside repeatable list fields (TaggedListField,
// CitationsField). Both were louder than the job:
//   * Add    → a solid clay-600 fill, identical to the page's one real Submit.
//     The comment here always said "light indigo tint fill + indigo text"; the
//     code had drifted off it. Now there is exactly one solid indigo button per
//     page, and it is Submit.
//   * Remove → a solid red fill, which made "delete one row of a list" the most
//     saturated thing on the form. It is now the same quiet icon button as the
//     row delete in the submissions table, so one affordance means one thing.
export const listAddBtn =
  'rounded-lg border-2 border-clay-100 bg-clay-50 px-3 py-1.5 text-base font-semibold text-clay-700 transition duration-150 ease-out hover:-translate-y-0.5 hover:border-clay-200 hover:bg-clay-100 hover:shadow-sm'
export const listRemoveBtn =
  'shrink-0 rounded-md p-2 text-rose-600 transition hover:bg-rose-50'
