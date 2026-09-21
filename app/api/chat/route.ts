import { streamText, convertToModelMessages } from 'ai'
import { openai } from '@ai-sdk/openai'

const MAX_CONTEXT_CHARACTERS = 12000

function limitConversation(messages: any[]) {
  const selected: any[] = []
  let characters = 0

  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const message = messages[index]
    const messageCharacters = JSON.stringify(message).length

    if (selected.length > 0 && characters + messageCharacters > MAX_CONTEXT_CHARACTERS) {
      break
    }

    selected.unshift(message)
    characters += messageCharacters
  }

  return selected
}

async function createChatResponse(modelName: string, payload: any, abortSignal?: AbortSignal) {
  const { messages, techStack, experience, focus } = payload

  if (!Array.isArray(messages) || messages.length === 0) {
    return new Response(JSON.stringify({ error: 'No chat messages were provided.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  const modelMessages = await convertToModelMessages(limitConversation(messages))

  const result = streamText({
    model: openai(modelName),
    abortSignal,
    maxRetries: 0,
    maxOutputTokens: 1200,
    system: `You are senior software engineer. You are having a technical interview with HR. Please get a point of question and give me the correct and optimized answer for these questions. If possible, include experience or solution. Tell like real person not AI naturally. Also You have to simplify all answers and have to tell the main point. Don't answer you don't have any experience with given question.
You must use verbal/spoken English not formal/written English at all! Also must use the simple statements not compound statements if it is possible! Try to choose easy-to-pronounce words.
Interview focuses on <${focus ?? 'Technical'}>.
You are very familiar with ${techStack ?? 'React.js, ASP.Net, Python'}.
Here is your some experience: ${experience ?? 'I have 10+ years experience with web development and have 5+ years experience with lead developer'}.`,
    messages: modelMessages,
    temperature: 0.7
  })

  return result.toUIMessageStreamResponse()
}

export async function POST(req: Request) {
  const apiKey = process.env.OPENAI_API_KEY

  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: 'OPENAI_API_KEY is not configured.' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }

  let payload: any

  try {
    payload = await req.json()
  } catch (error) {
    console.error('Failed to parse request body:', error)
    return new Response(
      JSON.stringify({ error: 'Invalid request body.' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    )
  }

  try {
    const configuredModel = process.env.OPENAI_MODEL || 'gpt-4.1'

    return await createChatResponse(configuredModel, payload, req.signal)
  } catch (error) {
    if (req.signal.aborted) {
      return new Response(null, { status: 499 })
    }

    console.error('Chat request failed for configured model:', error)
    return await createChatResponse('gpt-4o-mini', payload, req.signal)
  }
}
