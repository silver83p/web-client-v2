'use client';

interface ImportKeyBoxProps {
  value: string;
  onChange: (value: string) => void;
  onScan: () => void;
}

export function ImportKeyBox({ value, onChange, onScan }: ImportKeyBoxProps) {
  return (
    <div className="relative">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-32 p-4 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-indigo-600"
        placeholder="Enter your seed phrase"
      />
      <button 
        className="absolute bottom-4 right-4 text-gray-400 hover:text-gray-600"
        onClick={onScan}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7V5a2 2 0 012-2h2M17 3h2a2 2 0 012 2v2M21 17v2a2 2 0 01-2 2h-2M7 21H5a2 2 0 01-2-2v-2" />
          <rect x="7" y="7" width="10" height="10" strokeWidth="2" />
        </svg>
      </button>
    </div>
  );
}