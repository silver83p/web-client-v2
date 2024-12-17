import { WalletEntry } from "@/lib/utils";

export type AuthState = {
    isLoggedIn: boolean;
    username: string;
    walletEntry: WalletEntry;
  };
  
  export type AuthAction =
    | { type: 'LOGIN' }
    | { type: 'LOGOUT' }
    | { type: 'SAVE_CREDENTIALS'; payload: { username: string; walletEntry: WalletEntry } }
  
  export const initialAuthState: AuthState = {
    isLoggedIn: false,
    username: '',
    walletEntry: {} as WalletEntry,
  };
  
  export function authReducer(state: AuthState, action: AuthAction): AuthState {
    switch (action.type) {
        case 'SAVE_CREDENTIALS':
            return { ...state, ...action.payload }
          case 'LOGIN':
            return { ...state, isLoggedIn: true };
          case 'LOGOUT':
            return { ...initialAuthState };
          default:
            return state;
        }
    }
  
  