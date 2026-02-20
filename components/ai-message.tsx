'use client'

import { Check, Lightbulb, MessageCircleQuestion, Brain } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ParsedResponse {
  interpretation: string
  suggestions: string[]
  questions: string[]
}

export function parseAIResponse(text: string): ParsedResponse {
  const result: ParsedResponse = {
    interpretation: '',
    suggestions: [],
    questions: [],
  }

  // Parse interpretation section
  const interpMatch = text.match(
    /## Interpretation\n([\s\S]*?)(?=\n## Suggested|$)/
  )
  if (interpMatch) {
    result.interpretation = interpMatch[1].trim()
  }

  // Parse suggestions section
  const sugMatch = text.match(
    /## Suggested Prompts\n([\s\S]*?)(?=\n## Questions|$)/
  )
  if (sugMatch) {
    const lines = sugMatch[1].trim().split('\n')
    for (const line of lines) {
      const cleaned = line.replace(/^\d+\.\s*/, '').trim()
      if (cleaned && !cleaned.startsWith('##')) {
        // Remove surrounding quotes if present
        const unquoted = cleaned.replace(/^["']|["']$/g, '')
        if (unquoted) result.suggestions.push(unquoted)
      }
    }
  }

  // Parse questions section
  const questMatch = text.match(/## Questions\n([\s\S]*)$/)
  if (questMatch) {
    const lines = questMatch[1].trim().split('\n')
    for (const line of lines) {
      const cleaned = line.replace(/^[-*]\s*/, '').trim()
      if (cleaned && !cleaned.startsWith('##')) {
        result.questions.push(cleaned)
      }
    }
  }

  return result
}

export function AIMessage({
  text,
  onSelectSuggestion,
  isStreaming,
}: {
  text: string
  onSelectSuggestion: (suggestion: string) => void
  isStreaming: boolean
}) {
  const parsed = parseAIResponse(text)
  const hasStructured =
    parsed.interpretation ||
    parsed.suggestions.length > 0 ||
    parsed.questions.length > 0

  if (!hasStructured) {
    // Fallback: show raw text while streaming or if parsing fails
    return (
      <div className="flex gap-3">
        <div className="flex-shrink-0">
          <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10">
            <Brain className="size-4 text-primary" />
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
            {text}
            {isStreaming && (
              <span className="ml-1 inline-block size-2 animate-pulse rounded-full bg-primary" />
            )}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex gap-3">
      <div className="flex-shrink-0">
        <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10">
          <Brain className="size-4 text-primary" />
        </div>
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-5">
        {/* Interpretation Section */}
        {parsed.interpretation && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Brain className="size-3.5 text-primary" />
              <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                How AI Interprets This
              </span>
            </div>
            <div className="rounded-lg border border-border bg-secondary/50 px-4 py-3">
              <p className="text-sm leading-relaxed text-foreground">
                {parsed.interpretation}
              </p>
            </div>
          </div>
        )}

        {/* Suggestions Section */}
        {parsed.suggestions.length > 0 && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Lightbulb className="size-3.5 text-primary" />
              <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                Suggested Improvements
              </span>
            </div>
            <div className="flex flex-col gap-2">
              {parsed.suggestions.map((suggestion, i) => (
                <div
                  key={i}
                  className="group flex items-start gap-3 rounded-lg border border-border bg-secondary/30 px-4 py-3 transition-colors hover:border-primary/30 hover:bg-secondary/50"
                >
                  <p className="flex-1 font-mono text-sm leading-relaxed text-foreground">
                    {suggestion}
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onSelectSuggestion(suggestion)}
                    disabled={isStreaming}
                    className="flex-shrink-0 gap-1.5 text-xs text-primary opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <Check className="size-3" />
                    Use this
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Questions Section */}
        {parsed.questions.length > 0 && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <MessageCircleQuestion className="size-3.5 text-primary" />
              <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                Clarifying Questions
              </span>
            </div>
            <div className="rounded-lg border border-border bg-secondary/30 px-4 py-3">
              <ul className="flex flex-col gap-2">
                {parsed.questions.map((q, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-sm leading-relaxed text-foreground"
                  >
                    <span className="mt-1.5 size-1 flex-shrink-0 rounded-full bg-primary" />
                    {q}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {isStreaming && (
          <span className="inline-block size-2 animate-pulse rounded-full bg-primary" />
        )}
      </div>
    </div>
  )
}

export function UserMessage({ text }: { text: string }) {
  return (
    <div className="flex justify-end">
      <div className="max-w-[80%] rounded-lg bg-primary/10 px-4 py-3">
        <p className="text-sm leading-relaxed text-foreground">{text}</p>
      </div>
    </div>
  )
}
