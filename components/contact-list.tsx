"use client"

import { useApp } from "@/app/AppContext"
import { Avatar } from "@/components/ui/avatar"
import { toEthereumAddress } from "@/lib/utils"

export function ContactList() {
  const { state } = useApp()

  const shortenAddress = (address: string) => {
    const shortAddress = address.slice(0, 6) + "..." + address.slice(-4)
    console.log("address", address, "shortAddress", shortAddress)
    return shortAddress
  }

  return (

    <div className="divide-y">
      {state?.auth.accountData?.data?.friends && Object.entries(state.auth.accountData.data.friends).length > 0 ? (
        Object.entries(state.auth.accountData.data.friends).map(([id, friend]) => (
          <div key={id} className="flex items-center gap-4 p-4 hover:bg-gray-50">
            <div className="relative">
              {/* <Avatar className="w-12 h-12">
              <img src={contact.avatar} alt={contact.name} className="object-cover" />
            </Avatar> */}
              <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-2xl">{(friend as string).charAt(0).toUpperCase()}</span>
              </div>
              {/* <span
                className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                  friend.lastSeen === "online" ? "bg-green-500" : "bg-gray-300"
                }`}
              /> */}
            </div>
            <div className="flex-1">
              <h3 className="font-medium">{friend as string}</h3>
              <p className="text-sm text-gray-500">{shortenAddress(toEthereumAddress(id as string))}</p>
            </div>
            <button className="p-2 text-gray-400 hover:text-gray-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </button>
          </div>
        ))
      ) : (
        <div className="flex flex-col items-center justify-center flex-1 p-4">
          <p className="text-2xl font-semibold text-gray-400">No Friends Yet</p>
        </div>
      )}
    </div>
  )
}
