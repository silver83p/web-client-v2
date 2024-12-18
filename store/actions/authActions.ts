import { Dispatch } from "react"
import { AppAction } from "@/app/AppContext"
import { getAccountData, WalletEntry } from "@/lib/utils"
import { networkParamsActions } from "./networkParamsActions"

export const authActions = {
  login: (dispatch: Dispatch<AppAction>) => async (address: string) => {
    dispatch({ type: "AUTH", action: { type: "LOGIN" } })
    const data: any = await getAccountData(address)
    if (data && data.account) dispatch({ type: "AUTH", action: { type: "SAVE_ACCOUNT_DATA", payload: data.account } })
    networkParamsActions.loadNetworkParams(dispatch)()
  },
  logout: (dispatch: Dispatch<AppAction>) => () => {
    dispatch({ type: "AUTH", action: { type: "LOGOUT" } })
  },
  saveCredentials: (dispatch: Dispatch<AppAction>) => (username: string, walletEntry: WalletEntry) => {
    dispatch({ type: "AUTH", action: { type: "SAVE_CREDENTIALS", payload: { username, walletEntry } } })
  },
  loadAccountData: (dispatch: Dispatch<AppAction>) => async (address: string) => {
    const data: any = await getAccountData(address)
    console.log("data", data)
    if (data && data.account) dispatch({ type: "AUTH", action: { type: "SAVE_ACCOUNT_DATA", payload: data.account } })
  },
}
