import { Dispatch } from 'react';
import { AppAction } from '@/app/AppContext';
import { queryParameters } from '@/lib/utils';

export const networkParamsActions = {
  loadNetworkParams: (dispatch: Dispatch<AppAction>) => async () => {
    console.log("loadNetworkParams")
    const parameters = await queryParameters()
    console.log("parameters", parameters)
    if (parameters) {
      dispatch({ type: 'NETWORK_PARAMS', action: { type: 'SAVE_NETWORK_PARAMS', payload: parameters } });
    }
  }
};

