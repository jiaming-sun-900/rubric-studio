import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate, useNavigationType } from 'react-router-dom'
import { useDemo } from '../demo/DemoProvider'
import { resetDemoData, storageWorks } from '../lib/demoStore'
import { btn } from '../lib/buttonStyles'
import BrandMark from './BrandMark'
import ConfirmDialog from './ConfirmDialog'
import IntroLetter from './IntroLetter'
import RoleSwitch from './RoleSwitch'

// The intro letter shows itself once per visitor. Dismissing it is remembered,
// and "About this demo" in the banner opens it again.
const INTRO_KEY = 'rubric-studio:intro-seen'

// The page a path belongs to: its first two segments. A form keeps its page
// when saving a new draft swaps the row's id onto the end of its URL.
function pageOf(pathname) {
  return pathname.split('/').slice(0, 3).join('/')
}

export default function Layout() {
  const { isAdmin, setIsAdmin } = useDemo()
  const navigate = useNavigate()
  const navigationType = useNavigationType()
  const { pathname } = useLocation()
  const [resetOpen, setResetOpen] = useState(false)
  const [introOpen, setIntroOpen] = useState(() => {
    try {
      return localStorage.getItem(INTRO_KEY) !== 'yes'
    } catch {
      return true
    }
  })

  // The tab title is the page's own h1, so a tab, a bookmark and the history
  // list each say where they lead instead of all reading "Rubric Studio". It is
  // read off the page rather than kept in a table here, which would fall out of
  // step the first time a heading was renamed. Some headings only settle after
  // a load (a saved entry that turns out not to exist says so in its h1), so the
  // title follows the page as it changes, not just when the route does.
  const main = useRef(null)
  useEffect(() => {
    function syncTitle() {
      const heading = main.current?.querySelector('h1')?.textContent.trim()
      const title = heading ? `${heading} · Rubric Studio` : 'Rubric Studio'
      if (document.title !== title) document.title = title
    }
    syncTitle()
    const observer = new MutationObserver(syncTitle)
    observer.observe(main.current, { childList: true, subtree: true, characterData: true })
    return () => observer.disconnect()
  }, [])

  // A new page opens at its top. The router leaves the window wherever it was,
  // so on a phone, picking the last question type opened its form a screen and
  // a half down, past its own title. Back and Forward are left to the browser,
  // and so is a URL change that stays on the same page (see pageOf).
  const shownPage = useRef(pageOf(pathname))
  useLayoutEffect(() => {
    const page = pageOf(pathname)
    if (navigationType !== 'POP' && page !== shownPage.current) window.scrollTo(0, 0)
    shownPage.current = page
  }, [pathname, navigationType])

  function closeIntro() {
    setIntroOpen(false)
    try {
      localStorage.setItem(INTRO_KEY, 'yes')
    } catch {
      // Storage unavailable — the letter will simply greet them again.
    }
  }

  // The switch takes the visitor to the half they picked. Flipping it to
  // Reviewer used to leave them on the same dashboard with one more tab in the
  // nav, which read as the switch doing nothing. Flipping back needs no move of
  // its own: on a reviewer page RequireAdmin sends them to the dashboard, and
  // anywhere else, halfway through a form say, they stay where they are. That
  // is also why pressing the side that is already on does nothing. It used to
  // navigate to the dashboard regardless.
  function switchRole(nextIsAdmin) {
    if (nextIsAdmin === isAdmin) return
    setIsAdmin(nextIsAdmin)
    if (nextIsAdmin) navigate('/admin')
  }

  async function handleReset() {
    await resetDemoData()
    setResetOpen(false)
    // A full reload is the simplest way to get every page's state back in step
    // with a store that was just replaced underneath it. This leaves the router,
    // so it needs the deploy base spelled out: hardcoding '/dashboard' walked
    // straight out of the app anywhere it is not served from a domain root.
    window.location.assign(`${import.meta.env.BASE_URL}dashboard`)
  }

  const linkClass = ({ isActive }) =>
    `rounded-md px-3 py-1.5 text-base font-medium transition ${
      isActive ? 'bg-clay-50 text-clay-700' : 'text-slate-600 hover:bg-cream-200 hover:text-slate-900'
    }`

  // "Submissions" covers the whole contributor area, not just /dashboard. A
  // plain NavLink to /dashboard left the nav with nothing selected while the
  // visitor was picking a question type or filling a form, which reads as being
  // outside the app rather than inside one of its sections.
  const inContributorArea = ['dashboard', 'new', 'form'].includes(pathname.split('/')[1])

  return (
    <div className="min-h-screen bg-cream text-slate-900">
      <header className="border-b-2 border-cream-200 bg-cream">
        {/* From `sm` up this is two groups, brand and nav on the left and the
            switch and Reset on the right, which wrap as a pair onto a second
            row when the window is too narrow for one. A phone cannot fit either
            pair: the brand with both nav tabs, or the switch beside Reset, is
            wider than a 375px screen, and the brand used to break onto two
            lines with its mark squashed while "Reset demo" did the same. So
            below `sm` the groups dissolve (`contents`) and their four pieces
            are ordered into three rows: brand and Reset, the nav, the switch.
            The nav keeps a row to itself in both views, so the switch does not
            move under the visitor's finger when Review appears. */}
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-3 gap-y-2 px-4 py-3">
          <div className="contents sm:flex sm:items-center sm:gap-6">
            <Link
              to="/dashboard"
              className="order-1 mr-auto flex shrink-0 items-center gap-2.5 sm:order-none sm:mr-0"
              aria-label="Rubric Studio home"
            >
              <BrandMark className="h-11 w-11 shrink-0" />
              <span className="whitespace-nowrap text-2xl font-semibold tracking-tight text-ink">
                Rubric Studio
              </span>
            </Link>
            <nav className="order-3 flex basis-full items-center gap-1 sm:order-none sm:basis-auto">
              <Link
                to="/dashboard"
                aria-current={inContributorArea ? 'page' : undefined}
                className={linkClass({ isActive: inContributorArea })}
              >
                Submissions
              </Link>
              {isAdmin && (
                <NavLink to="/admin" className={linkClass}>
                  Review
                </NavLink>
              )}
            </nav>
          </div>
          <div className="contents sm:ml-auto sm:flex sm:items-center sm:gap-3">
            <div className="order-4 sm:order-none">
              <RoleSwitch isAdmin={isAdmin} onChange={switchRole} />
            </div>
            <button
              type="button"
              onClick={() => setResetOpen(true)}
              className={`order-2 shrink-0 whitespace-nowrap sm:order-none ${btn({ variant: 'neutral', size: 'sm' })}`}
            >
              Reset demo
            </button>
          </div>
        </div>
      </header>

      <div className="border-b-2 border-cream-200 bg-clay-50">
        <p className="mx-auto max-w-6xl px-4 py-2 text-base text-clay-700">
          {storageWorks
            ? 'Demo. Everything you enter is saved in this browser only: no account, no server, nothing leaves your machine.'
            : 'Demo. This browser is not letting the page save anything, so what you enter lasts only until you reload. Nothing leaves your machine.'}{' '}
          <button
            type="button"
            onClick={() => setIntroOpen(true)}
            className="font-semibold underline underline-offset-2 transition hover:text-clay-600"
          >
            About this demo
          </button>
        </p>
      </div>

      <main ref={main} className="mx-auto max-w-6xl px-4 py-8">
        <Outlet />
      </main>

      {introOpen && <IntroLetter onClose={closeIntro} />}

      {resetOpen && (
        <ConfirmDialog
          title="Reset the demo?"
          confirmLabel="Reset"
          onConfirm={handleReset}
          onCancel={() => setResetOpen(false)}
        >
          This deletes everything you have entered in this browser.
        </ConfirmDialog>
      )}
    </div>
  )
}
