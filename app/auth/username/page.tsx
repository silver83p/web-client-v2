'use client';

import { Flame } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Input } from '@/components/ui/input';

export default function UsernamePage() {
  const router = useRouter();
  const [username, setUsername] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      router.push('/auth/recovery');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center px-4 pt-12">
      <button 
        onClick={() => router.back()}
        className="self-start p-2 -ml-2"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <h1 className="text-xl font-semibold mb-8">Choose a Username</h1>

      {/* <div className="w-24 h-24 rounded-full bg-orange-500 flex items-center justify-center mb-8">
        <Flame className="w-12 h-12 text-white" />
      </div> */}

      <img src="/icon-512x512.png" className="w-24 h-24 rounded-full flex items-center justify-center mb-8" alt="Liberdus logo" />


      <p className="text-gray-600 mb-6 text-center">
        Pick a unique username or display name.
      </p>

      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-6">
        <div>
          <label className="block text-sm text-gray-600 mb-2">
            Username or display name
          </label>
          <Input
            type="text"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-indigo-600 text-white rounded-lg py-3 px-4"
        >
          Continue
        </button>
      </form>

      <p className="text-sm text-gray-500 text-center mt-auto mb-6">
        By using this service, you agree to our Terms of Service and Privacy Policy
      </p>
    </div>
  );
}