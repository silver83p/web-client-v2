'use client';

import { useRouter } from 'next/navigation';

export function WalletActions() {
  const router = useRouter();
  return (
    <div className="grid grid-cols-2 gap-4 mt-6">
      <button className="bg-indigo-600 text-white rounded-lg py-3 px-4"
        onClick={() => router.push('/wallet/send')}
      >
        Send
      </button>
      <button className="bg-gray-100 text-gray-900 rounded-lg py-3 px-4">
        Stake
      </button>
      <button className="col-span-2 border-2 border-gray-200 rounded-lg py-3 px-4">
        Receive
      </button>
      <button className="col-span-2 bg-indigo-600 text-white rounded-lg py-3 px-4">
        Buy
      </button>
    </div>
  );
}