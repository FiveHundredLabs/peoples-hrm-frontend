import { Link } from 'react-router-dom';
import {
  Building2,
  Users,
  Clock,
  CalendarDays,
  Banknote,
  Receipt,
  Activity,
  ArrowRight,
  ShieldCheck,
  Briefcase,
} from 'lucide-react';
import { PageContainer } from '../../../components/shared/page-container';
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { useHealthCheck } from '../../health/data/health-data';

interface ModuleCardProps {
  title: string;
  description: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  tag: string;
  sliceWorkflow: string;
}

const moduleList: ModuleCardProps[] = [
  {
    title: 'Organization Management',
    description: 'Legal entities, branches, departments, teams, job positions, and work locations.',
    path: '/organization',
    icon: Building2,
    tag: 'Foundation',
    sliceWorkflow: '/feature organization-management',
  },
  {
    title: 'Employee Master',
    description: 'Employee profiles, personal details, identity records, emergency contacts, and bank accounts.',
    path: '/employees',
    icon: Users,
    tag: 'Core HR',
    sliceWorkflow: '/feature employee-master',
  },
  {
    title: 'Hikvision Attendance',
    description: 'Biometric device synchronization, raw punch events, shifts, rosters, and overtime calculations.',
    path: '/attendance',
    icon: Clock,
    tag: 'Time & Attendance',
    sliceWorkflow: '/hikvision-attendance',
  },
  {
    title: 'Leave Management',
    description: 'Leave policy rules, leave entitlement balances, request submission, and multi-tier approvals.',
    path: '/leave',
    icon: CalendarDays,
    tag: 'Time Off',
    sliceWorkflow: '/feature leave-management',
  },
  {
    title: 'Sri Lanka Payroll & Statutory',
    description: 'EPF (8%/12%), ETF (3%), APIT tax brackets, gratuity calculations, payslips, and bank batches.',
    path: '/payroll',
    icon: Banknote,
    tag: 'Statutory',
    sliceWorkflow: '/payroll-change',
  },
  {
    title: 'Expenses & Loans',
    description: 'Staff claims, expense receipts, advance requests, salary loan ledger, and installment deductions.',
    path: '/expenses',
    icon: Receipt,
    tag: 'Finance',
    sliceWorkflow: '/feature expenses-and-loans',
  },
];

export function DashboardPage() {
  const { data: health, isSuccess, isLoading } = useHealthCheck();

  return (
    <PageContainer
      title="Sri Lanka HRMS Dashboard"
      description="Overview of workforce metrics, attendance telemetry, and payroll readiness."
      actions={
        <Link to="/health">
          <Button variant="outline" size="sm" className="inline-flex items-center gap-2">
            <Activity className="h-4 w-4" />
            <span>Infrastructure Status</span>
          </Button>
        </Link>
      }
    >
      {/* Welcome Banner */}
      <div className="rounded-none bg-canvas-soft p-6 sm:p-8 border border-hairline relative overflow-hidden mb-8">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-none bg-canvas px-3 py-1 text-xs font-semibold text-primary mb-3 border border-hairline">
            <ShieldCheck className="h-4 w-4" />
            <span>Sri Lanka Labor Law & Statutory Architecture</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-ink tracking-tight">
            Monorepo Foundation Ready
          </h2>
          <p className="mt-2 text-sm sm:text-base text-body">
            The React/Vite/Tailwind v4 frontend and NestJS/TypeORM backend foundation is active.
            Features are implemented in vertical slices adhering to <code>schema.dbml</code> and <code>DESIGN.md</code>.
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-ink bg-canvas px-3 py-1.5 rounded-none border border-hairline">
              <span className={`h-2 w-2 rounded-none ${isLoading ? 'bg-amber-500' : isSuccess ? 'bg-emerald-500' : 'bg-rose-500'}`} />
              <span>Backend API: {isLoading ? 'Checking...' : isSuccess ? `Online (${health?.service})` : 'Offline'}</span>
            </div>
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-ink bg-canvas px-3 py-1.5 rounded-none border border-hairline">
              <Briefcase className="h-3.5 w-3.5 text-primary" />
              <span>Exact DBML: 205 Tables Supported</span>
            </div>
          </div>
        </div>
      </div>

      {/* Modules Overview */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-ink tracking-tight">HRMS Core Modules</h3>
          <span className="text-xs text-muted">Click a module to view readiness and slice workflow</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {moduleList.map((module) => {
            const Icon = module.icon;
            return (
              <Card key={module.title} variant="default" className="flex flex-col justify-between hover:border-primary/50 transition-colors">
                <CardHeader className="p-5">
                  <div className="flex items-center justify-between pb-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-none bg-surface-strong text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <Badge variant="outline">{module.tag}</Badge>
                  </div>
                  <CardTitle className="text-base font-bold text-ink">{module.title}</CardTitle>
                  <CardDescription className="text-xs text-body leading-relaxed mt-1">
                    {module.description}
                  </CardDescription>
                </CardHeader>
                <CardFooter className="flex items-center justify-between px-5 py-3.5 border-t border-hairline bg-canvas-soft/40">
                  <span className="font-mono text-[11px] text-muted">{module.sliceWorkflow}</span>
                  <Link to={module.path}>
                    <Button variant="ghost" size="sm" className="h-8 px-2 text-xs font-semibold text-primary inline-flex items-center gap-1">
                      <span>Explore</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>
    </PageContainer>
  );
}
