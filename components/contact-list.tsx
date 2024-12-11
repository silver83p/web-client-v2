'use client';

import { Avatar } from '@/components/ui/avatar';

const contacts = [
  {
    id: 1,
    name: 'Kaung',
    status: 'Online',
    avatar: 'https://source.unsplash.com/random/100x100?face-1',
    lastSeen: 'online'
  },
  {
    id: 2,
    name: 'Thant',
    status: 'Last seen 2 hours ago',
    avatar: 'https://source.unsplash.com/random/100x100?face-2',
    lastSeen: '2 hours ago'
  },
  {
    id: 3,
    name: 'Jai',
    status: 'Last seen 5 hours ago',
    avatar: 'https://source.unsplash.com/random/100x100?face-3',
    lastSeen: '5 hours ago'
  },
  {
    id: 4,
    name: 'Aamir',
    status: 'Offline',
    avatar: 'https://source.unsplash.com/random/100x100?face-4',
    lastSeen: 'offline'
  },
  {
    id: 5,
    name: 'Andrey',
    status: 'Last seen yesterday',
    avatar: 'https://source.unsplash.com/random/100x100?face-5',
    lastSeen: 'yesterday'
  }
];

export function ContactList() {
  return (
    <div className="divide-y">
      {contacts.map((contact) => (
        <div key={contact.id} className="flex items-center gap-4 p-4 hover:bg-gray-50">
          <div className="relative">
            {/* <Avatar className="w-12 h-12">
              <img src={contact.avatar} alt={contact.name} className="object-cover" />
            </Avatar> */}
            <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
              <span className="text-2xl">{contact.name[0].toUpperCase()}</span>
            </div>
            <span 
              className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                contact.lastSeen === 'online' ? 'bg-green-500' : 'bg-gray-300'
              }`}
            />
          </div>
          <div className="flex-1">
            <h3 className="font-medium">{contact.name}</h3>
            <p className="text-sm text-gray-500">{contact.status}</p>
          </div>
          <button className="p-2 text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
}