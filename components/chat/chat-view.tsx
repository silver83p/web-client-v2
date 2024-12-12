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
    <div className="flex flex-col">
      <ChatHeader
        name="Omar Syed"
        avatar="https://source.unsplash.com/random/100x100?face-6"
      />
      <div className="flex pl-2 pr-2 pt-2 mb-28">
        <ChatMessages chatId={chatId} />
      </div>
      <div className="z-10 absolute bottom-1 right-0 left-0  bg-white">
        <ChatInput />
      </div>
    </div>
  );
}
