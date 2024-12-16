'use client'

import { useEffect, useState } from 'react'
import { redirect, useRouter } from 'next/navigation'
import { SearchBar } from '@/components/search-bar'
import { ChatList } from '@/components/chat-list'
import { NewChatButton } from '@/components/new-chat-button'
import ChatsPage from './chats/page'
import ContactsPage from './contacts/page'
import { BottomNav } from '@/components/bottom-nav'
import { initializeShardusCrypto } from '@/lib/utils'
import ChatPage from './chats/[id]/page'

export default function Home() {
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    console.log('useEffect')
    initializeShardusCrypto()
    // Check authentication from localStorage instead of cookies
    const isAuthenticated = localStorage.getItem('authenticated')
    console.log('isAuthenticated', isAuthenticated)
    if (isAuthenticated) {
      setIsLoggedIn(true)
    } else {
      setIsLoggedIn(false)
      router.push('/auth/get-started')
    }
  }, [router])

  return isLoggedIn ? <ChatsPage /> : <></>
}
