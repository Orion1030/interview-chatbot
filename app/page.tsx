import { nanoid } from '@/lib/utils'
import { Chat } from '@/components/chat'

export default async function IndexPage() {
  const id = nanoid()

  return (
    <div className="space-y-6">
      <Chat id={id} />
    </div>
  )
}
