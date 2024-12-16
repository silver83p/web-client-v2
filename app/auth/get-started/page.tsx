import { Flame } from 'lucide-react';
import Link from 'next/link';

export default function GetStartedPage() {
  return (
    <div className="min-h-screen flex flex-col items-center px-4 pt-20">
      {/* <div className="w-24 h-24 rounded-full bg-orange-500 flex items-center justify-center mb-8">
        <Flame className="w-12 h-12 text-white" />
      </div> */}

      <img src="/icon-512x512.png" className="w-24 h-24 rounded-full mb-8" alt="Liberdus logo" />

      
      <h1 className="text-2xl font-semibold mb-12">Get Started</h1>
      
      <div className="w-full max-w-sm space-y-4">
        <Link 
          href="/auth/username"
          className="w-full bg-indigo-600 text-white rounded-lg py-3 px-4 text-center block"
        >
          Create account
        </Link>
        
        <Link
          href="/auth/import"
          className="w-full bg-gray-100 text-gray-900 rounded-lg py-3 px-4 text-center block"
        >
          I have an account
        </Link>
      </div>

      <p className="absolute bottom-4 left-2 right-2 text-sm text-gray-500 text-center mt-auto mb-6 ">
        By using this service, you agree to our{' '}
        <Link href="/terms" className="text-indigo-600">Terms of Service</Link>
        {' '}and{' '}
        <Link href="/privacy" className="text-indigo-600">Privacy Policy</Link>
      </p>
    </div>
  );
}