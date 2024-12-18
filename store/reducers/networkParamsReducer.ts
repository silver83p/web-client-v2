export type NetworkParamsState = {
    parameters: any;
  };
  
  export type NetworkParamsAction =
    | { type: 'SAVE_NETWORK_PARAMS'; payload: any }
    | { type: 'CLEAR_PARAMS' };
  
  export const initialNetworkParamsState: NetworkParamsState = {
    parameters: {},
  };
  
  export function networkParamsReducer(state: NetworkParamsState, action: NetworkParamsAction): NetworkParamsState {
    switch (action.type) {
      case 'SAVE_NETWORK_PARAMS':
        return { ...state, parameters: action.payload };
      case 'CLEAR_PARAMS':
        return { ...state, parameters: {} };
      default:
        return state;
    }
  }