import { X } from "lucide-react"
import { Loader2 } from "lucide-react"

interface TransactionDialogProps {
  loading: boolean
  message: string
  open: boolean
  onClose?: () => void
}

export function TransactionDialog({ loading, message, open, onClose }: TransactionDialogProps) {
  if (!open) return null

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-white/50" />
      <div className="relative z-50 w-[90%] max-w-md rounded-lg bg-white p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin text-indigo-600" />
            ) : (
              <div className={`h-5 w-5 rounded-full ${message.includes('success') ? 'bg-green-500' : 'bg-red-500'}`} />
            )}
            <span className="text-lg font-medium">{message}</span>
          </div>
          {!loading && (
            <button onClick={onClose} className="rounded-full p-1 hover:bg-gray-100">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
