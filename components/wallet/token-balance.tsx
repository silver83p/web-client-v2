'use client';

interface TokenBalanceProps {
  symbol: string;
  amount: string;
  usdValue: string;
  percentageChange: string;
}

export function TokenBalance({ symbol, amount, usdValue, percentageChange }: TokenBalanceProps) {
  const isPositive = !percentageChange.startsWith('-');
  
  return (
    <div className="mt-6">
      <h2 className="text-xl font-semibold mb-2">Balance</h2>
      <div className="flex items-baseline justify-between mb-1">
        <div className="flex items-center gap-2">
          <span className="font-medium">{symbol}</span>
          <span className={`text-sm ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
            {percentageChange}%
          </span>
        </div>
        <span className="text-xl font-semibold">{usdValue} USD</span>
      </div>
      <div className="text-gray-600">{amount} {symbol}</div>
    </div>
  );
}