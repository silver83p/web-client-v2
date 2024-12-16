export type LoginState = {
    isLoggedIn: boolean;
    error: string;
  };

  
  export type LoginAction =
    | { type: 'LOGIN' }
    | { type: 'LOGOUT' }
    | { type: 'SET_ERROR'; payload: string }
    | { type: 'SAVE_CREDENTIALS' }
    | { type: 'LOAD_CREDENTIALS' }
    | { type: 'SET_LOGGED_IN'; payload: boolean };
  
  export const initialState: LoginState = {
    isLoggedIn: false,
    error: '',
  };

  export function loginReducer(state: LoginState, action: LoginAction): LoginState {
    switch (action.type) {
      case 'SAVE_CREDENTIALS':
        return { ...state, ...action.payload };
      case 'LOGIN':
        return { ...state, isLoggedIn: true, error: '' };
      case 'LOGOUT':
        return { ...initialState };
      case 'SET_ERROR':
        return { ...state, error: action.payload };
      case 'SAVE_CREDENTIALS':
        
        return { ...state, isEditing: false };
      case 'LOAD_CREDENTIALS':
        const username = localStorage.getItem('username') || '';
        const password = localStorage.getItem('password') || '';
        return { ...state, username, password, isLoggedIn: !!username };
      case 'SET_LOGGED_IN':
        return { ...state, isLoggedIn: action.payload };
      default:
        return state;
    }
  }