import { nanoid } from '@/lib/utils'
import { Culture } from '@/components/culture'

export const runtime = 'edge'

export default function CulturePage() {
  const id = nanoid()

  return <Culture id={id} />
}
