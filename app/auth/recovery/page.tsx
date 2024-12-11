'use client';

import { Flame } from 'lucide-react';
import { useRouter } from 'next/navigation';

const RECOVERY_PHRASE = [
  'hefty festival lordship galaxy',
  'album enhanced powder segments',
  'nearby paradise thwart tarnished powder'
];

export default function RecoveryPage() {
  const router = useRouter();

  const handleContinue = () => {
    // Store authentication in localStorage instead of cookies
    localStorage.setItem('authenticated', 'true');
    router.push('/');
  };

  return (
    <div className="min-h-screen flex flex-col items-center px-4 pt-12">
      <button 
        onClick={() => router.back()}
        className="self-start p-2 -ml-2"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <h1 className="text-xl font-semibold mb-8">Account Created</h1>

      {/* <div className="w-24 h-24 rounded-full bg-orange-500 flex items-center justify-center mb-8">
        <Flame className="w-12 h-12 text-white" />
      </div> */}

      <img src="/icon-512x512.png" className="w-24 h-24 rounded-full flex items-center justify-center mb-8" alt="Liberdus logo" />


      

      <p className="text-gray-600 mb-6 text-center max-w-xs">
        Use your recovery password to access your account on new devices. Keep it safe and secure, as your account cannot be recovered without it. Do not share it with anyone.
      </p>

      <div className="w-full max-w-sm bg-gray-50 rounded-lg p-4 mb-6">
        {RECOVERY_PHRASE.map((phrase, index) => (
          <p key={index} className="text-center text-gray-800 my-1">
            {phrase}
          </p>
        ))}
      </div>

      <div className="w-full max-w-sm grid grid-cols-2 gap-4">
        <button
          onClick={handleContinue}
          className="bg-indigo-600 text-white rounded-lg py-3 px-4"
        >
          Continue
        </button>
        <button
          onClick={() => navigator.clipboard.writeText(RECOVERY_PHRASE.join(' '))}
          className="bg-gray-100 text-gray-900 rounded-lg py-3 px-4"
        >
          Copy
        </button>
      </div>

      <p className="text-sm text-gray-500 text-center mt-auto mb-6">
        By using this service, you agree to our Terms of Service and Privacy Policy
      </p>
    </div>
  );
}