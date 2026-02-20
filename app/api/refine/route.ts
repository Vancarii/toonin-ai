import {
  consumeStream,
  convertToModelMessages,
  streamText,
  UIMessage,
} from 'ai'
import { openai } from '@ai-sdk/openai'

export const maxDuration = 60

const SYSTEM_PROMPT = `You are Toonin, an expert AI prompt analyst and refiner. Your sole purpose is to help users craft better prompts for AI systems.

When the user gives you a prompt, you MUST respond using EXACTLY this format with these markdown headers:

## Interpretation
Explain how an AI would interpret this prompt. Be specific about what the AI would understand, what assumptions it would make, and what the likely output would look like. Be honest if the prompt is vague, ambiguous, or missing important details.

## Suggested Prompts
Provide exactly 3 improved versions of the user's prompt. Each should be a complete, ready-to-use prompt that improves on the original. Number them 1-3. Each suggestion should take a different approach to improving the prompt - one might add specificity, another might restructure it, another might add constraints or context. Write each one as a complete prompt the user could copy and paste directly into any AI.

1. [First improved prompt]
2. [Second improved prompt]  
3. [Third improved prompt]

## Questions
Ask 2-4 clarifying questions that would help you understand the user's intent better. These should be questions where the answers would significantly improve the prompt. Use bullet points with dashes.

- [Question 1]
- [Question 2]
- [Question 3]

IMPORTANT RULES:
- ALWAYS use the exact headers: ## Interpretation, ## Suggested Prompts, ## Questions
- Never skip any section
- Keep interpretation concise but insightful (2-4 sentences)
- Make suggested prompts substantially better than the original, not just minor edits
- Questions should target genuine ambiguities, not obvious things
- If the user answers questions or provides more context, incorporate that into your new analysis
- Focus on what the user MEANS, not just what they literally said
- Be direct and helpful, not patronizing`

export async function POST(req: Request) {
  const {
    messages,
    currentPrompt,
    isInitial,
  }: {
    messages: UIMessage[]
    currentPrompt?: string
    isInitial?: boolean
  } = await req.json()

  // Build the messages, injecting prompt context
  const modelMessages = await convertToModelMessages(messages)

  // If we have additional context about the current prompt state, add it
  if (currentPrompt && !isInitial) {
    // Prepend context about current prompt state to the system
    const contextNote = `\n\nThe user's current prompt (which they are refining) is: "${currentPrompt}"\nKeep this in mind when analyzing their messages and providing suggestions.`

    const result = streamText({
      model: openai('gpt-4o-mini'),
      system: SYSTEM_PROMPT + contextNote,
      messages: modelMessages,
      abortSignal: req.signal,
    })

    return result.toUIMessageStreamResponse({
      originalMessages: messages,
      consumeSseStream: consumeStream,
    })
  }

  const result = streamText({
    model: openai('gpt-4o-mini'),
    system: SYSTEM_PROMPT,
    messages: modelMessages,
    abortSignal: req.signal,
  })

  return result.toUIMessageStreamResponse({
    originalMessages: messages,
    consumeSseStream: consumeStream,
  })
}
