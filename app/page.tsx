'use client';

import { useEffect } from 'react';
import { redirect, useRouter } from 'next/navigation';
import { SearchBar } from '@/components/search-bar';
import { ChatList } from '@/components/chat-list';
import { NewChatButton } from '@/components/new-chat-button';
import ChatsPage from './chats/page';
import ContactsPage from './contacts/page';
import { BottomNav } from '@/components/bottom-nav';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Check authentication from localStorage instead of cookies
    const isAuthenticated = localStorage.getItem('authenticated');
    if (!isAuthenticated) {
      router.push('/auth/get-started');
    }
  }, [router]);

  return (
      <ChatsPage />
      // <ContactsPage />
  );
}