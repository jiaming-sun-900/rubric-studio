import { Navigate, Outlet } from 'react-router-dom'
import { useDemo } from '../demo/DemoProvider'

// The reviewer pages are reachable only while the header switch is set to
// Reviewer. It is purely a view switch, since there is nothing to protect in a
// store that already belongs to the visitor.
export default function RequireAdmin() {
  const { isAdmin } = useDemo()
  if (!isAdmin) return <Navigate to="/dashboard" replace />
  return <Outlet />
}
