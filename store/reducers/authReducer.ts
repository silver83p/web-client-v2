import { WalletEntry } from "@/lib/utils";

export type AuthState = {
    isLoggedIn: boolean;
    username: string;
    walletEntry: WalletEntry;
    accountData: any
  };
  
  export type AuthAction =
    | { type: 'LOGIN' }
    | { type: 'LOGOUT' }
    | { type: 'SAVE_CREDENTIALS'; payload: { username: string; walletEntry: WalletEntry } }
    | { type: 'SAVE_ACCOUNT_DATA'; payload: any };
  
  export const initialAuthState: AuthState = {
    isLoggedIn: false,
    username: '',
    walletEntry: {} as WalletEntry,
    accountData: {}
  };
  
  export function authReducer(state: AuthState, action: AuthAction): AuthState {
    switch (action.type) {
        case 'SAVE_CREDENTIALS':
            return { ...state, ...action.payload }
          case 'LOGIN':
            return { ...state, isLoggedIn: true };
          case 'LOGOUT':
            return { ...initialAuthState };
          case 'SAVE_ACCOUNT_DATA':
            console.log("action.payload", action.payload, state)
            return { ...state, accountData: action.payload };
          default:
            return state;
        }
    }
  