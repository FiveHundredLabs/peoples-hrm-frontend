import { Select } from '../../../components/ui/select';
import React, { useState } from 'react';
import {
  Banknote,
  CheckCircle2,
  Clock,
  Coins,
  FileCheck,
  FileText,
  Plus,
  ShieldCheck,
  UserX,
  Calculator,
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Textarea } from '../../../components/ui/textarea';
import { Label } from '../../../components/ui/label';
import { Dialog } from '../../../components/ui/dialog';
import {
  useFinalSettlements,
  useCreateFinalSettlement,
  useApproveFinalSettlement,
  useFinalizeFinalSettlement,
  useCalculateGratuity,
  useOffboardingCases,
  useCreateOffboardingCase,
  useUpdateOffboardingTask,
} from '../api/final-settlement-api';
import { useEmployees } from '../../employee/api/employee-api';
import { cn } from '../../../lib/utils';
import { FinalSettlement, ApprovalStatus, OffboardingStatus, GratuityCalculation } from '../types/final-settlement';

export const FinalSettlementHubPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'settlements' | 'gratuity' | 'offboarding'>('settlements');
  const [viewingSettlement, setViewingSettlement] = useState<FinalSettlement | null>(null);

  // Dialog states
  const [isSettlementModalOpen, setIsSettlementModalOpen] = useState(false);
  const [isOffboardingModalOpen, setIsOffboardingModalOpen] = useState(false);
  const [isGratuityEstimatorOpen, setIsGratuityEstimatorOpen] = useState(false);

  // Queries
  const { data: settlementsData, isLoading: settlementsLoading } = useFinalSettlements();
  const { data: offboardingCases = [], isLoading: offboardingLoading } = useOffboardingCases();
  const { data: employeesData } = useEmployees({ limit: 100 });

  const employees = employeesData?.data || [];
  const settlements = settlementsData?.data || [];

  // Mutations
  const createSettlementMutation = useCreateFinalSettlement();
  const approveSettlementMutation = useApproveFinalSettlement();
  const finalizeSettlementMutation = useFinalizeFinalSettlement();
  const calculateGratuityMutation = useCalculateGratuity();
  const createOffboardingMutation = useCreateOffboardingCase();
  const updateTaskMutation = useUpdateOffboardingTask();

  // Create Settlement Form State
  const [settleEmpId, setSettleEmpId] = useState('');
  const [settleLastDate, setSettleLastDate] = useState('2026-09-30');
  const [settleUnpaidDays, setSettleUnpaidDays] = useState(15);
  const [settleOvertimeHours, setSettleOvertimeHours] = useState(0);
  const [settleOtherDeductions, setSettleOtherDeductions] = useState(0);
  const [settleNotes, setSettleNotes] = useState('Resignation - Relocating abroad');

  // Create Offboarding Case Form State
  const [offEmpId, setOffEmpId] = useState('');
  const [offSeparationType, setOffSeparationType] = useState('resignation');
  const [offResignDate, setOffResignDate] = useState('2026-08-30');
  const [offLastDate, setOffLastDate] = useState('2026-09-30');
  const [offReason, setOffReason] = useState('Pursuing higher studies overseas');

  // Gratuity Estimator State
  const [estimateEmpId, setEstimateEmpId] = useState('');
  const [estimateLastDate, setEstimateLastDate] = useState('2026-09-30');
  const [estimateResult, setEstimateResult] = useState<GratuityCalculation | null>(null);

  const handleCreateSettlement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settleEmpId) return;
    try {
      await createSettlementMutation.mutateAsync({
        employeeId: settleEmpId,
        lastWorkingDate: settleLastDate,
        unpaidDaysWorked: Number(settleUnpaidDays),
        unpaidOvertimeHours: Number(settleOvertimeHours),
        otherDeductions: Number(settleOtherDeductions),
        notes: settleNotes,
      });
      setIsSettlementModalOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateOffboarding = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!offEmpId) return;
    try {
      await createOffboardingMutation.mutateAsync({
        employeeId: offEmpId,
        separationType: offSeparationType,
        resignationReceivedAt: offResignDate,
        lastWorkingDate: offLastDate,
        reason: offReason,
      });
      setIsOffboardingModalOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRunGratuityEstimate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!estimateEmpId) return;
    try {
      const res = await calculateGratuityMutation.mutateAsync({
        employeeId: estimateEmpId,
        lastWorkingDate: estimateLastDate,
      });
      setEstimateResult(res);
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusBadge = (status: ApprovalStatus) => {
    switch (status) {
      case 'draft':
        return <span className="rounded-none bg-canvas-soft px-2 py-0.5 text-[10px] font-bold text-ink uppercase">Draft</span>;
      case 'pending':
        return <span className="rounded-none bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700 border border-amber-200 uppercase">Pending</span>;
      case 'approved':
        return <span className="rounded-none bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700 border border-blue-200 uppercase">Approved</span>;
      case 'rejected':
        return <span className="rounded-none bg-red-50 px-2 py-0.5 text-[10px] font-bold text-red-700 border border-red-200 uppercase">Rejected</span>;
      default:
        return <span className="rounded-none bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200 uppercase">{status}</span>;
    }
  };

  const getOffboardingStatusBadge = (status: OffboardingStatus) => {
    switch (status) {
      case 'initiated':
      case 'in_progress':
        return <span className="rounded-none bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700 border border-blue-200 uppercase">In Progress</span>;
      case 'completed':
        return <span className="rounded-none bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200 uppercase">Completed</span>;
      case 'blocked':
        return <span className="rounded-none bg-red-50 px-2 py-0.5 text-[10px] font-bold text-red-700 border border-red-200 uppercase">Blocked</span>;
      default:
        return <span className="rounded-none bg-canvas-soft px-2 py-0.5 text-[10px] font-bold text-ink uppercase">{status}</span>;
    }
  };

  // KPIs
  const totalNetSettlements = settlements.reduce((acc, s) => acc + Number(s.netSettlement || 0), 0);
  const totalGratuityDisbursed = settlements.reduce((acc, s) => acc + Number(s.gratuityAmount || 0), 0);
  const activeOffboardingCount = offboardingCases.filter((c) => c.status === 'in_progress' || c.status === 'initiated').length;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-5 border-b border-hairline">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold tracking-tight text-ink">Final Settlement, Gratuity & Exit Clearance</h1>
          <p className="text-sm text-muted mt-1">Terminal gratuity calculations, clearance checklists, and exit vouchers.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsGratuityEstimatorOpen(true)}
            className="flex items-center gap-1.5"
          >
            <Calculator className="h-3.5 w-3.5" />
            <span>Gratuity Estimator</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsOffboardingModalOpen(true)}
            className="flex items-center gap-1.5"
          >
            <UserX className="h-3.5 w-3.5" />
            <span>Exit Clearance Case</span>
          </Button>
          <Button
            variant="primary-pill"
            size="sm"
            onClick={() => setIsSettlementModalOpen(true)}
            className="flex items-center gap-1.5"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Compute Final Settlement</span>
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-none border border-hairline bg-canvas p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted">Net Settlements Payable</span>
            <Banknote className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="mt-2 text-xl sm:text-2xl font-bold text-emerald-700 tracking-tight">
            LKR {totalNetSettlements.toLocaleString('en-LK', { minimumFractionDigits: 2 })}
          </p>
          <span className="text-[11px] text-muted">{settlements.length} Settlements Processed</span>
        </div>

        <div className="rounded-none border border-hairline bg-canvas p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted">Statutory Gratuity Total</span>
            <Coins className="h-4 w-4 text-purple-600" />
          </div>
          <p className="mt-2 text-xl sm:text-2xl font-bold text-purple-700 tracking-tight">
            LKR {totalGratuityDisbursed.toLocaleString('en-LK', { minimumFractionDigits: 2 })}
          </p>
          <span className="text-[11px] text-muted">Act No. 12 of 1983</span>
        </div>

        <div className="rounded-none border border-hairline bg-canvas p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted">Active Exit Clearance Cases</span>
            <Clock className="h-4 w-4 text-amber-600" />
          </div>
          <p className="mt-2 text-xl sm:text-2xl font-bold text-amber-700 tracking-tight">
            {activeOffboardingCount} Active
          </p>
          <span className="text-[11px] text-muted">IT, HR & Finance checklist</span>
        </div>

        <div className="rounded-none border border-hairline bg-canvas p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted">Statutory Eligibility Rule</span>
            <ShieldCheck className="h-4 w-4 text-primary" />
          </div>
          <p className="mt-2 text-xl sm:text-2xl font-bold text-ink tracking-tight">
            5+ Years
          </p>
          <span className="text-[11px] text-muted">0.5 mo salary / completed yr</span>
        </div>
      </div>

      {/* Navigation Tab Bar */}
      <div className="flex items-center gap-2 overflow-x-auto border-b border-[#e6e6e6] pb-0 mb-6 scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveTab('settlements')}
          className={cn(
            'inline-flex items-center gap-2 rounded-none px-3.5 py-2 text-sm font-medium whitespace-nowrap transition-colors cursor-pointer select-none',
            activeTab === 'settlements'
              ? 'bg-[#1c69d4]/10 text-[#1c69d4] font-bold border-b-2 border-[#1c69d4] rounded-none'
              : 'bg-transparent text-[#6b6b6b] hover:bg-[#f7f7f7] hover:text-[#262626] border-b-2 border-transparent font-normal rounded-none',
          )}
        >
          <Banknote className="h-4 w-4" />
          <span>Final Settlements ({settlements.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('gratuity')}
          className={cn(
            'inline-flex items-center gap-2 rounded-none px-3.5 py-2 text-sm font-medium whitespace-nowrap transition-colors cursor-pointer select-none',
            activeTab === 'gratuity'
              ? 'bg-[#1c69d4]/10 text-[#1c69d4] font-bold border-b-2 border-[#1c69d4] rounded-none'
              : 'bg-transparent text-[#6b6b6b] hover:bg-[#f7f7f7] hover:text-[#262626] border-b-2 border-transparent font-normal rounded-none',
          )}
        >
          <Coins className="h-4 w-4" />
          <span>Statutory Gratuity Audit</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('offboarding')}
          className={cn(
            'inline-flex items-center gap-2 rounded-none px-3.5 py-2 text-sm font-medium whitespace-nowrap transition-colors cursor-pointer select-none',
            activeTab === 'offboarding'
              ? 'bg-[#1c69d4]/10 text-[#1c69d4] font-bold border-b-2 border-[#1c69d4] rounded-none'
              : 'bg-transparent text-[#6b6b6b] hover:bg-[#f7f7f7] hover:text-[#262626] border-b-2 border-transparent font-normal rounded-none',
          )}
        >
          <UserX className="h-4 w-4" />
          <span>Exit Clearance Cases ({offboardingCases.length})</span>
        </button>
      </div>

      {/* TAB 1: FINAL SETTLEMENTS */}
      {activeTab === 'settlements' && (
        <div className="overflow-hidden rounded-none border border-hairline bg-canvas ">
          {settlementsLoading ? (
            <div className="flex h-48 items-center justify-center">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : settlements.length === 0 ? (
            <div className="p-12 text-center">
              <Banknote className="mx-auto h-8 w-8 text-ink-mute/50" />
              <h3 className="mt-3 text-sm font-semibold text-ink">No final settlements found</h3>
              <p className="mt-1 text-xs text-ink-mute">
                Use "Compute Final Settlement" to generate a salary arrears, gratuity, and leave encashment statement.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-hairline bg-canvas-lavender/30 text-[11px] font-semibold uppercase text-ink-mute">
                  <tr>
                    <th className="py-3 pl-4 pr-3">Employee</th>
                    <th className="px-3 py-3">Last Working Date</th>
                    <th className="px-3 py-3">Salary Due</th>
                    <th className="px-3 py-3">Leave Encashment</th>
                    <th className="px-3 py-3">Gratuity Amount</th>
                    <th className="px-3 py-3">Deductions (Loans)</th>
                    <th className="px-3 py-3">Net Settlement</th>
                    <th className="px-3 py-3">Status</th>
                    <th className="py-3 pl-3 pr-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hairline">
                  {settlements.map((s) => (
                    <tr key={s.id} className="hover:bg-canvas-soft/30 transition-colors">
                      <td className="py-3 pl-4 pr-3">
                        <div className="font-semibold text-ink">{s.employee?.displayName}</div>
                        <span className="font-mono text-[11px] text-ink-mute">{s.employee?.employeeNumber}</span>
                      </td>
                      <td className="px-3 py-3 font-mono text-ink">
                        {s.lastWorkingDate}
                      </td>
                      <td className="px-3 py-3 font-mono text-ink">
                        LKR {Number(s.salaryDue).toLocaleString('en-LK', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-3 py-3 font-mono text-ink">
                        LKR {Number(s.leaveEncashment).toLocaleString('en-LK', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-3 py-3 font-mono font-bold text-purple-700">
                        LKR {Number(s.gratuityAmount).toLocaleString('en-LK', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-3 py-3 font-mono text-amber-700">
                        LKR {Number(s.deductions).toLocaleString('en-LK', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-3 py-3 font-mono font-bold text-emerald-700">
                        LKR {Number(s.netSettlement).toLocaleString('en-LK', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-3 py-3">
                        {getStatusBadge(s.status)}
                      </td>
                      <td className="py-3 pl-3 pr-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {s.status === 'pending' && (
                            <Button
                              variant="primary-pill"
                              size="sm"
                              onClick={() => approveSettlementMutation.mutate(s.id)}
                              disabled={approveSettlementMutation.isPending}
                              className="h-7 text-[11px] px-2.5 flex items-center gap-1"
                            >
                              <CheckCircle2 className="h-3 w-3" />
                              Approve
                            </Button>
                          )}
                          {s.status === 'approved' && !s.finalizedAt && (
                            <Button
                              variant="primary-pill"
                              size="sm"
                              onClick={() => finalizeSettlementMutation.mutate(s.id)}
                              disabled={finalizeSettlementMutation.isPending}
                              className="h-7 text-[11px] px-2.5 flex items-center gap-1 bg-emerald-700 hover:bg-emerald-800"
                            >
                              <FileCheck className="h-3 w-3" />
                              Finalize Exit
                            </Button>
                          )}
                          <Button
                            variant="secondary-pill"
                            size="sm"
                            onClick={() => setViewingSettlement(s)}
                            className="h-7 text-[11px] px-2.5 flex items-center gap-1"
                          >
                            <FileText className="h-3 w-3" />
                            Voucher
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: GRATUITY AUDIT */}
      {activeTab === 'gratuity' && (
        <div className="space-y-6">
          <div className="rounded-none border border-hairline bg-canvas p-5  space-y-3">
            <div className="flex items-center justify-between border-b border-hairline pb-3">
              <div>
                <h3 className="font-bold text-ink text-sm">Payment of Gratuity Act No. 12 of 1983 (Sri Lanka)</h3>
                <p className="text-xs text-ink-mute">Statutory formula: Half a month's basic salary per completed year of service (5+ years continuous service)</p>
              </div>
              <span className="rounded bg-purple-100/70 px-2.5 py-1 text-xs font-bold text-purple-800">
                Statutory Mandate
              </span>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-none bg-canvas-lavender/30 p-4 border border-hairline">
                <span className="text-xs font-medium text-ink-mute">Statutory Eligibility Threshold</span>
                <p className="mt-1 text-2xl font-bold text-ink">5 Years</p>
                <span className="text-[11px] text-ink-mute">Continuous service required</span>
              </div>

              <div className="rounded-none bg-canvas-lavender/30 p-4 border border-hairline">
                <span className="text-xs font-medium text-ink-mute">Statutory Factor</span>
                <p className="mt-1 text-2xl font-bold text-purple-700">0.5 Month</p>
                <span className="text-[11px] text-purple-600">Per completed year</span>
              </div>

              <div className="rounded-none bg-canvas-lavender/30 p-4 border border-hairline">
                <span className="text-xs font-medium text-ink-mute">Fractional Rule</span>
                <p className="mt-1 text-2xl font-bold text-ink">≥ 6 Months</p>
                <span className="text-[11px] text-ink-mute">Rounded up to 1 year</span>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-none border border-hairline bg-canvas ">
            <div className="border-b border-hairline p-4">
              <h3 className="font-bold text-ink text-xs">Gratuity Calculations Record</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-hairline bg-canvas-lavender/30 text-[11px] font-semibold uppercase text-ink-mute">
                  <tr>
                    <th className="py-3 pl-4 pr-3">Employee</th>
                    <th className="px-3 py-3">Completed Tenure</th>
                    <th className="px-3 py-3">Eligible Basic Salary</th>
                    <th className="px-3 py-3">Statutory Factor</th>
                    <th className="px-3 py-3">Statutory Gratuity</th>
                    <th className="py-3 pl-3 pr-4">Legal Formula Audit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hairline font-mono">
                  {settlements.map((s) => {
                    const g = s.gratuityCalculations?.[0];
                    return (
                      <tr key={s.id} className="hover:bg-canvas-soft/30 transition-colors">
                        <td className="py-3 pl-4 pr-3 font-sans">
                          <div className="font-semibold text-ink">{s.employee?.displayName}</div>
                          <span className="font-mono text-[11px] text-ink-mute">{s.employee?.employeeNumber}</span>
                        </td>
                        <td className="px-3 py-3 text-ink">
                          {g?.completedYears || 8} Completed Years
                        </td>
                        <td className="px-3 py-3 text-ink">
                          LKR {Number(g?.eligibleSalaryBase || s.calculationSnapshot?.baseSalary || 0).toLocaleString('en-LK')}
                        </td>
                        <td className="px-3 py-3 font-sans font-bold text-purple-700">
                          0.5 Month / Year
                        </td>
                        <td className="px-3 py-3 font-bold text-purple-700">
                          LKR {Number(s.gratuityAmount).toLocaleString('en-LK', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-3 pl-3 pr-4 font-sans text-xs text-ink-mute max-w-sm truncate">
                          {g?.details?.formula || `${g?.completedYears || 8} yrs × 0.5 × Basic Salary`}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: OFFBOARDING CLEARANCE */}
      {activeTab === 'offboarding' && (
        <div className="space-y-4">
          {offboardingLoading ? (
            <div className="flex h-48 items-center justify-center">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : offboardingCases.length === 0 ? (
            <div className="p-12 text-center rounded-none border border-hairline bg-canvas">
              <UserX className="mx-auto h-8 w-8 text-ink-mute/50" />
              <h3 className="mt-3 text-sm font-semibold text-ink">No offboarding cases</h3>
              <p className="mt-1 text-xs text-ink-mute">
                Click "Exit Clearance Case" to initiate an employee handover checklist.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {offboardingCases.map((c) => {
                const completedTasks = c.tasks?.filter((t) => t.status === 'completed').length || 0;
                const totalTasks = c.tasks?.length || 5;
                const percent = Math.round((completedTasks / totalTasks) * 100);

                return (
                  <div key={c.id} className="rounded-none border border-hairline bg-canvas p-5  space-y-4">
                    <div className="flex justify-between items-start border-b border-hairline pb-3">
                      <div>
                        <div className="font-bold text-ink text-sm">{c.employee?.displayName} ({c.employee?.employeeNumber})</div>
                        <span className="text-xs text-ink-mute capitalize">Separation Type: {c.separationType} • Last Working Date: {c.lastWorkingDate}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {getOffboardingStatusBadge(c.status)}
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-ink">Clearance Tasks Progression ({completedTasks}/{totalTasks})</span>
                        <span className="text-primary font-mono">{percent}%</span>
                      </div>
                      <div className="h-2 w-full rounded-none bg-canvas-soft overflow-hidden">
                        <div
                          className="h-full bg-emerald-600 transition-all duration-300"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>

                    {/* Tasks Checklist */}
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 pt-2">
                      {c.tasks?.map((t) => (
                        <div
                          key={t.id}
                          className="flex items-center justify-between p-3 rounded-none border border-hairline bg-canvas-lavender/20 text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={t.status === 'completed'}
                              onChange={() =>
                                updateTaskMutation.mutate({
                                  taskId: t.id,
                                  status: t.status === 'completed' ? 'pending' : 'completed',
                                })
                              }
                              className="rounded border-hairline text-primary focus:ring-primary h-4 w-4 cursor-pointer"
                            />
                            <span className={t.status === 'completed' ? 'line-through text-ink-mute' : 'font-medium text-ink'}>
                              {t.title}
                            </span>
                          </div>
                          <span className={`text-[10px] font-bold uppercase ${t.status === 'completed' ? 'text-emerald-700' : 'text-amber-700'}`}>
                            {t.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* COMPUTE FINAL SETTLEMENT MODAL */}
      <Dialog
        isOpen={isSettlementModalOpen}
        onClose={() => setIsSettlementModalOpen(false)}
        title="Compute Final Settlement"
        description="Calculate gratuity, arrears, and deductions."
        maxWidth="md"
      >
        <form onSubmit={handleCreateSettlement} className="space-y-4 text-xs">
          <div>
            <Label htmlFor="settleEmp">Employee *</Label>
            <Select
              id="settleEmp"
              required
              value={settleEmpId}
              onChange={(e) => setSettleEmpId(e.target.value)}
              
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
              <Label htmlFor="settleLast">Last Working Date *</Label>
              <Input
                id="settleLast"
                type="date"
                required
                value={settleLastDate}
                onChange={(e) => setSettleLastDate(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="settleUnpaid">Unpaid Days</Label>
              <Input
                id="settleUnpaid"
                type="number"
                min={0}
                max={31}
                placeholder="0"
                value={settleUnpaidDays}
                onChange={(e) => setSettleUnpaidDays(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="settleOt">Unpaid Overtime (Hrs)</Label>
              <Input
                id="settleOt"
                type="number"
                min={0}
                placeholder="0"
                value={settleOvertimeHours}
                onChange={(e) => setSettleOvertimeHours(Number(e.target.value))}
              />
            </div>

            <div>
              <Label htmlFor="settleOtherDed">Other Deductions (LKR)</Label>
              <Input
                id="settleOtherDed"
                type="number"
                min={0}
                placeholder="0"
                value={settleOtherDeductions}
                onChange={(e) => setSettleOtherDeductions(Number(e.target.value))}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="settleNotes">Settlement Remarks / Reason</Label>
            <Textarea
              id="settleNotes"
              rows={2}
              placeholder="Exit reason, clearance remarks, or statutory notes..."
              value={settleNotes}
              onChange={(e) => setSettleNotes(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-hairline">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsSettlementModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary-pill"
              size="sm"
              disabled={createSettlementMutation.isPending}
            >
              {createSettlementMutation.isPending ? 'Computing...' : 'Compute Settlement'}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* CREATE OFFBOARDING CASE MODAL */}
      <Dialog
        isOpen={isOffboardingModalOpen}
        onClose={() => setIsOffboardingModalOpen(false)}
        title="Initiate Exit Clearance Case"
        description="Create offboarding checklist for departmental handovers and asset clearance."
        maxWidth="md"
      >
        <form onSubmit={handleCreateOffboarding} className="space-y-4 text-xs">
          <div>
            <Label htmlFor="offEmp">Employee *</Label>
            <Select
              id="offEmp"
              required
              value={offEmpId}
              onChange={(e) => setOffEmpId(e.target.value)}
              
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
              <Label htmlFor="offType">Separation Type *</Label>
              <Select
                id="offType"
                value={offSeparationType}
                onChange={(e) => setOffSeparationType(e.target.value)}
                
              >
                <option value="resignation">Resignation</option>
                <option value="retirement">Retirement</option>
                <option value="termination">Termination</option>
                <option value="contract_end">Contract End</option>
              </Select>
            </div>

            <div>
              <Label htmlFor="offResignDate">Resignation Received Date</Label>
              <Input
                id="offResignDate"
                type="date"
                value={offResignDate}
                onChange={(e) => setOffResignDate(e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="offLastDate">Last Working Date *</Label>
            <Input
              id="offLastDate"
              type="date"
              required
              value={offLastDate}
              onChange={(e) => setOffLastDate(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="offReason">Reason for Leaving</Label>
            <Input
              id="offReason"
              type="text"
              value={offReason}
              onChange={(e) => setOffReason(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-hairline">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsOffboardingModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary-pill"
              size="sm"
              disabled={createOffboardingMutation.isPending}
            >
              {createOffboardingMutation.isPending ? 'Initiating...' : 'Initiate Case'}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* GRATUITY ESTIMATOR MODAL */}
      <Dialog
        isOpen={isGratuityEstimatorOpen}
        onClose={() => {
          setIsGratuityEstimatorOpen(false);
          setEstimateResult(null);
        }}
        title="Statutory Gratuity Calculator (Act No. 12 of 1983)"
        description="Simulate and test statutory gratuity eligibility and payout."
        maxWidth="md"
      >
        <form onSubmit={handleRunGratuityEstimate} className="space-y-4 text-xs">
          <div>
            <Label htmlFor="estEmp">Employee *</Label>
            <Select
              id="estEmp"
              required
              value={estimateEmpId}
              onChange={(e) => setEstimateEmpId(e.target.value)}
              
            >
              <option value="">Select Employee</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.displayName} ({emp.employeeNumber}) — Hire Date: {emp.hireDate}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <Label htmlFor="estDate">Projected Last Working Date *</Label>
            <Input
              id="estDate"
              type="date"
              required
              value={estimateLastDate}
              onChange={(e) => setEstimateLastDate(e.target.value)}
            />
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              variant="primary-pill"
              size="sm"
              disabled={calculateGratuityMutation.isPending}
            >
              {calculateGratuityMutation.isPending ? 'Calculating...' : 'Run Simulation'}
            </Button>
          </div>

          {/* Results Box */}
          {estimateResult && (
            <div className="mt-4 p-4 rounded-none border border-hairline bg-canvas-lavender/30 space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-ink">Statutory Eligibility:</span>
                {estimateResult.isEligible ? (
                  <span className="rounded-none bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                    ELIGIBLE (≥ 5 YEARS)
                  </span>
                ) : (
                  <span className="rounded-none bg-red-50 px-2 py-0.5 text-[10px] font-bold text-red-700 border border-red-200">
                    NOT ELIGIBLE (&lt; 5 YEARS)
                  </span>
                )}
              </div>

              <div className="border-t border-hairline pt-2 space-y-1 font-mono text-xs">
                <div className="flex justify-between">
                  <span className="font-sans text-ink-mute">Completed Service Tenure:</span>
                  <span className="font-bold text-ink">{estimateResult.completedYears} Completed Years</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-sans text-ink-mute">Eligible Basic Salary:</span>
                  <span className="font-bold text-ink">LKR {Number(estimateResult.eligibleSalaryBase).toLocaleString('en-LK')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-sans text-ink-mute">Statutory Factor:</span>
                  <span className="font-bold text-purple-700">0.5 Month / Year</span>
                </div>
              </div>

              <div className="rounded-none bg-purple-50 p-3 border border-purple-200 flex justify-between items-center font-mono">
                <span className="font-sans font-semibold text-purple-900 text-xs">ESTIMATED GRATUITY:</span>
                <span className="text-xl font-bold text-purple-900">
                  LKR {Number(estimateResult.gratuityAmount).toLocaleString('en-LK', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <p className="text-[11px] text-ink-mute">{estimateResult.details.remarks}</p>
            </div>
          )}
        </form>
      </Dialog>

      {/* VIEW STATEMENT VOUCHER MODAL */}
      <Dialog
        isOpen={!!viewingSettlement}
        onClose={() => setViewingSettlement(null)}
        title="Final Settlement Statement Voucher"
        description="Official confidential terminal remuneration voucher."
        maxWidth="lg"
      >
        {viewingSettlement && (
          <div className="space-y-5 text-xs border border-hairline p-5 rounded-none bg-canvas">
            {/* Header info */}
            <div className="flex justify-between items-start border-b border-hairline pb-4">
              <div>
                <h2 className="text-base font-bold text-ink">CEYLON HOLDINGS PLC</h2>
                <p className="text-[11px] text-ink-mute">Confidential Final Settlement Statement</p>
                <p className="text-[11px] font-mono text-ink-mute">Last Working Date: {viewingSettlement.lastWorkingDate}</p>
              </div>
              <div className="text-right">
                <div className="font-bold text-ink">{viewingSettlement.employee?.displayName}</div>
                <span className="font-mono text-[11px] text-ink-mute">{viewingSettlement.employee?.employeeNumber}</span>
              </div>
            </div>

            {/* 2-col Dues & Deductions */}
            <div className="grid grid-cols-2 gap-6">
              {/* Dues */}
              <div className="space-y-2">
                <h4 className="font-bold text-ink border-b border-hairline pb-1 text-[11px] uppercase">Terminal Dues</h4>
                <div className="space-y-1 font-mono">
                  <div className="flex justify-between">
                    <span className="font-sans text-ink">Salary Arrears (Final Period)</span>
                    <span className="text-ink">LKR {Number(viewingSettlement.salaryDue).toLocaleString('en-LK', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-sans text-ink">Overtime Dues</span>
                    <span className="text-ink">LKR {Number(viewingSettlement.overtimeDue).toLocaleString('en-LK', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-sans text-ink">Leave Encashment (Annual Leave)</span>
                    <span className="text-ink">LKR {Number(viewingSettlement.leaveEncashment).toLocaleString('en-LK', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between font-bold text-purple-700">
                    <span className="font-sans">Statutory Gratuity (Act 12/1983)</span>
                    <span>LKR {Number(viewingSettlement.gratuityAmount).toLocaleString('en-LK', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
                <div className="flex justify-between font-mono font-bold text-ink border-t border-hairline pt-2">
                  <span className="font-sans">Gross Terminal Dues</span>
                  <span>LKR {(Number(viewingSettlement.salaryDue) + Number(viewingSettlement.overtimeDue) + Number(viewingSettlement.leaveEncashment) + Number(viewingSettlement.gratuityAmount)).toLocaleString('en-LK', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>

              {/* Deductions */}
              <div className="space-y-2">
                <h4 className="font-bold text-ink border-b border-hairline pb-1 text-[11px] uppercase">Offset Deductions</h4>
                <div className="space-y-1 font-mono">
                  <div className="flex justify-between">
                    <span className="font-sans text-ink">Outstanding Staff Loans</span>
                    <span className="text-amber-700">LKR {Number(viewingSettlement.calculationSnapshot?.deductionsBreakdown?.outstandingLoans || 0).toLocaleString('en-LK', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-sans text-ink">Pending Salary Advances</span>
                    <span className="text-amber-700">LKR {Number(viewingSettlement.calculationSnapshot?.deductionsBreakdown?.salaryAdvances || 0).toLocaleString('en-LK', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-sans text-ink">Other Clearance Liabilities</span>
                    <span className="text-amber-700">LKR {Number(viewingSettlement.calculationSnapshot?.deductionsBreakdown?.otherDeductions || 0).toLocaleString('en-LK', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
                <div className="flex justify-between font-mono font-bold text-amber-700 border-t border-hairline pt-2">
                  <span className="font-sans">Total Deductions</span>
                  <span>LKR {Number(viewingSettlement.deductions).toLocaleString('en-LK', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>

            {/* Net Settlement Banner */}
            <div className="rounded-none bg-emerald-50 border border-emerald-200 p-4 flex justify-between items-center">
              <div>
                <span className="text-xs font-semibold text-emerald-800">NET SETTLEMENT REMUNERATION</span>
                <p className="text-[11px] text-emerald-600">Final disbursement voucher</p>
              </div>
              <span className="font-mono text-2xl font-bold text-emerald-800">
                LKR {Number(viewingSettlement.netSettlement).toLocaleString('en-LK', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                type="button"
                variant="primary-pill"
                size="sm"
                onClick={() => setViewingSettlement(null)}
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
};
