'use client'

import { Sparkles, Copy, Check } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useState } from 'react'

export function PinnedPrompt({
  prompt,
  version,
}: {
  prompt: string
  version: number
}) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(prompt)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="border-b border-border bg-card/80 backdrop-blur-sm">
      <div className="mx-auto flex max-w-3xl items-start gap-3 px-4 py-3">
        <div className="mt-0.5 flex-shrink-0">
          <Sparkles className="size-4 text-primary" />
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium uppercase tracking-wider text-primary">
              Your Prompt
            </span>
            <Badge variant="outline" className="text-[10px] text-muted-foreground">
              v{version}
            </Badge>
          </div>
          <p className="font-mono text-sm leading-relaxed text-foreground">
            {prompt}
          </p>
        </div>
        <button
          onClick={handleCopy}
          className="mt-0.5 flex-shrink-0 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          aria-label="Copy prompt"
        >
          {copied ? (
            <Check className="size-3.5 text-primary" />
          ) : (
            <Copy className="size-3.5" />
          )}
        </button>
      </div>
    </div>
  )
}
