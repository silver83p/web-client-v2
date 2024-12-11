'use client';

import { useRouter } from 'next/navigation';
import { UserPlus } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';

interface ChatHeaderProps {
  name: string;
  avatar: string;
}

export function ChatHeader({ name, avatar }: ChatHeaderProps) {
  const router = useRouter();

  return (
    <div className="sticky top-0 z-10 bg-white border-b px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => router.back()}
            className="p-2 -ml-2"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          {/* <Avatar className="w-8 h-8">
            <img src={avatar} alt={name} className="object-cover" />
          </Avatar> */}
          <div className="w-8 h-8 bg-primary flex items-center justify-center text-white text-xl rounded-full">
            {name[0]}
          </div>
          <h1 className="text-lg font-semibold">{name}</h1>
        </div>
        <button className="p-2">
          <UserPlus className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}