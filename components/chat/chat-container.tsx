import { ChatView } from './chat-view';

interface ChatContainerProps {
  chatId: string;
}

export function ChatContainer({ chatId }: ChatContainerProps) {
  return <ChatView chatId={chatId} />;
}