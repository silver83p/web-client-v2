import { ChatContainer } from '@/components/chat/chat-container';

// Generate static paths at build time
export function generateStaticParams() {
  return [
    { id: '1' },
    { id: '2' },
    { id: '3' },
    { id: '4' },
    { id: '5' }
  ];
}

export default function ChatPage({ params }: { params: { id: string } }) {
  return <ChatContainer chatId={params.id} />;
}