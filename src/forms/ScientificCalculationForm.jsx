import SubmissionForm from './SubmissionForm'
import { FORM_CONFIGS } from '../lib/formConfigs'

export default function ScientificCalculationForm() {
  return <SubmissionForm config={FORM_CONFIGS['scientific-calculation']} />
}
