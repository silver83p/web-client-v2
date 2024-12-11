'use client';

import { Avatar } from '@/components/ui/avatar';
import { ScrollArea } from '@radix-ui/react-scroll-area';

interface Message {
  id: string;
  content: string;
  sender: string;
  timestamp: string;
  isOutgoing: boolean;
}

const MOCK_MESSAGES: Message[] = [
  {
    id: '1',
    content: 'I will send you the NFT today',
    sender: 'Omar',
    timestamp: '12:00pm',
    isOutgoing: false
  }
];

interface ChatMessagesProps {
  chatId: string;
}

export function ChatMessages({ chatId }: ChatMessagesProps) {
  return (
    // <ScrollArea className="flex-1 overflow-y-auto p-4">
    <div className="space-y-6">
      <div className="text-center">
        <span className="text-sm text-gray-500">Today</span>
      </div>

      {MOCK_MESSAGES.map((message) => (
        <div
          key={message.id}
          className={`flex items-end gap-2 ${
            message.isOutgoing ? 'flex-row-reverse' : 'flex-row'
          }`}
        >
          {!message.isOutgoing && (
            // <Avatar className="w-8 h-8">
            //   <img
            //     src="https://source.unsplash.com/random/100x100?face-6"
            //     alt={message.sender}
            //     className="object-cover"
            //   />
            // </Avatar>
            <div className="w-8 h-8 bg-primary flex items-center justify-center text-white text-xl rounded-full">
              {message.sender.charAt(0)}
            </div>
          )}
          <div
            className={`group relative max-w-[75%] rounded-2xl px-4 py-2 ${
              message.isOutgoing
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-900'
            }`}
          >
            <p>{message.content}</p>
            <span
              className={`absolute -bottom-5 text-xs ${
                message.isOutgoing ? 'right-0' : 'left-0'
              } text-gray-500`}
            >
              {message.sender} - {message.timestamp}
            </span>
          </div>
        </div>
      ))}

      <div className="text-center my-4">
        <p className="text-sm text-gray-500">The sender is not in your contact list.</p>
        <div className="flex justify-center gap-4 mt-4">
          <button className="bg-indigo-600 text-white px-6 py-2 rounded-full">
            Accept Toll
          </button>
          <button className="bg-gray-100 text-gray-900 px-6 py-2 rounded-full">
            Return Toll
          </button>
        </div>
      </div>
    </div>
    // </ScrollArea>
  );
}