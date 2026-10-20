import { useSearchParams } from 'react-router-dom';
import { PageContainer } from '../../../components/shared/page-container';
import { UsersTab } from './users-tab';
import { RolesTab } from './roles-tab';
import { SessionsTab } from './sessions-tab';
import { ModulesTab } from './modules-tab';
import { SmtpTab } from './smtp-tab';
import { StorageTab } from './storage-tab';
import { Users, Shield, KeyRound, SlidersHorizontal, Mail, HardDrive } from 'lucide-react';
import { cn } from '../../../lib/utils';

type RbacTab = 'users' | 'roles' | 'sessions' | 'smtp' | 'storage' | 'modules';

interface TabItem {
  id: RbacTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const tabs: TabItem[] = [
  { id: 'users', label: 'Users & Access', icon: Users },
  { id: 'roles', label: 'Roles & Permissions', icon: Shield },
  { id: 'sessions', label: 'Active Sessions & Security', icon: KeyRound },
  { id: 'smtp', label: 'Email & SMTP', icon: Mail },
  { id: 'storage', label: 'Storage & Media', icon: HardDrive },
  { id: 'modules', label: 'Feature Modules (SMB Config)', icon: SlidersHorizontal },
];

export function RbacHubPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = (searchParams.get('tab') as RbacTab) || 'users';

  const handleTabChange = (tabId: RbacTab) => {
    setSearchParams({ tab: tabId });
  };

  return (
    <PageContainer
      title="System Settings & Security Governance"
      description="User credentials, role privilege sets, session monitoring, and Sri Lanka SMB modular feature toggles."
    >
      {/* Navigation Tab Bar */}
      <div className="flex items-center gap-1.5 flex-wrap border-b border-[#e6e6e6] pb-0 mb-6">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={cn(
                'inline-flex items-center gap-2 rounded-none px-3.5 py-2 text-sm font-medium whitespace-nowrap transition-colors cursor-pointer select-none',
                isActive
                  ? 'bg-[#1c69d4]/10 text-[#1c69d4] font-bold border-b-2 border-[#1c69d4] rounded-none'
                  : 'bg-transparent text-[#6b6b6b] hover:bg-[#f7f7f7] hover:text-[#262626] border-b-2 border-transparent font-normal rounded-none',
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div>
        {currentTab === 'users' && <UsersTab />}
        {currentTab === 'roles' && <RolesTab />}
        {currentTab === 'sessions' && <SessionsTab />}
        {currentTab === 'smtp' && <SmtpTab />}
        {currentTab === 'storage' && <StorageTab />}
        {currentTab === 'modules' && <ModulesTab />}
      </div>
    </PageContainer>
  );
}
