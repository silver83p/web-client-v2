import { AccountTabs } from '@/components/account/account-tabs';
import { ProfileForm } from '@/components/account/profile-form';

export default function AccountPage() {
  return (
    <div className="pb-20">
      <header className="p-4">
        <h1 className="text-xl font-semibold">Settings</h1>
      </header>

      <div className="px-4">
        <AccountTabs />
        <ProfileForm />
      </div>
    </div>
  );
}