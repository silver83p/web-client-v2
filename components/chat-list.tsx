'use client';

import { useRouter } from 'next/navigation';
import { Avatar } from '@/components/ui/avatar';

const chats = [
  {
    id: 1,
    name: 'Omar Syed',
    message: 'I will send you the NFT today',
    time: 'Just now',
    unread: 1,
    avatar: 'https://source.unsplash.com/random/100x100?face-6',
    status: 'online'
  },
  {
    id: 2,
    name: 'Thant',
    message: "Sure, what's the latest?",
    time: '2:00 PM',
    avatar: 'https://source.unsplash.com/random/100x100?face-2',
    status: 'offline'
  },
  {
    id: 3,
    name: 'Jai',
    message: 'Hi, can we discuss the tokenomics for the new project?',
    time: '1:00 PM',
    unread: 3,
    avatar: 'https://source.unsplash.com/random/100x100?face-3',
    status: 'offline'
  },
  {
    id: 4,
    name: 'Aamir',
    message: 'I have some interesting ideas for the smart contracts',
    time: '12:00 PM',
    avatar: 'https://source.unsplash.com/random/100x100?face-4',
    status: 'offline'
  },
  {
    id: 5,
    name: 'Andrey',
    message: "How's your progress on the DApp UI design?",
    time: '11:00 AM',
    avatar: 'https://source.unsplash.com/random/100x100?face-5',
    status: 'offline'
  },
  {
    id: 6,
    name: 'Omar Syed',
    message: 'I will send you the NFT today',
    time: 'Just now',
    unread: 1,
    avatar: 'https://source.unsplash.com/random/100x100?face-6',
    status: 'online'
  },
  {
    id: 7,
    name: 'Thant',
    message: "Sure, what's the latest?",
    time: '2:00 PM',
    avatar: 'https://source.unsplash.com/random/100x100?face-2',
    status: 'offline'
  },
  {
    id: 8,
    name: 'Jai',
    message: 'Hi, can we discuss the tokenomics for the new project?',
    time: '1:00 PM',
    unread: 3,
    avatar: 'https://source.unsplash.com/random/100x100?face-3',
    status: 'offline'
  },
  {
    id: 9,
    name: 'Aamir',
    message: 'I have some interesting ideas for the smart contracts',
    time: '12:00 PM',
    avatar: 'https://source.unsplash.com/random/100x100?face-4',
    status: 'offline'
  },
  {
    id: 10,
    name: 'Andrey',
    message: "How's your progress on the DApp UI design?",
    time: '11:00 AM',
    avatar: 'https://source.unsplash.com/random/100x100?face-5',
    status: 'offline'
  }
];

export function ChatList() {
  const router = useRouter();

  return (
    <div className="divide-y">
      {chats.map((chat) => (
        <div 
          key={chat.id} 
          className="flex items-center gap-4 p-4 hover:bg-gray-50 cursor-pointer"
          onClick={() => router.push(`/chats/${chat.id}`)}
        >
          <div className="relative">
            {/* <Avatar className="w-12 h-12">
              <img src={chat.avatar} alt={chat.name} className="object-cover" />
            </Avatar> */}
            <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
              <span className="text-2xl">{chat.name[0].toUpperCase()}</span>
            </div>
            <span 
              className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                chat.status === 'online' ? 'bg-green-500' : 'bg-gray-300'
              }`}
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-baseline">
              <h3 className="font-medium truncate">{chat.name}</h3>
              <span className="text-sm text-gray-500 ml-2">{chat.time}</span>
            </div>
            <p className="text-sm text-gray-600 truncate">{chat.message}</p>
          </div>
          {chat.unread && (
            <span className="w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-xs">
              {chat.unread}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}