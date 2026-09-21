import { nanoid } from '@/lib/utils'
import { Resume } from '@/components/resume'

export const runtime = 'edge'

export default function ResumePage() {
  const id = nanoid()

  return <Resume id={id} />
}
