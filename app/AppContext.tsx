'use client'

import React, { createContext, useContext, useReducer, useEffect, Dispatch, use } from 'react';
import { useRouter } from 'next/navigation';
import { authReducer, initialAuthState, AuthState, AuthAction } from "@/store/reducers/authReducer";
import { messageReducer, initialMessageState, MessageState, MessageAction } from "@/store/reducers/messageReducer";
import { authActions } from '@/store/actions/authActions';
import { messageActions } from '@/store/actions/messageActions';
import { initializeShardusCrypto, loadWallet } from "@/lib/utils"


export type AppState = {
  auth: AuthState;
  message: MessageState;
};

export type AppAction = 
  | { type: 'AUTH'; action: AuthAction }
  | { type: 'MESSAGE'; action: MessageAction };

type AppContextType = {
  state: AppState;
  dispatch: Dispatch<AppAction>;
  authActions: ReturnType<typeof createAuthActions>;
  messageActions: ReturnType<typeof createMessageActions>;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

function createAuthActions(dispatch: Dispatch<AppAction>) {
  return {
    login: authActions.login(dispatch),
    logout: authActions.logout(dispatch),
    saveCredentials: authActions.saveCredentials(dispatch),
    loadAccountData: authActions.loadAccountData(dispatch),
  };
}

function createMessageActions(dispatch: Dispatch<AppAction>) {
  return {
    addMessage: messageActions.addMessage(dispatch),
    clearMessages: messageActions.clearMessages(dispatch),
  };
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(
    (state: AppState, action: AppAction) => {
      switch (action.type) {
        case 'AUTH':
          return { ...state, auth: authReducer(state.auth, action.action) };
        case 'MESSAGE':
          return { ...state, message: messageReducer(state.message, action.action) };
        default:
          return state;
      }
    },
    {
      auth: initialAuthState,
      message: initialMessageState,
    }
  );

  const router = useRouter();
  const authActionCreators = createAuthActions(dispatch);
  const messageActionCreators = createMessageActions(dispatch);

  useEffect(() => {
    const username = 'jai2'
    const wallet = loadWallet(username);
    console.log(wallet)
    if (wallet) {
      authActionCreators.saveCredentials(username, wallet.entry)
      authActionCreators.login(wallet.entry.address)
    }
  }, [])

  useEffect(() => {
    initializeShardusCrypto()
    if (state.auth.isLoggedIn) {
      router.push("/")
    } else {
      router.push("/auth/get-started")
    }
  }, [state.auth.isLoggedIn, router])

  return (
    <AppContext.Provider value={{ state, dispatch, authActions: authActionCreators, messageActions: messageActionCreators }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

