import SubmissionForm from './SubmissionForm'
import { FORM_CONFIGS } from '../lib/formConfigs'

export default function ExperimentalDesignForm() {
  return <SubmissionForm config={FORM_CONFIGS['experimental-design']} />
}
