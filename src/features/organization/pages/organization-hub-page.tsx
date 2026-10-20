import { useSearchParams } from 'react-router-dom';
import { PageContainer } from '../../../components/shared/page-container';
import { LegalEntitiesTab } from './legal-entities-tab';
import { BranchesTab } from './branches-tab';
import { DepartmentsTab } from './departments-tab';
import { PositionsTab } from './positions-tab';
import { WorkLocationsTab } from './work-locations-tab';
import { HolidaysTab } from './holidays-tab';
import { Building2, MapPin, Layers, Briefcase, Navigation, CalendarDays } from 'lucide-react';
import { cn } from '../../../lib/utils';

type OrgTab = 'legal-entities' | 'branches' | 'departments' | 'positions' | 'work-locations' | 'holidays';

interface TabItem {
  id: OrgTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const tabs: TabItem[] = [
  { id: 'legal-entities', label: 'Legal Entities', icon: Building2 },
  { id: 'branches', label: 'Branches', icon: MapPin },
  { id: 'departments', label: 'Departments & Teams', icon: Layers },
  { id: 'positions', label: 'Positions & Roles', icon: Briefcase },
  { id: 'work-locations', label: 'Work Locations', icon: Navigation },
  { id: 'holidays', label: 'Statutory Holidays', icon: CalendarDays },
];

export function OrganizationHubPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = (searchParams.get('tab') as OrgTab) || 'legal-entities';

  const handleTabChange = (tabId: OrgTab) => {
    setSearchParams({ tab: tabId });
  };

  return (
    <PageContainer
      title="Organization & Governance"
      description="Legal entities, branch network, department hierarchy, and job positions."
    >
      {/* Navigation Tab Bar */}
      <div className="flex items-center gap-2 overflow-x-auto border-b border-[#e6e6e6] pb-0 mb-6 scrollbar-none">
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
        {currentTab === 'legal-entities' && <LegalEntitiesTab />}
        {currentTab === 'branches' && <BranchesTab />}
        {currentTab === 'departments' && <DepartmentsTab />}
        {currentTab === 'positions' && <PositionsTab />}
        {currentTab === 'work-locations' && <WorkLocationsTab />}
        {currentTab === 'holidays' && <HolidaysTab />}
      </div>
    </PageContainer>
  );
}
