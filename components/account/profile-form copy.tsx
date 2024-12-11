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
        <div>
          <label className="block text-sm mb-1">Name</label>
          <Input value="Daniel Ingamells" readOnly />
        </div>
        
        <div>
          <label className="block text-sm mb-1">Username</label>
          <Input value="Ingamells" readOnly />
        </div>
        
        <div>
          <label className="block text-sm mb-1">Mobile Number</label>
          <Input value="+44 7599441978" readOnly />
        </div>
        
        <div>
          <label className="block text-sm mb-1">Email</label>
          <Input value="dan@liberdus.com" readOnly />
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