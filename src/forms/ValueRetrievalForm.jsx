import SubmissionForm from './SubmissionForm'
import { FORM_CONFIGS } from '../lib/formConfigs'

export default function ValueRetrievalForm() {
  return <SubmissionForm config={FORM_CONFIGS['value-retrieval']} />
}
