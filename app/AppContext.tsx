"use client"

import React, { createContext, useContext, useReducer, useEffect } from "react"
import { useRouter } from "next/navigation"
import { authReducer, initialAuthState, AuthState, AuthAction } from "@/reducers/authReducer"
import { messageReducer, initialMessageState, MessageState, MessageAction } from "@/reducers/messageReducer"
import { initializeShardusCrypto } from "@/lib/utils"

type AppState = {
  auth: AuthState
  message: MessageState
}

type AppAction = { type: "AUTH"; action: AuthAction } | { type: "MESSAGE"; action: MessageAction }

const AppContext = createContext<
  | {
      state: AppState
      dispatch: React.Dispatch<AppAction>
    }
  | undefined
>(undefined)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(
    (state: AppState, action: AppAction) => {
      switch (action.type) {
        case "AUTH":
          return { ...state, auth: authReducer(state.auth, action.action) }
        case "MESSAGE":
          return { ...state, message: messageReducer(state.message, action.action) }
        default:
          return state
      }
    },
    {
      auth: initialAuthState,
      message: initialMessageState,
    }
  )

  const router = useRouter()

  useEffect(() => {
    initializeShardusCrypto()
    if (state.auth.isLoggedIn) {
      router.push("/")
    } else {
      router.push("/auth/get-started")
    }
  }, [state.auth.isLoggedIn, router])

  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>
}

export function useApp() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider")
  }
  return context
}
