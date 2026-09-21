import { streamText, convertToModelMessages } from 'ai'
import { openai } from '@ai-sdk/openai'

export async function POST(req: Request) {
  const json = await req.json()
  const { messages, techStack, profile } = json

  const modelMessages = await convertToModelMessages(messages)

  const result = streamText({
    model: openai('gpt-4'),
    system: `You are a senior resume writer. Analyse this old work experience and re-write new high-ATS score work experience. keep resume format simple and straight forward. If appropriate, you can return some or all of your response as Markdown.
Job title is <${profile ?? "Fullstack developer"}>.
Technical stack of job is <${techStack ?? "React.js and Node.js"}>`,
    messages: modelMessages,
    temperature: 0.7
  })

  return result.toUIMessageStreamResponse()
}
