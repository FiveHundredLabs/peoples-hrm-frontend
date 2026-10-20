import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  Users,
  Clock,
  CalendarDays,
  Coins,
  Banknote,
  Receipt,
  GitCommit,
  Settings,
  Activity,
  UserX,
  BarChart3,
  UserPlus,
  Target,
  GraduationCap,
  Package,
  Scale,
  BookOpen,
  LifeBuoy,
  ShieldCheck,
  Server,
  Compass,
} from 'lucide-react';
import { useUiStore } from '../../stores/ui-store';
import { useModuleStore } from '../../stores/module-store';
import { cn } from '../../lib/utils';

interface NavItem {
  id?: string;
  title: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  isSystem?: boolean;
}

const allNavItems: NavItem[] = [
  { id: 'dashboard', title: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, isSystem: true },
  { id: 'organization', title: 'Organization', path: '/organization', icon: Building2 },
  { id: 'employees', title: 'Employees', path: '/employees', icon: Users },
  { id: 'lifecycle', title: 'Career & Lifecycle', path: '/lifecycle', icon: GitCommit },
  { id: 'attendance', title: 'Attendance', path: '/attendance', icon: Clock },
  { id: 'leave', title: 'Leave Management', path: '/leave', icon: CalendarDays },
  { id: 'compensation', title: 'Compensation', path: '/compensation', icon: Coins },
  { id: 'payroll', title: 'Payroll & Statutory', path: '/payroll', icon: Banknote },
  { id: 'expenses', title: 'Expenses & Loans', path: '/expenses', icon: Receipt },
  { id: 'settlements', title: 'Final Settlement', path: '/settlements', icon: UserX },
  { id: 'recruitment', title: 'Recruitment & ATS', path: '/recruitment', icon: UserPlus },
  { id: 'performance', title: 'Performance & Goals', path: '/performance', icon: Target },
  { id: 'learning', title: 'Learning & Training', path: '/learning', icon: GraduationCap },
  { id: 'assets', title: 'Asset Management', path: '/assets', icon: Package },
  { id: 'relations', title: 'HR Relations & Cases', path: '/relations', icon: Scale },
  { id: 'policies', title: 'Policies & Governance', path: '/policies', icon: BookOpen },
  { id: 'helpdesk', title: 'Employee Helpdesk', path: '/helpdesk', icon: LifeBuoy },
  { id: 'privacy', title: 'Privacy & Data Governance', path: '/privacy', icon: ShieldCheck },
  { id: 'operations', title: 'Operations & Telemetry', path: '/operations', icon: Server },
  { id: 'reports', title: 'Reports & Analytics', path: '/reports', icon: BarChart3 },
  { id: 'health', title: 'System Health', path: '/health', icon: Activity, isSystem: true },
  { id: 'settings', title: 'Settings', path: '/settings', icon: Settings, isSystem: true },
];

export function Sidebar() {
  const { sidebarOpen } = useUiStore();
  const { isModuleEnabled } = useModuleStore();

  // Filter navigation items dynamically based on module store
  const visibleNavItems = allNavItems.filter((item) => {
    if (item.isSystem) return true;
    if (!item.id) return true;
    return isModuleEnabled(item.id);
  });

  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-40 flex h-full flex-col border-r border-[#262e38] bg-[#1a2129] text-[#ffffff] md:static md:h-full md:shrink-0 overflow-hidden scrollbar-sidebar rounded-none',
        sidebarOpen ? 'w-64 translate-x-0' : '-translate-x-full md:w-20 md:translate-x-0',
      )}
    >
      {/* Sidebar Header */}
      <div className="flex h-16 shrink-0 items-center px-5 border-b border-[#262e38] bg-[#1a2129] z-10">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-none bg-[#1c69d4] text-white font-bold text-xs shadow-none">
            <Compass className="h-4 w-4" />
          </div>
          {sidebarOpen && (
            <div className="flex flex-col">
              <span className="font-bold text-base text-white leading-none tracking-tight">
                Sri Lanka <span className="text-[#1c69d4] font-bold text-xs ml-0.5">HRMS</span>
              </span>
              <span className="text-[11px] text-[#8c9ba8] mt-1 font-normal">SMB Edition</span>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-0.5 p-2 overflow-y-auto scrollbar-sidebar">
        {visibleNavItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-none py-2.5 px-3 text-sm select-none transition-colors duration-150 border-l-[3px]',
                  isActive
                    ? 'bg-[#1c69d4]/15 text-white font-bold border-[#1c69d4]'
                    : 'text-[#9ca3af] hover:bg-[#262e38]/60 hover:text-white font-normal border-transparent',
                  !sidebarOpen && 'md:justify-center md:px-0',
                )
              }
              title={!sidebarOpen ? item.title : undefined}
            >
              {({ isActive }) => (
                <>
                  <Icon className={cn('h-4 w-4 shrink-0 transition-colors', isActive ? 'text-[#1c69d4]' : 'text-[#9ca3af]')} />
                  {sidebarOpen && <span>{item.title}</span>}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}
