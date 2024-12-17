"use client"

import { useRouter } from "next/navigation"
import { useEffect, useReducer, useState } from "react"
import { ImportKeyBox } from "@/components/import-key-box"
import { getAddress, importWallet, saveWallet, registerAlias, WalletEntry, WalletInfo } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { useApp } from "@/app/AppContext"

export default function ImportPage() {
  const router = useRouter()
  const [seedPhrase, setSeedPhrase] = useState("")
  const [username, setUsername] = useState("")
  const [entry, setEntry] = useState<WalletEntry | null>(null)
  const [isRegistered, setIsRegistered] = useState(true)
  const [availability, setAvailability] = useState<string | null>(null)
  const [isChecking, setIsChecking] = useState(false)
  const [isCreatingAccount, setIsCreatingAccount] = useState(false)

  const { dispatch } = useApp()

  const checkAccountCreation = async (
    username: string
  ): Promise<{ success: boolean; address: string | null }> => {
    let retries = 0
    const maxRetries = 20
    let created = false
    let address = null

    while (retries < maxRetries) {
      address = await getAddress(username)
      if (address === undefined || address === null) {
        created = false
      } else {
        created = true
      }
      if (created) {
        break
      }
      await new Promise((resolve) => setTimeout(resolve, 500))
      retries++
    }

    return {
      success: created,
      address,
    }
  }

  useEffect(() => {
    const debounceCheck = setTimeout(async () => {
      if (username) {
        if (username.length < 3) {
          setAvailability("Username must be at least 3 characters long.")
          return
        }
        if (!/^[a-zA-Z0-9]*$/.test(username)) {
          setAvailability("Username can contain only alphabets and numeric characters.")
          return
        }
        setIsChecking(true)
        const address = await getAddress(username)
        if (address) {
          setAvailability("Username is already taken.")
        } else {
          setAvailability("Username is available!")
        }
        setIsChecking(false)
      } else {
        setAvailability(null)
      }
    }, 500) // Debounce for 500ms

    return () => clearTimeout(debounceCheck)
  }, [username])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (username.trim()) {
      if (username.length < 3) {
        setAvailability("Username must be at least 3 characters long.")
        return
      }
      if (!/^[a-zA-Z0-9]*$/.test(username)) {
        setAvailability("Username can contain only alphabets and numeric characters.")
        return
      }
      const fetchedAddress = await getAddress(username)
      if (fetchedAddress) {
        setAvailability("Username is already taken.")
        return
      }
      setIsCreatingAccount(true)

      const wallet = {
        handle: username.toLowerCase(),
        entry,
      } as WalletInfo

      let isSubmitted = await registerAlias(wallet.handle, wallet.entry)
      if (!isSubmitted) {
        setAvailability("Error creating account. Please try again.")
        setIsCreatingAccount(false)
        return
      }

      const { success: isAccountCreated, address } = await checkAccountCreation(username)
      setIsCreatingAccount(false)
      if (isAccountCreated) {
        if (address === wallet.entry.address) {
          saveWallet(wallet)
          dispatch({
            type: "AUTH",
            action: { type: "SAVE_CREDENTIALS", payload: { username, walletEntry: wallet.entry } },
          })
          dispatch({ type: "AUTH", action: { type: "LOGIN" } })
          router.push("/")
        } else {
          setAvailability("Account creation failed with the specified username. Please try again.")
        }
      } else {
        setAvailability("Error creating account. Please try again.")
      }
    }
  }

  const handleContinue = async () => {
    if (seedPhrase.trim()) {
      const { handle, entry } = await importWallet(seedPhrase)
      console.log("importWallet", handle, entry)
      if (handle !== "Nousername") {
        setIsRegistered(true)
        setUsername(handle)
        saveWallet({ handle, entry })
        dispatch({
          type: "AUTH",
          action: { type: "SAVE_CREDENTIALS", payload: { username: handle, walletEntry: entry } },
        })
        dispatch({ type: "AUTH", action: { type: "LOGIN" } })
        router.push("/")
        return
      }
      setIsRegistered(false)
      setEntry(entry)
    }
  }

  const handleScan = () => {
    // QR code scanning functionality to be implemented
  }

  return (
    <div className="flex flex-col items-center px-4 pt-12">
      <button onClick={() => router.back()} className="self-start p-2 -ml-2">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <h1 className="text-xl font-semibold mb-8">
        {isRegistered ? "Enter Seed Phrase" : "Register Username"}
      </h1>

      <img src="/icon-512x512.png" className="w-24 h-24 rounded-full mb-8" alt="Liberdus logo" />

      {isRegistered ? (
        <>
          <p className="text-gray-600 mb-6 text-center">
            Enter your 12-word seed phrase to recover your account.
          </p>

          <div className="w-full max-w-sm space-y-6">
            <ImportKeyBox value={seedPhrase} onChange={setSeedPhrase} onScan={handleScan} />

            <button onClick={handleContinue} className="w-full bg-indigo-600 text-white rounded-lg py-3 px-4">
              Continue
            </button>
          </div>
        </>
      ) : (
        <>
          <p className="text-gray-600 mb-6 text-center">Register a username for your imported account</p>

          <div className="relative w-full max-w-sm space-y-6">
            <label className="block text-sm text-gray-600 mb-2">Username or display name</label>
            <Input
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full mb-2"
            />
            {isChecking ? (
              <p className="mt-2 text-gray-600">Checking username...</p>
            ) : (
              availability && (
                <p
                  className={`mt-2 ${availability.includes("available") ? "text-green-600" : "text-red-600"}`}
                >
                  {availability}
                </p>
              )
            )}
            <button
              type="submit"
              onClick={handleSubmit}
              className="w-full mt-2 bg-indigo-600 text-white rounded-lg py-3 px-4 flex justify-between items-center"
            >
              {isCreatingAccount ? (
                <>
                  <span>Creating Account... </span>
                  <span className="animate-spin h-5 w-5 mr-3 border-4 border-white border-t-transparent rounded-full"></span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </>
              )}
            </button>
          </div>
        </>
      )}

      <p className="absolute bottom-4 left-2 right-2 text-sm text-gray-500 text-center mt-auto mb-6">
        By using this service, you agree to our Terms of Service and Privacy Policy
      </p>
    </div>
  )
}
