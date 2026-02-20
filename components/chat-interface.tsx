'use client'

import { useState, useRef, useEffect } from 'react'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import type { UIMessage } from 'ai'
import { Send, RotateCcw, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PinnedPrompt } from '@/components/pinned-prompt'
import { AIMessage, UserMessage } from '@/components/ai-message'

function getUIMessageText(msg: UIMessage): string {
  if (!msg.parts || !Array.isArray(msg.parts)) return ''
  return msg.parts
    .filter((p): p is { type: 'text'; text: string } => p.type === 'text')
    .map((p) => p.text)
    .join('')
}

export function ChatInterface({
  initialPrompt,
  onNewChat,
}: {
  initialPrompt: string
  onNewChat: () => void
}) {
  const [currentPrompt, setCurrentPrompt] = useState(initialPrompt)
  const [promptVersion, setPromptVersion] = useState(1)
  const [input, setInput] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ api: '/api/refine' }),
  })

  const isLoading = status === 'streaming' || status === 'submitted'

  // Send initial prompt on mount
  const hasSentInitial = useRef(false)
  useEffect(() => {
    if (!hasSentInitial.current) {
      hasSentInitial.current = true
      sendMessage(
        { text: initialPrompt },
        {
          body: {
            currentPrompt: initialPrompt,
            isInitial: true,
          },
        }
      )
    }
  }, [initialPrompt, sendMessage])

  // Auto-scroll on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, status])

  const handleSelectSuggestion = (suggestion: string) => {
    setCurrentPrompt(suggestion)
    setPromptVersion((v) => v + 1)
    // Send a follow-up message with the updated prompt
    sendMessage(
      {
        text: `I've selected this improved prompt: "${suggestion}". Please analyze this updated version and suggest further refinements.`,
      },
      {
        body: {
          currentPrompt: suggestion,
          isInitial: false,
        },
      }
    )
  }

  const handleSendMessage = () => {
    if (!input.trim() || isLoading) return
    sendMessage(
      { text: input },
      {
        body: {
          currentPrompt,
          isInitial: false,
        },
      }
    )
    setInput('')
  }

  return (
    <div className="flex h-dvh flex-col">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-border bg-background px-4 py-2">
        <div className="flex items-center gap-2">
          <Sparkles className="size-4 text-primary" />
          <span className="bg-gradient-to-r from-primary to-accent bg-clip-text font-display text-sm font-bold tracking-tight text-transparent">
            Toonin
          </span>
        </div>
        <Button variant="ghost" size="sm" onClick={onNewChat} className="gap-1.5 text-xs">
          <RotateCcw className="size-3" />
          New Prompt
        </Button>
      </header>

      {/* Pinned Prompt */}
      <PinnedPrompt prompt={currentPrompt} version={promptVersion} />

      {/* Messages */}
      <div className="flex-1 overflow-y-auto" ref={scrollRef}>
        <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-6">
          {messages.map((message) => {
            const text = getUIMessageText(message)
            if (!text) return null

            if (message.role === 'assistant') {
              return (
                <AIMessage
                  key={message.id}
                  text={text}
                  onSelectSuggestion={handleSelectSuggestion}
                  isStreaming={
                    isLoading &&
                    message.id === messages[messages.length - 1]?.id
                  }
                />
              )
            }

            return <UserMessage key={message.id} text={text} />
          })}

          {/* Loading indicator when submitted but no messages yet */}
          {status === 'submitted' &&
            messages[messages.length - 1]?.role === 'user' && (
              <div className="flex gap-3">
                <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10">
                  <div className="size-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                </div>
                <div className="flex items-center">
                  <span className="text-sm text-muted-foreground">
                    Analyzing your prompt...
                  </span>
                </div>
              </div>
            )}
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-border bg-background px-4 py-3">
        <div className="mx-auto flex max-w-3xl items-end gap-2">
          <div className="relative flex-1">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSendMessage()
                }
              }}
              placeholder="Answer questions, add context, or describe what you need differently..."
              rows={1}
              className="w-full resize-none rounded-lg border border-border bg-card px-4 py-2.5 text-sm leading-relaxed text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              disabled={isLoading}
            />
          </div>
          <Button
            onClick={handleSendMessage}
            disabled={!input.trim() || isLoading}
            size="icon"
          >
            <Send className="size-4" />
            <span className="sr-only">Send message</span>
          </Button>
        </div>
        <p className="mx-auto mt-1.5 max-w-3xl text-[11px] text-muted-foreground">
          Answer the clarifying questions above or tell the AI more about what
          you need.
        </p>
      </div>
    </div>
  )
}
