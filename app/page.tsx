'use client'

import { useState } from 'react'
import { PromptInputScreen } from '@/components/prompt-input-screen'
import { ChatInterface } from '@/components/chat-interface'

export default function Home() {
  const [initialPrompt, setInitialPrompt] = useState<string | null>(null)

  if (initialPrompt === null) {
    return <PromptInputScreen onSubmit={(prompt) => setInitialPrompt(prompt)} />
  }

  return (
    <ChatInterface
      key={initialPrompt}
      initialPrompt={initialPrompt}
      onNewChat={() => setInitialPrompt(null)}
    />
  )
}
