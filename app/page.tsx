'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import ChatsPage from './chats/page'
import { initializeShardusCrypto } from '@/lib/utils'
import { useApp } from './AppContext'

export default function Home() {
  const router = useRouter()
  const { state } = useApp()

  // useEffect(() => {
  //   if (!state.auth.isLoggedIn) {
  //     router.push('/auth/get-started')
  //   }
  // }, [state.auth.isLoggedIn, router])

  return state.auth.isLoggedIn ? <ChatsPage /> : <></>
}
