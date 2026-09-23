import SubmissionForm from './SubmissionForm'
import { FORM_CONFIGS } from '../lib/formConfigs'

export default function InformationSynthesisForm() {
  return <SubmissionForm config={FORM_CONFIGS['information-synthesis']} />
}
