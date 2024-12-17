import { Dispatch } from 'react';
import { AppAction } from '@/app/AppContext';

export const messageActions = {
  addMessage: (dispatch: Dispatch<AppAction>) => (message: string) => {
    dispatch({ type: 'MESSAGE', action: { type: 'ADD_MESSAGE', payload: message } });
  },
  clearMessages: (dispatch: Dispatch<AppAction>) => () => {
    dispatch({ type: 'MESSAGE', action: { type: 'CLEAR_MESSAGES' } });
  },
};

