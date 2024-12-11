"use client";

import { ChatHeader } from "@/components/chat/chat-header";
import { ChatMessages } from "@/components/chat/chat-messages";
import { ChatInput } from "@/components/chat/chat-input";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ChatViewProps {
  chatId: string;
}

export function ChatView({ chatId }: ChatViewProps) {
  return (
    <div className="flex flex-col h-screen">
      <ChatHeader
        name="Omar Syed"
        avatar="https://source.unsplash.com/random/100x100?face-6"
      />

      <ScrollArea className="flex overflow-y-auto">
        <ChatMessages chatId={chatId} />
      </ScrollArea>
      <div className="fixed bottom-20 right-0 left-0">
        <ChatInput />
      </div>
    </div>
  );
}
