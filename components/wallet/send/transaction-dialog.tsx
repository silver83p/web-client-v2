import { X, Loader2 } from 'lucide-react';

interface TransactionDialogProps {
  loading: boolean;
  message: string;
  open: boolean;
  onClose?: () => void;
}

export function TransactionDialog({
  loading,
  message,
  open,
  onClose,
}: TransactionDialogProps) {
  if (!open) return null;

  const getStatusStyles = () => {
    if (loading) return 'text-indigo-600 border-indigo-100';
    return message.includes('success')
      ? 'border-green-100 bg-green-50'
      : 'text-red-600 border-red-100 bg-red-50';
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-white/50" />
      <div
        className={`relative z-50 w-full rounded-lg bg-white p-6 shadow-lg mx-2 border ${getStatusStyles()}`}
      >
        <div className="flex flex-col">
          {loading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin text-indigo-600" />
              <span className="text-md font-small">{message}</span>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <span className="text-md font-small mb-4 text-center">
                {message}
              </span>
              <div className="flex justify-center">
                <button
                  onClick={onClose}
                  className="rounded-full p-1 hover:bg-indigo-200 transition-colors duration-200"
                >
                  <X className="h-4 w-4 text-gray-600 hover:text-blue-600" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}