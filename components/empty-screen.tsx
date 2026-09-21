import { Button } from '@/components/ui/button'
import { IconArrowRight } from '@/components/ui/icons'
import Link from 'next/link'

const exampleMessages = [
  {
    heading: 'Phone Screening',
    message: `I am having phone screening with recruiter. give me clear and short answer for all questions. Firt of all give me potensional questions and answers.`
  },  
]

export function EmptyScreen({ setInput }: { setInput: (value: string) => void }) {
  return (
    <div className="mx-auto max-w-2xl px-4">
      <div className="rounded-lg border bg-background p-8">
        <h1 className="mb-2 text-lg font-semibold">
          Welcome!
        </h1>
        <p className="leading-normal text-muted-foreground">
          You can start a conversation here or try the following examples:
        </p>
        <div className="mt-4 flex flex-col items-start space-y-2">
          {exampleMessages.map((message, index) => (
            <Button
              key={index}
              variant="link"
              className="h-auto p-0 text-base"
              onClick={() => setInput(message.message)}
            >
              <IconArrowRight className="mr-2 text-muted-foreground" />
              {message.heading}
            </Button>
          ))}
          <Link href="./resume" target="_blank" rel="nofollow" className='flex items-center'>           
            <IconArrowRight className="mr-2 text-muted-foreground" />
              Resume Builder
          </Link>

          <Link href="./culture" target="_blank" rel="nofollow" className='flex items-center'>           
            <IconArrowRight className="mr-2 text-muted-foreground" />
              Culture Interview
          </Link>
          
        </div>
      </div>
    </div>
  )
}
