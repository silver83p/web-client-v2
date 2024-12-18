'use client'

import { WalletTabs } from '@/components/wallet/wallet-tabs'
import { TokenBalance } from '@/components/wallet/token-balance'
import { WalletActions } from '@/components/wallet/wallet-actions'
import { Avatar } from '@/components/ui/avatar'
import { BottomNav } from '@/components/bottom-nav'
import { useApp } from '@/app/AppContext'

export default function WalletPage() {
  const { state } = useApp();
  return (
    <>
      <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden scrollbar-thin">
        <div className="pb-20">
          <header className="p-4">
            <h1 className="text-xl font-semibold mb-6">Wallet</h1>
            <div className="flex flex-col items-center">
              <Avatar className="w-20 h-20 mb-4">
                <img
                  src="https://source.unsplash.com/random/200x200?suit"
                  alt="Profile"
                  className="object-cover"
                />
              </Avatar>
              <h2 className="text-xl font-semibold">{state.auth.username}</h2>
              <p className="text-gray-500">{state.auth.username}</p>
              <button className="mt-4 text-gray-600 bg-gray-100 px-8 py-2 rounded-lg">Copy</button>
            </div>
          </header>

          <div className="px-4">
            <WalletTabs />
            <TokenBalance symbol="LIB" amount={state.auth.accountData?.data?.balance?.toString()} usdValue="15.88" percentageChange="1.59" />
            <WalletActions />
          </div>
        </div>
      </div>
      <BottomNav />
    </>
  )
}
