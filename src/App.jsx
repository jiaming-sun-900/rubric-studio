import { Navigate, Route, Routes, useParams } from 'react-router-dom'
import Layout from './components/Layout'
import RequireAdmin from './components/RequireAdmin'
import Dashboard from './pages/Dashboard'
import NewSubmission from './pages/NewSubmission'
import AdminPage from './pages/AdminPage'
import ValueRetrievalForm from './forms/ValueRetrievalForm'
import ScientificCalculationForm from './forms/ScientificCalculationForm'
import ScientificProcedureForm from './forms/ScientificProcedureForm'
import InformationSynthesisForm from './forms/InformationSynthesisForm'
import MaterialSelectionForm from './forms/MaterialSelectionForm'
import ExperimentalDesignForm from './forms/ExperimentalDesignForm'
import FailureAnalysisForm from './forms/FailureAnalysisForm'

// Maps the :type route param to the matching form component.
const FORM_COMPONENTS = {
  'value-retrieval': ValueRetrievalForm,
  'scientific-calculation': ScientificCalculationForm,
  'scientific-procedure': ScientificProcedureForm,
  'information-synthesis': InformationSynthesisForm,
  'material-selection': MaterialSelectionForm,
  'experimental-design': ExperimentalDesignForm,
  'failure-analysis': FailureAnalysisForm,
}

function FormPage() {
  const { type } = useParams()
  const Form = FORM_COMPONENTS[type]
  if (!Form) return <Navigate to="/new" replace />
  return <Form />
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/new" element={<NewSubmission />} />
        <Route path="/form/:type" element={<FormPage />} />
        <Route path="/form/:type/:id" element={<FormPage />} />

        <Route element={<RequireAdmin />}>
          <Route path="/admin" element={<AdminPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
