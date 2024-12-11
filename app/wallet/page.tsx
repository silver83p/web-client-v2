import { WalletTabs } from '@/components/wallet/wallet-tabs';
import { TokenBalance } from '@/components/wallet/token-balance';
import { WalletActions } from '@/components/wallet/wallet-actions';
import { Avatar } from '@/components/ui/avatar';

export default function WalletPage() {
  return (
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
          <h2 className="text-xl font-semibold">Ingamells</h2>
          <p className="text-gray-500">@ingamells</p>
          <button className="mt-4 text-gray-600 bg-gray-100 px-8 py-2 rounded-lg">
            Copy
          </button>
        </div>
      </header>

      <div className="px-4">
        <WalletTabs />
        <TokenBalance 
          symbol="LIB"
          amount="87.041"
          usdValue="15.88"
          percentageChange="1.59"
        />
        <WalletActions />
      </div>
    </div>
  );
}