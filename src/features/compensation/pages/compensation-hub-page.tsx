import { Select } from '../../../components/ui/select';
import React, { useState } from 'react';
import {
  Banknote,
  TrendingUp,
  Plus,
  Layers,
  HeartHandshake,
  ArrowUpRight,
  ShieldAlert,
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Dialog } from '../../../components/ui/dialog';
import {
  useCompensationComponents,
  useCreateCompensationComponent,
  useCompensationPlans,
  useCompensationAssignments,
  useAssignCompensation,
  useCompensationChangeRequests,
  useCreateCompensationChangeRequest,
  useApproveCompensationChangeRequest,
  useBenefitPlans,
  useCreateBenefitPlan,
} from '../api/compensation-api';
import { useEmployees } from '../../employee/api/employee-api';
import { cn } from '../../../lib/utils';
import { PayrollItemType } from '../types/compensation';

export const CompensationHubPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'assignments' | 'components' | 'requests' | 'benefits'>('assignments');

  // Modals
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [isIncrementOpen, setIsIncrementOpen] = useState(false);
  const [isComponentOpen, setIsComponentOpen] = useState(false);
  const [isBenefitOpen, setIsBenefitOpen] = useState(false);

  // Assign Form
  const [assignEmpId, setAssignEmpId] = useState('');
  const [assignPlanId, setAssignPlanId] = useState('');
  const [assignBaseSalary, setAssignBaseSalary] = useState(250000);
  const [assignEffectiveFrom, setAssignEffectiveFrom] = useState('2026-04-01');
  const [assignReason, setAssignReason] = useState('Initial salary assignment');

  // Increment Form
  const [incrEmpId, setIncrEmpId] = useState('');
  const [incrProposedSalary, setIncrProposedSalary] = useState(300000);
  const [incrEffectiveDate, setIncrEffectiveDate] = useState('2026-07-01');
  const [incrReason, setIncrReason] = useState('Annual performance increment & market adjustment');

  // Component Form
  const [compCode, setCompCode] = useState('');
  const [compName, setCompName] = useState('');
  const [compItemType, setCompItemType] = useState<PayrollItemType>('earning');
  const [compEpf, setCompEpf] = useState(true);
  const [compTaxable, setCompTaxable] = useState(true);
  const [compGratuity, setCompGratuity] = useState(false);
  const [compOvertime, setCompOvertime] = useState(false);

  // Benefit Form
  const [benCode, setBenCode] = useState('');
  const [benName, setBenName] = useState('');
  const [benCategory, setBenCategory] = useState('health_insurance');
  const [benProvider, setBenProvider] = useState('');
  const [benEmployerAmount, setBenEmployerAmount] = useState(5000);
  const [benEmployeeAmount, setBenEmployeeAmount] = useState(1000);

  // Queries
  const { data: components = [], isLoading: compLoading } = useCompensationComponents();
  const { data: plans = [] } = useCompensationPlans();
  const { data: assignments = [], isLoading: assignLoading } = useCompensationAssignments();
  const { data: changeRequestsData, isLoading: reqLoading } = useCompensationChangeRequests();
  const { data: benefitPlans = [], isLoading: benLoading } = useBenefitPlans();
  const { data: employeesData } = useEmployees({ limit: 100 });

  const employees = employeesData?.data || [];
  const changeRequests = changeRequestsData?.data || [];

  // Mutations
  const assignMutation = useAssignCompensation();
  const createIncrMutation = useCreateCompensationChangeRequest();
  const approveIncrMutation = useApproveCompensationChangeRequest();
  const createCompMutation = useCreateCompensationComponent();
  const createBenMutation = useCreateBenefitPlan();

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignEmpId || !assignPlanId) return;
    try {
      await assignMutation.mutateAsync({
        employeeId: assignEmpId,
        compensationPlanId: assignPlanId,
        baseSalary: Number(assignBaseSalary),
        effectiveFrom: assignEffectiveFrom,
        reason: assignReason,
      });
      setIsAssignOpen(false);
    } catch (err) {
      console.error('Failed to assign compensation', err);
    }
  };

  const handleIncrement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!incrEmpId) return;
    try {
      await createIncrMutation.mutateAsync({
        employeeId: incrEmpId,
        proposedSalary: Number(incrProposedSalary),
        effectiveDate: incrEffectiveDate,
        reason: incrReason,
      });
      setIsIncrementOpen(false);
    } catch (err) {
      console.error('Failed to create increment request', err);
    }
  };

  const handleCreateComponent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!compCode || !compName) return;
    try {
      await createCompMutation.mutateAsync({
        code: compCode.toUpperCase(),
        name: compName,
        itemType: compItemType,
        valueType: 'fixed',
        epfApplicable: compEpf,
        etfApplicable: compEpf,
        taxable: compTaxable,
        gratuityBase: compGratuity,
        overtimeBase: compOvertime,
        recurring: true,
        proratable: true,
      });
      setIsComponentOpen(false);
      setCompCode('');
      setCompName('');
    } catch (err) {
      console.error('Failed to create component', err);
    }
  };

  const handleCreateBenefit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!benCode || !benName) return;
    try {
      await createBenMutation.mutateAsync({
        code: benCode.toUpperCase(),
        name: benName,
        category: benCategory,
        providerName: benProvider || undefined,
        employerContribution: Number(benEmployerAmount),
        employeeContribution: Number(benEmployeeAmount),
        effectiveFrom: '2026-01-01',
      });
      setIsBenefitOpen(false);
      setBenCode('');
      setBenName('');
    } catch (err) {
      console.error('Failed to create benefit', err);
    }
  };

  const handleApproveIncrement = async (id: string) => {
    try {
      await approveIncrMutation.mutateAsync(id);
    } catch (err) {
      console.error('Failed to approve increment', err);
    }
  };

  // KPIs
  const totalPayrollBase = assignments.reduce((sum, a) => sum + Number(a.baseSalary), 0);
  const avgBaseSalary = assignments.length > 0 ? totalPayrollBase / assignments.length : 0;
  const pendingRequestsCount = changeRequests.filter((r) => r.status === 'pending').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-5 border-b border-hairline">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold tracking-tight text-ink">Compensation & Benefits</h1>
          <p className="text-sm text-muted mt-1">Salary structures, grade scales, and statutory benefit packages.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <Button
            variant="primary-pill"
            size="sm"
            onClick={() => setIsIncrementOpen(true)}
            className="flex items-center gap-1.5"
          >
            <TrendingUp className="h-3.5 w-3.5" />
            <span>Propose Revision</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAssignOpen(true)}
            className="flex items-center gap-1.5"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Assign Salary</span>
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-none border border-hairline bg-canvas p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted">Monthly Base Payroll</span>
            <Banknote className="h-4 w-4 text-primary" />
          </div>
          <p className="mt-2 text-xl sm:text-2xl font-bold text-ink tracking-tight">
            LKR {(totalPayrollBase / 1000).toLocaleString('en-LK')} k
          </p>
          <span className="text-[11px] text-muted">{assignments.length} assigned employees</span>
        </div>

        <div className="rounded-none border border-hairline bg-canvas p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted">Average Base Salary</span>
            <TrendingUp className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="mt-2 text-xl sm:text-2xl font-bold text-emerald-700 tracking-tight">
            LKR {Math.round(avgBaseSalary).toLocaleString('en-LK')}
          </p>
          <span className="text-[11px] text-muted">Per employee monthly base</span>
        </div>

        <div className="rounded-none border border-hairline bg-canvas p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted">Pending Revisions</span>
            <ArrowUpRight className="h-4 w-4 text-amber-600" />
          </div>
          <p className="mt-2 text-xl sm:text-2xl font-bold text-amber-700 tracking-tight">{pendingRequestsCount}</p>
          <span className="text-[11px] text-muted">Awaiting approval</span>
        </div>

        <div className="rounded-none border border-hairline bg-canvas p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted">Benefit Plans</span>
            <HeartHandshake className="h-4 w-4 text-purple-600" />
          </div>
          <p className="mt-2 text-xl sm:text-2xl font-bold text-purple-700 tracking-tight">{benefitPlans.length}</p>
          <span className="text-[11px] text-muted">Corporate health & insurance</span>
        </div>
      </div>

      {/* Navigation Tab Bar */}
      <div className="flex items-center gap-2 overflow-x-auto border-b border-[#e6e6e6] pb-0 mb-6 scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveTab('assignments')}
          className={cn(
            'inline-flex items-center gap-2 rounded-none px-3.5 py-2 text-sm font-medium whitespace-nowrap transition-colors cursor-pointer select-none',
            activeTab === 'assignments'
              ? 'bg-[#1c69d4]/10 text-[#1c69d4] font-bold border-b-2 border-[#1c69d4] rounded-none'
              : 'bg-transparent text-[#6b6b6b] hover:bg-[#f7f7f7] hover:text-[#262626] border-b-2 border-transparent font-normal rounded-none',
          )}
        >
          <Banknote className="h-4 w-4" />
          <span>Employee Salaries ({assignments.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('components')}
          className={cn(
            'inline-flex items-center gap-2 rounded-none px-3.5 py-2 text-sm font-medium whitespace-nowrap transition-colors cursor-pointer select-none',
            activeTab === 'components'
              ? 'bg-[#1c69d4]/10 text-[#1c69d4] font-bold border-b-2 border-[#1c69d4] rounded-none'
              : 'bg-transparent text-[#6b6b6b] hover:bg-[#f7f7f7] hover:text-[#262626] border-b-2 border-transparent font-normal rounded-none',
          )}
        >
          <Layers className="h-4 w-4" />
          <span>Salary Components ({components.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('requests')}
          className={cn(
            'inline-flex items-center gap-2 rounded-none px-3.5 py-2 text-sm font-medium whitespace-nowrap transition-colors cursor-pointer select-none',
            activeTab === 'requests'
              ? 'bg-[#1c69d4]/10 text-[#1c69d4] font-bold border-b-2 border-[#1c69d4] rounded-none'
              : 'bg-transparent text-[#6b6b6b] hover:bg-[#f7f7f7] hover:text-[#262626] border-b-2 border-transparent font-normal rounded-none',
          )}
        >
          <TrendingUp className="h-4 w-4" />
          <span>Revisions ({changeRequests.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('benefits')}
          className={cn(
            'inline-flex items-center gap-2 rounded-none px-3.5 py-2 text-sm font-medium whitespace-nowrap transition-colors cursor-pointer select-none',
            activeTab === 'benefits'
              ? 'bg-[#1c69d4]/10 text-[#1c69d4] font-bold border-b-2 border-[#1c69d4] rounded-none'
              : 'bg-transparent text-[#6b6b6b] hover:bg-[#f7f7f7] hover:text-[#262626] border-b-2 border-transparent font-normal rounded-none',
          )}
        >
          <HeartHandshake className="h-4 w-4" />
          <span>Benefit Plans ({benefitPlans.length})</span>
        </button>
      </div>

      {/* TAB 1: EMPLOYEE SALARIES */}
      {activeTab === 'assignments' && (
        <div className="overflow-hidden rounded-none border border-hairline bg-canvas ">
          {assignLoading ? (
            <div className="flex h-48 items-center justify-center">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : assignments.length === 0 ? (
            <div className="p-12 text-center">
              <Banknote className="mx-auto h-8 w-8 text-ink-mute/50" />
              <h3 className="mt-3 text-sm font-semibold text-ink">No salary assignments found</h3>
              <p className="mt-1 text-xs text-ink-mute">
                Use "Assign Salary" to configure compensation for employees.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-hairline bg-canvas-lavender/30 text-[11px] font-semibold uppercase text-ink-mute">
                  <tr>
                    <th className="py-3 pl-4 pr-3">Employee</th>
                    <th className="px-3 py-3">Compensation Plan</th>
                    <th className="px-3 py-3">Base Salary</th>
                    <th className="px-3 py-3">Frequency</th>
                    <th className="px-3 py-3">Effective Range</th>
                    <th className="py-3 pl-3 pr-4">Reason / Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hairline">
                  {assignments.map((a) => (
                    <tr key={a.id} className="hover:bg-canvas-soft/30 transition-colors">
                      <td className="py-3 pl-4 pr-3">
                        <div className="font-semibold text-ink">{a.employee?.displayName}</div>
                        <span className="font-mono text-[11px] text-ink-mute">{a.employee?.employeeNumber}</span>
                      </td>
                      <td className="px-3 py-3 font-medium text-ink">
                        {a.compensationPlan?.name || 'Standard Package'}
                      </td>
                      <td className="px-3 py-3">
                        <span className="font-mono text-sm font-bold text-ink">
                          {a.currency} {Number(a.baseSalary).toLocaleString('en-LK', { minimumFractionDigits: 2 })}
                        </span>
                      </td>
                      <td className="px-3 py-3 capitalize text-ink-mute">
                        {a.payFrequency}
                      </td>
                      <td className="px-3 py-3 font-mono text-[11px] text-ink-mute">
                        {a.effectiveFrom} {a.effectiveTo ? `— ${a.effectiveTo}` : '— Active'}
                      </td>
                      <td className="py-3 pl-3 pr-4 text-ink-mute max-w-xs truncate">
                        {a.reason || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: SALARY COMPONENTS */}
      {activeTab === 'components' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button
              variant="secondary-pill"
              size="sm"
              onClick={() => setIsComponentOpen(true)}
              className="flex items-center gap-1.5"
            >
              <Plus className="h-4 w-4" />
              New Component
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {compLoading ? (
              <div className="col-span-full flex h-48 items-center justify-center">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
            ) : (
              components.map((c) => (
                <div key={c.id} className="rounded-none border border-hairline bg-canvas p-5  space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-ink text-sm">{c.name}</h3>
                      <span className="font-mono text-[10px] text-ink-mute uppercase">{c.code}</span>
                    </div>
                    <span
                      className={`rounded px-2 py-0.5 font-mono text-[10px] font-bold uppercase ${
                        c.itemType === 'earning'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-red-50 text-red-700 border border-red-200'
                      }`}
                    >
                      {c.itemType}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {c.epfApplicable && (
                      <span className="rounded bg-emerald-100/70 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                        EPF/ETF (8%/12%/3%)
                      </span>
                    )}
                    {c.taxable && (
                      <span className="rounded bg-blue-100/70 px-2 py-0.5 text-[10px] font-bold text-blue-800">
                        APIT Taxable
                      </span>
                    )}
                    {c.gratuityBase && (
                      <span className="rounded bg-purple-100/70 px-2 py-0.5 text-[10px] font-bold text-purple-800">
                        Gratuity Base
                      </span>
                    )}
                    {c.overtimeBase && (
                      <span className="rounded bg-amber-100/70 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                        Overtime Base
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 3: SALARY INCREMENT & REVISION REQUESTS */}
      {activeTab === 'requests' && (
        <div className="overflow-hidden rounded-none border border-hairline bg-canvas ">
          {reqLoading ? (
            <div className="flex h-48 items-center justify-center">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : changeRequests.length === 0 ? (
            <div className="p-12 text-center">
              <TrendingUp className="mx-auto h-8 w-8 text-ink-mute/50" />
              <h3 className="mt-3 text-sm font-semibold text-ink">No salary revision requests</h3>
              <p className="mt-1 text-xs text-ink-mute">
                Use "Propose Revision" to submit an increment proposal.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-hairline bg-canvas-lavender/30 text-[11px] font-semibold uppercase text-ink-mute">
                  <tr>
                    <th className="py-3 pl-4 pr-3">Employee</th>
                    <th className="px-3 py-3">Current Salary</th>
                    <th className="px-3 py-3">Proposed Salary</th>
                    <th className="px-3 py-3">Adjustment</th>
                    <th className="px-3 py-3">Effective Date</th>
                    <th className="px-3 py-3">Reason</th>
                    <th className="px-3 py-3">Status</th>
                    <th className="py-3 pl-3 pr-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hairline">
                  {changeRequests.map((r) => {
                    const current = Number(r.currentCompensation?.baseSalary || 0);
                    const proposed = Number(r.proposedCompensation?.baseSalary || 0);
                    const diff = proposed - current;
                    const percent = current > 0 ? ((diff / current) * 100).toFixed(1) : '100.0';

                    return (
                      <tr key={r.id} className="hover:bg-canvas-soft/30 transition-colors">
                        <td className="py-3 pl-4 pr-3">
                          <div className="font-semibold text-ink">{r.employee?.displayName}</div>
                          <span className="font-mono text-[11px] text-ink-mute">{r.employee?.employeeNumber}</span>
                        </td>
                        <td className="px-3 py-3 font-mono font-medium text-ink-mute">
                          LKR {current.toLocaleString('en-LK', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-3 py-3 font-mono font-bold text-ink">
                          LKR {proposed.toLocaleString('en-LK', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-3 py-3">
                          <span className="rounded-none bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                            +{percent}% (+LKR {diff.toLocaleString('en-LK')})
                          </span>
                        </td>
                        <td className="px-3 py-3 font-mono text-[11px] text-ink">
                          {r.effectiveDate}
                        </td>
                        <td className="px-3 py-3 text-ink-mute max-w-xs truncate">
                          {r.reason || '—'}
                        </td>
                        <td className="px-3 py-3">
                          <span className={`rounded-none px-2 py-0.5 text-[10px] font-bold uppercase ${
                            r.status === 'approved'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}>
                            {r.status}
                          </span>
                        </td>
                        <td className="py-3 pl-3 pr-4 text-right">
                          {r.status === 'pending' && (
                            <Button
                              variant="primary-pill"
                              size="sm"
                              onClick={() => handleApproveIncrement(r.id)}
                              disabled={approveIncrMutation.isPending}
                              className="h-7 text-[11px] px-2.5"
                            >
                              Approve
                            </Button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: BENEFITS */}
      {activeTab === 'benefits' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button
              variant="secondary-pill"
              size="sm"
              onClick={() => setIsBenefitOpen(true)}
              className="flex items-center gap-1.5"
            >
              <Plus className="h-4 w-4" />
              New Benefit Plan
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {benLoading ? (
              <div className="col-span-full flex h-48 items-center justify-center">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
            ) : benefitPlans.length === 0 ? (
              <div className="col-span-full p-12 text-center border border-hairline rounded-none">
                <ShieldAlert className="mx-auto h-8 w-8 text-ink-mute/50" />
                <h3 className="mt-3 text-sm font-semibold text-ink">No corporate benefit plans found</h3>
                <p className="mt-1 text-xs text-ink-mute">
                  Add health, life, or OPD plans using the "New Benefit Plan" button.
                </p>
              </div>
            ) : (
              benefitPlans.map((b) => (
                <div key={b.id} className="rounded-none border border-hairline bg-canvas p-5  space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-ink text-sm">{b.name}</h3>
                      <span className="font-mono text-[10px] text-ink-mute uppercase">{b.code}</span>
                    </div>
                    <span className="rounded bg-canvas-soft px-2 py-0.5 font-mono text-[10px] font-bold text-ink uppercase">
                      {b.category.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs text-ink-mute">
                    <div className="flex justify-between">
                      <span>Provider:</span>
                      <span className="font-semibold text-ink">{b.providerName || 'Self-funded'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Employer Contribution:</span>
                      <span className="font-semibold text-emerald-700">
                        LKR {Number(b.employerContribution || 0).toLocaleString('en-LK')} /mo
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Employee Contribution:</span>
                      <span className="font-semibold text-ink">
                        LKR {Number(b.employeeContribution || 0).toLocaleString('en-LK')} /mo
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ASSIGN SALARY MODAL */}
      <Dialog
        isOpen={isAssignOpen}
        onClose={() => setIsAssignOpen(false)}
        title="Assign Salary Structure"
        description="Configure compensation package and monthly base salary for an employee."
        maxWidth="md"
      >
        <form onSubmit={handleAssign} className="space-y-4 text-xs">
          <div>
            <Label htmlFor="assignEmpId">Employee *</Label>
            <Select
              id="assignEmpId"
              required
              value={assignEmpId}
              onChange={(e) => setAssignEmpId(e.target.value)}
              
            >
              <option value="">Select Employee</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.displayName} ({emp.employeeNumber})
                </option>
              ))}
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="assignPlanId">Compensation Plan *</Label>
              <Select
                id="assignPlanId"
                required
                value={assignPlanId}
                onChange={(e) => setAssignPlanId(e.target.value)}
                
              >
                <option value="">Select Plan</option>
                {plans.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <Label htmlFor="assignBaseSalary">Monthly Base Salary (LKR) *</Label>
              <Input
                id="assignBaseSalary"
                type="number"
                min="0"
                step="1000"
                required
                value={assignBaseSalary}
                onChange={(e) => setAssignBaseSalary(parseFloat(e.target.value))}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="assignEffectiveFrom">Effective From Date *</Label>
            <Input
              id="assignEffectiveFrom"
              type="date"
              required
              value={assignEffectiveFrom}
              onChange={(e) => setAssignEffectiveFrom(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="assignReason">Reason / Notes</Label>
            <Input
              id="assignReason"
              value={assignReason}
              onChange={(e) => setAssignReason(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-hairline">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsAssignOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary-pill"
              size="sm"
              disabled={assignMutation.isPending}
            >
              {assignMutation.isPending ? 'Saving...' : 'Save Assignment'}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* PROPOSE INCREMENT MODAL */}
      <Dialog
        isOpen={isIncrementOpen}
        onClose={() => setIsIncrementOpen(false)}
        title="Propose Salary Revision"
        description="Propose a salary increment or grade adjustment with effective-date automation."
        maxWidth="md"
      >
        <form onSubmit={handleIncrement} className="space-y-4 text-xs">
          <div>
            <Label htmlFor="incrEmpId">Employee *</Label>
            <Select
              id="incrEmpId"
              required
              value={incrEmpId}
              onChange={(e) => setIncrEmpId(e.target.value)}
              
            >
              <option value="">Select Employee</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.displayName} ({emp.employeeNumber})
                </option>
              ))}
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="incrProposedSalary">Proposed Base Salary (LKR) *</Label>
              <Input
                id="incrProposedSalary"
                type="number"
                min="0"
                step="1000"
                required
                value={incrProposedSalary}
                onChange={(e) => setIncrProposedSalary(parseFloat(e.target.value))}
              />
            </div>

            <div>
              <Label htmlFor="incrEffectiveDate">Effective Date *</Label>
              <Input
                id="incrEffectiveDate"
                type="date"
                required
                value={incrEffectiveDate}
                onChange={(e) => setIncrEffectiveDate(e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="incrReason">Justification / Reason *</Label>
            <Input
              id="incrReason"
              required
              placeholder="e.g. Annual merit revision"
              value={incrReason}
              onChange={(e) => setIncrReason(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-hairline">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsIncrementOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary-pill"
              size="sm"
              disabled={createIncrMutation.isPending}
            >
              {createIncrMutation.isPending ? 'Submitting...' : 'Submit Proposal'}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* CREATE COMPONENT MODAL */}
      <Dialog
        isOpen={isComponentOpen}
        onClose={() => setIsComponentOpen(false)}
        title="Create Salary Component"
        description="Add a new salary or statutory allowance/deduction component."
        maxWidth="md"
      >
        <form onSubmit={handleCreateComponent} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="compCode">Component Code *</Label>
              <Input
                id="compCode"
                required
                placeholder="e.g. FUEL_ALLOW"
                value={compCode}
                onChange={(e) => setCompCode(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="compName">Component Name *</Label>
              <Input
                id="compName"
                required
                placeholder="e.g. Fuel & Travel Allowance"
                value={compName}
                onChange={(e) => setCompName(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="compItemType">Item Type</Label>
              <Select
                id="compItemType"
                value={compItemType}
                onChange={(e) => setCompItemType(e.target.value as any)}
                
              >
                <option value="earning">Earning</option>
                <option value="deduction">Deduction</option>
                <option value="employer_contribution">Employer Contribution</option>
              </Select>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-hairline">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={compEpf}
                onChange={(e) => setCompEpf(e.target.checked)}
                className="rounded border-hairline"
              />
              <span>Subject to EPF (8%/12%) and ETF (3%)</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={compTaxable}
                onChange={(e) => setCompTaxable(e.target.checked)}
                className="rounded border-hairline"
              />
              <span>Subject to APIT Income Tax</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={compGratuity}
                onChange={(e) => setCompGratuity(e.target.checked)}
                className="rounded border-hairline"
              />
              <span>Included in Gratuity Base</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={compOvertime}
                onChange={(e) => setCompOvertime(e.target.checked)}
                className="rounded border-hairline"
              />
              <span>Included in Overtime Rate Base</span>
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-hairline">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsComponentOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary-pill"
              size="sm"
              disabled={createCompMutation.isPending}
            >
              {createCompMutation.isPending ? 'Saving...' : 'Create Component'}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* CREATE BENEFIT MODAL */}
      <Dialog
        isOpen={isBenefitOpen}
        onClose={() => setIsBenefitOpen(false)}
        title="Create Benefit Plan"
        description="Add corporate medical, insurance, or wellness benefit plan."
        maxWidth="md"
      >
        <form onSubmit={handleCreateBenefit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="benCode">Plan Code *</Label>
              <Input
                id="benCode"
                required
                placeholder="e.g. MED_PLATINUM"
                value={benCode}
                onChange={(e) => setBenCode(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="benName">Plan Name *</Label>
              <Input
                id="benName"
                required
                placeholder="e.g. Executive OPD & Hospitalization"
                value={benName}
                onChange={(e) => setBenName(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="benCategory">Category</Label>
              <Select
                id="benCategory"
                value={benCategory}
                onChange={(e) => setBenCategory(e.target.value)}
                
              >
                <option value="health_insurance">Health Insurance & OPD</option>
                <option value="life_insurance">Life Insurance</option>
                <option value="wellness">Wellness & Gym</option>
                <option value="retirement">Retirement / Pension</option>
              </Select>
            </div>

            <div>
              <Label htmlFor="benProvider">Insurance Provider</Label>
              <Input
                id="benProvider"
                placeholder="e.g. Sri Lanka Insurance"
                value={benProvider}
                onChange={(e) => setBenProvider(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="benEmployerAmount">Employer Monthly Cost (LKR)</Label>
              <Input
                id="benEmployerAmount"
                type="number"
                value={benEmployerAmount}
                onChange={(e) => setBenEmployerAmount(parseFloat(e.target.value))}
              />
            </div>

            <div>
              <Label htmlFor="benEmployeeAmount">Employee Monthly Deduction (LKR)</Label>
              <Input
                id="benEmployeeAmount"
                type="number"
                value={benEmployeeAmount}
                onChange={(e) => setBenEmployeeAmount(parseFloat(e.target.value))}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-hairline">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsBenefitOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary-pill"
              size="sm"
              disabled={createBenMutation.isPending}
            >
              {createBenMutation.isPending ? 'Saving...' : 'Create Plan'}
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
};
