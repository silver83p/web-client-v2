export type MessageState = {
  messages: string[];
};

export type MessageAction =
  | { type: 'ADD_MESSAGE'; payload: string }
  | { type: 'CLEAR_MESSAGES' };

export const initialMessageState: MessageState = {
  messages: [],
};

export function messageReducer(state: MessageState, action: MessageAction): MessageState {
  switch (action.type) {
    case 'ADD_MESSAGE':
      return { ...state, messages: [...state.messages, action.payload] };
    case 'CLEAR_MESSAGES':
      return { ...state, messages: [] };
    default:
      return state;
  }
}
