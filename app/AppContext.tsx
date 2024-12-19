'use client'

import React, { createContext, useContext, useReducer, useEffect, Dispatch, use } from 'react';
import { useRouter } from 'next/navigation';
import { authReducer, initialAuthState, AuthState, AuthAction } from "@/store/reducers/authReducer";
import { messageReducer, initialMessageState, MessageState, MessageAction } from "@/store/reducers/messageReducer";
import { networkParamsReducer, initialNetworkParamsState, NetworkParamsState, NetworkParamsAction } from "@/store/reducers/networkParamsReducer";
import { authActions } from '@/store/actions/authActions';
import { messageActions } from '@/store/actions/messageActions';
import { networkParamsActions } from '@/store/actions/networkParamsActions';

import { getPrivateKeyHex, initializeShardusCrypto, loadWallet } from "@/lib/utils"


export type AppState = {
  auth: AuthState;
  message: MessageState;
  networkParams: NetworkParamsState;
};

export type AppAction = 
  | { type: 'AUTH'; action: AuthAction }
  | { type: 'MESSAGE'; action: MessageAction }
  | { type: 'NETWORK_PARAMS'; action: NetworkParamsAction };
  

type AppContextType = {
  state: AppState;
  dispatch: Dispatch<AppAction>;
  authActions: ReturnType<typeof createAuthActions>;
  messageActions: ReturnType<typeof createMessageActions>;
  networkParamsActions: ReturnType<typeof createNetworkParamsActions>;
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

function createNetworkParamsActions(dispatch: Dispatch<AppAction>) {
  return {
    loadNetworkParams: networkParamsActions.loadNetworkParams(dispatch),
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
        case 'NETWORK_PARAMS':
          return { ...state, networkParams: networkParamsReducer(state.networkParams, action.action) };
        default:
          return state;
      }
    },
    {
      auth: initialAuthState,
      message: initialMessageState,
      networkParams: initialNetworkParamsState
    }
  );

  const router = useRouter();
  const authActionCreators = createAuthActions(dispatch);
  const messageActionCreators = createMessageActions(dispatch);
  const networkParamsActionCreators = createNetworkParamsActions(dispatch);

  useEffect(() => {
    initializeShardusCrypto()
    if (state.auth.isLoggedIn) {
      router.push("/")
    } else {
      router.push("/auth/get-started")
    }
  }, [state.auth.isLoggedIn, router])

  return (
    <AppContext.Provider value={{ state, dispatch, authActions: authActionCreators, messageActions: messageActionCreators, networkParamsActions: networkParamsActionCreators }}>
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

