'use client';

import { Input } from '@/components/ui/input';
import { ChevronRight } from 'lucide-react';

export function ProfileForm() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <span>Profile photo</span>
        <span className="text-indigo-600">Set up</span>
      </div>
      
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <label className="block text-sm mb-1">Name</label>
          <span>Daniel Ingamells</span>
        </div>
        
        <div className="flex justify-between items-center">
          <label className="block text-sm mb-1">Username</label>
          <span>Ingamells</span>
        </div>
        
        <div className="flex justify-between items-center">
          <label className="block text-sm mb-1">Mobile Number</label>
          <span>+44 7599441978</span>
        </div>
        
        <div className="flex justify-between items-center">
          <label className="block text-sm mb-1">Email</label>
          <span>dan@liberdus.com</span>
        </div>
      </div>

      <div className="flex justify-between items-center py-2">
        <span>Notifications</span>
        <ChevronRight className="w-5 h-5 text-gray-400" />
      </div>

      <div>
        <h3 className="font-medium mb-3">Toll</h3>
        <Input placeholder="Enter USD value" />
      </div>

      <button className="w-full bg-indigo-600 text-white rounded-lg py-3 mt-6">
        Sign Out
      </button>
    </div>
  );
}