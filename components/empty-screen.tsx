import { Button } from '@/components/ui/button'
import { IconArrowRight } from '@/components/ui/icons'
const exampleMessages = [
  {
    heading: 'Phone Screening',
    message: `I am having phone screening with recruiter. give me clear and short answer for all questions. Firt of all give me potensional questions and answers.`
  },  
]

export function EmptyScreen({ setInput }: { setInput: (value: string) => void }) {
  return (
    <div className="mx-auto flex min-h-[58vh] max-w-3xl items-center justify-center px-4 py-16">
      <div className="w-full text-center">
        <div className="mx-auto mb-6 flex size-12 items-center justify-center rounded-full bg-foreground text-background shadow-sm">
          <span className="text-xl font-semibold">i</span>
        </div>
        <h1 className="mb-3 text-2xl font-semibold tracking-tight md:text-3xl">
          How can I help you prepare?
        </h1>
        <p className="mx-auto max-w-md text-sm leading-6 text-muted-foreground">
          Practice interview questions, refine your answers, and build confidence with your personal interview coach.
        </p>
        <div className="mx-auto mt-8 grid max-w-xl gap-3 text-left sm:grid-cols-3">
          {exampleMessages.map((message, index) => (
            <Button
              key={index}
              variant="outline"
              className="h-auto min-h-20 justify-start rounded-2xl p-4 text-left text-sm font-medium shadow-sm"
              onClick={() => setInput(message.message)}
            >
              <IconArrowRight className="mr-2 text-muted-foreground" />
              {message.heading}
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}
