'use client'

import { useState } from 'react'
import { ArrowRight, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function PromptInputScreen({
  onSubmit,
}: {
  onSubmit: (prompt: string) => void
}) {
  const [prompt, setPrompt] = useState('')

  const handleSubmit = () => {
    if (!prompt.trim()) return
    onSubmit(prompt.trim())
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-4">
      <div className="flex w-full max-w-2xl flex-col items-center gap-8">
        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center gap-3">
            <Sparkles className="size-7 text-primary" />
            <h1 className="bg-gradient-to-r from-primary to-accent bg-clip-text font-display text-4xl font-bold tracking-tight text-transparent">
              Toonin
            </h1>
          </div>
          <p className="text-center text-base leading-relaxed text-muted-foreground">
            Paste or type your prompt below. We will help you refine it until AI
            understands exactly what you mean.
          </p>
        </div>

        <div className="relative w-full">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                handleSubmit()
              }
            }}
            placeholder="Write your prompt here... It doesn't need to be perfect."
            className="min-h-40 w-full resize-none rounded-xl border border-border bg-card px-4 py-4 text-base leading-relaxed text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            autoFocus
          />
          <div className="mt-3 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              Press Ctrl+Enter to start refining
            </span>
            <Button
              onClick={handleSubmit}
              disabled={!prompt.trim()}
              size="lg"
              className="gap-2"
            >
              Start Refining
              <ArrowRight className="size-4" />
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2">
          {[
            'Write me a blog post about AI',
            'Build a landing page for my app',
            'Create a marketing email campaign',
          ].map((example) => (
            <button
              key={example}
              onClick={() => setPrompt(example)}
              className="rounded-lg border border-border bg-secondary px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
            >
              {example}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
