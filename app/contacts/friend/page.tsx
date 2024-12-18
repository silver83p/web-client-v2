"use client"

import { useRouter } from "next/navigation"
import { useApp } from "@/app/AppContext"
import { X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useEffect, useState } from "react"
import { addFriend, getAccountData, getAddress } from "@/lib/utils"
import { TransactionDialog } from "@/components/wallet/send/transaction-dialog"
import { useTransactionStatus } from "@/hooks/use-transaction-status"

export default function AddFriend() {
  const router = useRouter()
  const { state, authActions } = useApp()

  const [username, setUsername] = useState("")
  const [friendAddress, setFriendAddress] = useState("")
  const [isUsernameChecking, setIsUsernameChecking] = useState(false)
  const [usernameError, setUsernameError] = useState("")

  const { isLoading, message, showDialog, handleTransaction, closeDialog } = useTransactionStatus()

  const sendFriendRequest = async () => {
    if (friendAddress) {
      await handleTransaction(
        () => addFriend(username, friendAddress, state.auth.walletEntry),
        checkFriendAdded
      )
    }
  }

  const checkFriendAdded = async (): Promise<{ success: boolean; result?: any; error?: any }> => {
    let retries = 0
    const maxRetries = 20
    let success = false
    let result = null

    while (retries < maxRetries) {
      const data = (await getAccountData(state.auth.walletEntry.address)) as any
      if (data.account) {
        const { friends } = data.account.data
        if (Object.keys(friends).includes(friendAddress)) {
          success = true
          result = "The friend is added successfully"
          authActions.loadAccountData(state.auth.walletEntry.address)
          break
        }
      }
      await new Promise((resolve) => setTimeout(resolve, 500))
      retries++
    }

    return {
      success,
      result,
      error: !success ? "The friend is not added" : null,
    }
  }

  useEffect(() => {
    setFriendAddress("")
    const debounceCheck = setTimeout(async () => {
      if (username.trim()) {
        if (username.length < 3) {
          setUsernameError("Username must be at least 3 characters long.")
          return
        }
        if (!/^[a-zA-Z0-9]*$/.test(username)) {
          setUsernameError("Username can contain only alphabets and numeric characters.")
          return
        }
        setIsUsernameChecking(true)
        const fetchedAddress = await getAddress(username)
        if (fetchedAddress === undefined || fetchedAddress === null) {
          setUsernameError("User not found.")
          setIsUsernameChecking(false)
          return
        }
        setFriendAddress(fetchedAddress)
        setIsUsernameChecking(false)
        setUsernameError("The username is valid.")
        return
      }
    }, 500) // Debounce for 500ms

    return () => clearTimeout(debounceCheck)
  }, [username])

  return (
    <div className="flex-1 flex-col rounded-3xl bg-white">
      <div className="p-4 space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-center flex-1">Add Friend</h1>
          <button className="absolute left-4" onClick={() => router.back()}>
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="space-y-2">
          <label htmlFor="username" className="block text-sm font-medium text-gray-700">
            Enter Account ID or Username
          </label>
          <Input
            type="text"
            placeholder="e.g., 0x1234abcd or Username"
            className="w-full px-4 py-3 rounded-lg"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          {isUsernameChecking ? (
            <span className="text-sm text-gray-600">Checking username...</span>
          ) : (
            usernameError && (
              <span
                className={`text-sm ${usernameError.includes("valid") ? "text-green-600" : "text-red-600"}`}
              >
                {usernameError}
              </span>
            )
          )}
        </div>

        <button
          className="absolute bottom-10 left-8 right-8 mb-4 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg text-base"
          onClick={sendFriendRequest}
          disabled={!friendAddress}
          style={{
            opacity: !friendAddress ? 0.5 : 1,
          }}
        >
          Add Friend
        </button>
      </div>
      <TransactionDialog loading={isLoading} message={message} open={showDialog} onClose={closeDialog} />
    </div>
  )
}
