'use client'

import { ChatHeader } from '@/components/chat/chat-header'
import { ChatMessages } from '@/components/chat/chat-messages'
import { ChatInput } from '@/components/chat/chat-input'
import { ScrollArea } from '@/components/ui/scroll-area'

interface ChatViewProps {
  chatId: string
}

export function ChatView({ chatId }: ChatViewProps) {
  return (
    <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden scrollbar-thin">
      <ChatHeader name="Omar Syed" avatar="https://source.unsplash.com/random/100x100?face-6" />
      <div className="flex-1 pl-2 pr-2 pt-2 mb-28">
        <ChatMessages chatId={chatId} />
      </div>
      <div className="z-10 absolute bottom-0 right-0 left-0  bg-white">
        <ChatInput />
      </div>
    </div>
  )
}
