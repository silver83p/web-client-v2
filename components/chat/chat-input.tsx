'use client';

import { Send } from 'lucide-react';

export function ChatInput() {
  return (
    <div className="border-t p-4">
      <div className="flex items-center gap-2">
        <input
          type="text"
          placeholder="Message Omar"
          className="flex-1 rounded-full bg-gray-100 px-4 py-2 focus:outline-none"
        />
        <button className="p-2">
          <Send className="w-6 h-6 text-indigo-600" />
        </button>
      </div>
    </div>
  );
}