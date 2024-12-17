import { Dispatch } from "react"
import { AppAction } from "@/app/AppContext"
import { getAccountData, WalletEntry } from "@/lib/utils"

export const authActions = {
  login: (dispatch: Dispatch<AppAction>) => async (address: string) => {
    dispatch({ type: "AUTH", action: { type: "LOGIN" } })
    const data = await fetchAccountData(address) // Pass username to the fetch function
    dispatch({ type: "AUTH", action: { type: "SAVE_ACCOUNT_DATA", payload: data } })
  },
  logout: (dispatch: Dispatch<AppAction>) => () => {
    dispatch({ type: "AUTH", action: { type: "LOGOUT" } })
  },
  saveCredentials: (dispatch: Dispatch<AppAction>) => (username: string, walletEntry: WalletEntry) => {
    dispatch({ type: "AUTH", action: { type: "SAVE_CREDENTIALS", payload: { username, walletEntry } } })
  },
  loadAccountData: (dispatch: Dispatch<AppAction>) => async (address: string) => {
    const data = await fetchAccountData(address) // Pass username to the fetch function
    dispatch({ type: "AUTH", action: { type: "SAVE_ACCOUNT_DATA", payload: data } })
  },
}

export const fetchAccountData = async (username: string) => {
  try {
    const accountData = await getAccountData(username)
    console.log(`fetchAccountData`, username,accountData)
    return accountData.account
  } catch (error) {
    console.log(error)
  }
}
