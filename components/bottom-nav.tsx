'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MessageCircle, Users, Wallet, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', label: 'Chats', icon: MessageCircle },
  { href: '/contacts', label: 'Contacts', icon: Users },
  { href: '/wallet', label: 'Wallet', icon: Wallet },
  { href: '/account', label: 'Account', icon: User },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <footer className="bg-white border-t">
      <nav className="flex justify-around py-2">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex flex-col items-center px-4 py-2',
              pathname === href ? 'text-indigo-600' : 'text-gray-500'
            )}
          >
            <Icon className="w-6 h-6" />
            <span className="text-xs mt-1">{label}</span>
          </Link>
        ))}
      </nav>
    </footer>
  );
}