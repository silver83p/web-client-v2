import { useState, useCallback } from "react"

interface TransactionState {
  isLoading: boolean
  message: string
  showDialog: boolean
}

interface UseTransactionStatus {
  isLoading: boolean
  message: string
  showDialog: boolean
  handleTransaction: (
    fn1: () => Promise<{ success: boolean; result?: any; error?: any }>,
    fn2: () => Promise<{ success: boolean; result?: any; error?: any }>
  ) => Promise<void>
  closeDialog: () => void
}

const initialState: TransactionState = {
  isLoading: false,
  message: "",
  showDialog: false,
}

export function useTransactionStatus(): UseTransactionStatus {
  const [state, setState] = useState<TransactionState>(initialState)

  const closeDialog = useCallback(() => {
    setState(initialState)
  }, [])

  const handleTransaction = useCallback(
    async (
      fn1: () => Promise<{ success: boolean; result?: any; error?: any }>,
      fn2: () => Promise<{ success: boolean; result?: any; error?: any }>
    ) => {
      // Start transaction
      setState({
        isLoading: true,
        message: "Sending...",
        showDialog: true,
      })

      try {
        // Simulate transaction delay
        //   await new Promise((resolve) => setTimeout(resolve, 5000));

        const { success, result, error } = await fn1()
        if (!success) {
          setState({
            isLoading: false,
            message: `Transaction failed. Please try again., ${error}`,
            showDialog: true,
          })
          return
        }
        setState({
          isLoading: true,
          message: "Transaction is submitted. Waiting it to be processed.",
          showDialog: true,
        })

        const { success: success2, result: result2, error: error2 } = await fn2()
        if (!success2) {
          setState({
            isLoading: false,
            message: `Transaction failed. Please try again., ${error2}`,
            showDialog: true,
          })
          return
        }

        // Update state on success
        setState({
          isLoading: false,
          message: "Transaction is successful!",
          showDialog: true,
        })
      } catch (error) {
        // Handle error state if needed
        setState({
          isLoading: false,
          message: "Transaction failed. Please try again.",
          showDialog: true,
        })
      }
    },
    []
  )

  return {
    ...state,
    handleTransaction,
    closeDialog,
  }
}
