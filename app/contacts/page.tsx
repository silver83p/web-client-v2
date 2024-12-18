'use client'

import { SearchBar } from '@/components/search-bar'
import { ContactList } from '@/components/contact-list'
import { AddFriendButton } from '@/components/add-friend-button'
import { BottomNav } from '@/components/bottom-nav'
import { useRouter } from 'next/navigation'

export default function ContactsPage() {
  const router = useRouter()
  const addFriend = () => {
    router.push('/contacts/friend')
  }

  return (
    <>
      <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden scrollbar-thin">
        <div className="pb-20">
          <header className="sticky top-0 bg-white z-10 px-4 py-3 border-b">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-semibold">Contacts</h1>
              <button className="p-2">
                <svg
                  className="w-6 h-6"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="M21 21l-4.35-4.35" />
                </svg>
              </button>
            </div>
            <SearchBar placeholder="Search contacts..." />
          </header>
          <ContactList />
          <div className="absolute bottom-24 right-5">
            <AddFriendButton onClick={addFriend} />
          </div>
        </div>
      </div>
      <BottomNav />
    </>
  )
}
