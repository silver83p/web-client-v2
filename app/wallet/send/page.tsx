"use client"

import { useRouter } from "next/navigation"
import { X, User2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import React, { useEffect, useState } from "react"
import { useApp } from "@/app/AppContext"
import { getAccountData, getAddress, transferTokens } from "@/lib/utils"
import { useTransactionStatus } from "@/hooks/use-transaction-status"
import { TransactionDialog } from "@/components/wallet/send/transaction-dialog"

export default function SendPage() {
  const router = useRouter()
  const { state, authActions } = useApp()

  const [username, setUsername] = useState("")
  const [usernameError, setUsernameError] = useState("")
  const [receiver, setReceiver] = useState("")
  const [amount, setAmount] = useState("")
  const [amountError, setAmountError] = useState("")
  const [isUsernameChecking, setIsUsernameChecking] = useState(false)

  const { isLoading, message, showDialog, handleTransaction, closeDialog } = useTransactionStatus()

  const checkBalanceChange = async (): Promise<{ success: boolean; result?: any; error?: any }> => {
    let retries = 0
    const maxRetries = 20
    let success = false
    let result = null

    const beforeBalance = state.auth.accountData.data.balance
    let afterBalance = state.auth.accountData.data.balance

    while (retries < maxRetries) {
      const data = (await getAccountData(state.auth.walletEntry.address)) as any
      if (data.account) {
        afterBalance = data.account.data.balance
      }
      await new Promise((resolve) => setTimeout(resolve, 500))
      if (afterBalance !== beforeBalance) {
        success = true
        result = "The coin is sent successfully!"
        authActions.loadAccountData(state.auth.walletEntry.address)
        break
      }
      retries++
    }

    return {
      success,
      result,
      error: !success ? "The account balance has not changed!" : null,
    }
  }

  const onSend = async () => {
    if (receiver && amount) {
      await handleTransaction(
        () =>
          transferTokens(
            receiver,
            amount,
            state.networkParams.parameters.current.transactionFee,
            state.auth.walletEntry
          ),
        checkBalanceChange,
      )
    }
  }

  const handleContactClick = () => {
    // router.push('/contacts');
  }

  const checkUsername = async (e: React.FormEvent) => {
    e.preventDefault()
    setReceiver("")
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
      setReceiver(fetchedAddress)
      setIsUsernameChecking(false)
      setUsernameError("The username is valid.")
      return
    }
  }

  useEffect(() => {
    const debounceCheck = setTimeout(async () => {
      setAmountError("")
      if (amount) {
        if (!/^\d+$/.test(amount)) {
          setAmountError("Amount must be a positive number.")
          return
        }
        const parsedAmount = BigInt(amount)
        if (typeof parsedAmount !== "bigint" || parsedAmount <= BigInt(0)) {
          setAmountError("Amount must be a positive number.")
          return
        }
        if (parsedAmount > state.auth.accountData.data.balance) {
          setAmountError("Insufficient balance.")
          return
        }
      }
    }, 500) // Debounce for 500ms

    return () => clearTimeout(debounceCheck)
  }, [amount])

  if (!state.auth?.isLoggedIn) {
    return <></>
  }

  return (
    <div className="h-full">
      <div className="p-4">
        {/* <div className="flex items-center mb-6">
          <button onClick={() => router.back()} className="rounded-full p-1.5 hover:bg-gray-100 mr-3">
            <X className="h-4 w-4" />
          </button>
          <h1 className="text-xl font-semibold">Send Liberdus</h1>
        </div> */}
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-center flex-1">Send Liberdus</h1>
          <button className="absolute left-4" onClick={() => router.back()}>
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="space-y-6 mt-10">
          <div className="relative">
            <Input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full pr-10"
              onBlur={(e) => checkUsername(e)}
            />
            <button
              onClick={handleContactClick}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-100"
            >
              <User2 className="h-4 w-4 text-gray-500" />
            </button>
          </div>
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

          <div className="relative">
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className="flex ">
                <img
                  src="/icon-512x512.png"
                  className="flex h-5 w-5 items-center justify-center rounded-full bg-orange-100"
                  alt="Liberdus logo"
                />
              </div>
            </div>
            <Input
              type="text"
              placeholder="Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full"
            />
          </div>
          {amountError && <span className={`text-sm text-red-600`}> {amountError}</span>}

          <div className="space-y-2 text-sm text-gray-600">
            <p>
              Transaction Fee - {state.networkParams.parameters?.current?.transactionFee.toString()}{" "}
              <b> LIB </b>
            </p>
            <p>
              Balance - {state.auth.accountData?.data?.balance.toString()} <b> LIB </b> ( 13.5 USD )
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => router.back()}
              className="flex-1 rounded-lg bg-gray-100 py-2.5 text-gray-900 hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              onClick={onSend}
              className="flex-1 rounded-lg bg-indigo-600 py-2.5 text-white hover:bg-indigo-700"
              disabled={!(receiver && !amountError && amount)}
              style={{
                opacity: !(receiver && !amountError && amount) ? 0.5 : 1,
              }}
            >
              Send
            </button>
          </div>
        </div>
      </div>
      <TransactionDialog loading={isLoading} message={message} open={showDialog} onClose={closeDialog} />
    </div>
  )
}
