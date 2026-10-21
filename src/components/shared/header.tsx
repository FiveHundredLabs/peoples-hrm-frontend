import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Menu,
  Bell,
  ChevronRight,
  LogOut,
  Shield,
  Activity,
  Key,
  ChevronDown,
} from 'lucide-react';
import { useUiStore } from '../../stores/ui-store';
import { useAuthStore } from '../../stores/auth-store';
import { useLogout } from '../../features/auth/data/auth-data';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Button } from '../ui/button';

interface RouteInfo {
  title: string;
  category?: string;
  parentPath?: string;
  parentTitle?: string;
}

const ROUTE_CONFIG: Record<string, RouteInfo> = {
  '/dashboard': { title: 'Dashboard' },
  '/organization': { title: 'Organization Structure', category: 'Core HR' },
  '/employees': { title: 'Employees & Personnel', category: 'Core HR' },
  '/lifecycle': { title: 'Career & Lifecycle', category: 'Core HR' },
  '/attendance': { title: 'Time & Attendance', category: 'Workforce' },
  '/leave': { title: 'Leave Management', category: 'Workforce' },
  '/compensation': { title: 'Compensation & Benefits', category: 'Payroll' },
  '/payroll': { title: 'Payroll & Statutory', category: 'Payroll' },
  '/expenses': { title: 'Expenses & Loans', category: 'Payroll' },
  '/loans': { title: 'Staff Loans', category: 'Payroll' },
  '/settlements': { title: 'Final Settlement & Gratuity', category: 'Payroll' },
  '/recruitment': { title: 'Recruitment & ATS', category: 'Talent' },
  '/performance': { title: 'Performance & Goals', category: 'Talent' },
  '/learning': { title: 'Learning & Training', category: 'Talent' },
  '/assets': { title: 'Asset Management', category: 'Operations' },
  '/relations': { title: 'HR Relations & Cases', category: 'Governance' },
  '/policies': { title: 'Policies & Governance', category: 'Governance' },
  '/helpdesk': { title: 'Employee Helpdesk', category: 'Support' },
  '/privacy': { title: 'Privacy & Data Governance', category: 'Compliance' },
  '/operations': { title: 'Operations & Telemetry', category: 'System' },
  '/reports': { title: 'Reports & Analytics', category: 'Analytics' },
  '/health': { title: 'System Health', category: 'System' },
  '/settings': { title: 'Settings & RBAC', category: 'System' },
};

function getRouteInfo(pathname: string): { title: string; category?: string; crumbs: { label: string; path?: string }[] } {
  if (ROUTE_CONFIG[pathname]) {
    const info = ROUTE_CONFIG[pathname];
    const crumbs: { label: string; path?: string }[] = [{ label: 'Home', path: '/dashboard' }];
    if (info.category) {
      crumbs.push({ label: info.category });
    }
    return { title: info.title, category: info.category, crumbs };
  }

  for (const [key, info] of Object.entries(ROUTE_CONFIG)) {
    if (pathname.startsWith(key) && key !== '/dashboard') {
      const crumbs: { label: string; path?: string }[] = [{ label: 'Home', path: '/dashboard' }];
      if (info.category) {
        crumbs.push({ label: info.category });
      }
      crumbs.push({ label: info.title, path: key });

      if (pathname.startsWith('/employees/') && pathname !== '/employees') {
        return {
          title: 'Employee Details',
          category: info.category,
          crumbs,
        };
      }

      return { title: info.title, category: info.category, crumbs };
    }
  }

  return {
    title: 'Workspace',
    crumbs: [{ label: 'Home', path: '/dashboard' }],
  };
}

export function Header() {
  const navigate = useNavigate();
  const { toggleSidebar } = useUiStore();
  const { user, roles } = useAuthStore();
  const logoutMutation = useLogout();
  const location = useLocation();

  const { title, crumbs } = getRouteInfo(location.pathname);

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
    navigate('/login');
  };

  const displayName = user?.username || user?.email?.split('@')[0] || 'HR Administrator';
  const displayRole = roles[0] || 'System Administrator';
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 w-full items-center justify-between border-b border-[#e6e6e6] bg-white px-4 md:px-6 rounded-none">
      {/* Left: Sidebar Toggle + Breadcrumbs + Page Title */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={toggleSidebar}
          aria-label="Toggle navigation sidebar"
          className="rounded-none p-2 text-[#262626] hover:bg-[#f7f7f7] cursor-pointer transition-colors shrink-0"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Breadcrumb Navigation & Title in Header */}
        <div className="flex items-center gap-2 pl-3 border-l border-[#e6e6e6] min-w-0">
          <nav aria-label="Breadcrumb" className="hidden sm:flex items-center gap-1.5 text-xs text-[#6b6b6b] font-normal shrink-0">
            {crumbs.map((crumb, idx) => (
              <span key={idx} className="flex items-center gap-1.5">
                {crumb.path ? (
                  <Link to={crumb.path} className="hover:text-[#262626] transition-colors">
                    {crumb.label}
                  </Link>
                ) : (
                  <span>{crumb.label}</span>
                )}
                <ChevronRight className="h-3.5 w-3.5 text-[#9a9a9a]" />
              </span>
            ))}
          </nav>
          <h1 className="text-base sm:text-lg font-bold text-[#262626] tracking-tight leading-none truncate">
            {title}
          </h1>
        </div>
      </div>

      {/* Right: Notifications & Interactive User Profile Dropdown */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <span className="text-xs text-[#6b6b6b]">Demo data</span>
        {/* Notifications */}
        <button
          aria-label="Notifications"
          className="rounded-none p-2 text-[#262626] hover:bg-[#f7f7f7] cursor-pointer transition-colors"
        >
          <Bell className="h-5 w-5" />
        </button>

        {/* User Profile Dropdown Popover */}
        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="flex items-center gap-2.5 pl-2.5 py-1.5 pr-2 border-l border-[#e6e6e6] hover:bg-[#f7f7f7] transition-colors cursor-pointer select-none rounded-none text-left"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-none bg-[#1c69d4] text-white font-bold text-xs tracking-wider">
                {initials}
              </div>
              <div className="hidden lg:block text-left">
                <p className="text-sm font-bold text-[#262626] leading-none">
                  {displayName}
                </p>
                <p className="text-[11px] text-[#6b6b6b] mt-0.5 font-light">
                  {displayRole}
                </p>
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-[#6b6b6b] opacity-60 ml-0.5" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-72 p-0 rounded-none border border-[#cccccc] bg-white shadow-lg z-50" align="end">
            {/* Popover Header Card */}
            <div className="p-4 bg-[#f7f7f7] border-b border-[#e6e6e6]">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-none bg-[#1c69d4] text-white font-bold text-sm">
                  {initials}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-[#262626] truncate leading-tight">
                    {displayName}
                  </p>
                  <p className="text-xs text-[#6b6b6b] truncate mt-0.5 font-light">
                    {user?.email || 'admin@ceylonholdings.lk'}
                  </p>
                  <span className="inline-block mt-1.5 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.5px] bg-blue-100 text-[#1c69d4]">
                    {displayRole}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Links Menu */}
            <div className="p-2 space-y-0.5 text-xs font-medium text-[#262626]">
              <Link
                to="/settings"
                className="flex items-center gap-2.5 px-3 py-2 hover:bg-[#f7f7f7] transition-colors rounded-none"
              >
                <Key className="h-4 w-4 text-[#6b6b6b]" />
                <span>User Credentials & RBAC</span>
              </Link>
              <Link
                to="/health"
                className="flex items-center gap-2.5 px-3 py-2 hover:bg-[#f7f7f7] transition-colors rounded-none"
              >
                <Activity className="h-4 w-4 text-[#6b6b6b]" />
                <span>System Health & Telemetry</span>
              </Link>
              <Link
                to="/operations"
                className="flex items-center gap-2.5 px-3 py-2 hover:bg-[#f7f7f7] transition-colors rounded-none"
              >
                <Shield className="h-4 w-4 text-[#6b6b6b]" />
                <span>Security & Event Hardening</span>
              </Link>
            </div>

            {/* Sign Out Action */}
            <div className="p-2 border-t border-[#e6e6e6] bg-white">
              <Button
                type="button"
                variant="ghost"
                onClick={handleLogout}
                disabled={logoutMutation.isPending}
                className="w-full justify-start h-9 px-3 text-xs font-bold text-[#dc2626] hover:bg-red-50 hover:text-[#b91c1c] rounded-none gap-2 cursor-pointer"
              >
                <LogOut className="h-4 w-4 text-[#dc2626]" />
                <span>{logoutMutation.isPending ? 'Signing Out...' : 'Sign Out of Workspace'}</span>
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </header>
  );
}
