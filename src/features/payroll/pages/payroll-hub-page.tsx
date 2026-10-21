import { Select } from '../../../components/ui/select';
import React, { useState } from 'react';
import {
  Banknote,
  Calculator,
  CheckCircle2,
  FileCheck,
  Plus,
  Play,
  Layers,
  Landmark,
  ShieldCheck,
  Eye,
  FileText,
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Dialog } from '../../../components/ui/dialog';
import {
  usePayrollRuns,
  usePayrollRunDetail,
  useCreatePayrollRun,
  useCalculatePayrollRun,
  useApproveHrPayrollRun,
  useApproveFinancePayrollRun,
  useFinalizePayrollRun,
  usePayslips,
  usePayrollBankBatches,
  useStatutoryRules,
} from '../data/payroll-data';
import { useLegalEntities } from '../../organization/data/organization-data';
import { cn } from '../../../lib/utils';
import { PayrollRunStatus, Payslip } from '../types/payroll';

export const PayrollHubPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'runs' | 'register' | 'payslips' | 'bank' | 'statutory'>('runs');
  const [selectedRunId, setSelectedRunId] = useState<string>('');
  const [viewingPayslip, setViewingPayslip] = useState<Payslip | null>(null);

  // Create Run Form
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [legalEntityId, setLegalEntityId] = useState('');
  const [periodStart, setPeriodStart] = useState('2026-09-01');
  const [periodEnd, setPeriodEnd] = useState('2026-09-30');
  const [payDate, setPayDate] = useState('2026-09-28');

  // Queries
  const { data: runsData, isLoading: runsLoading } = usePayrollRuns();
  const { data: runDetail, isLoading: detailLoading } = usePayrollRunDetail(selectedRunId);
  const { data: payslips = [], isLoading: payslipsLoading } = usePayslips();
  const { data: bankBatches = [], isLoading: bankLoading } = usePayrollBankBatches();
  const { data: statutoryData } = useStatutoryRules();
  const { data: legalEntitiesData } = useLegalEntities();

  const legalEntities = legalEntitiesData?.data || [];
  const runs = runsData?.data || [];
  const activeRun = runDetail || runs[0];

  // Mutations
  const createRunMutation = useCreatePayrollRun();
  const calculateMutation = useCalculatePayrollRun();
  const approveHrMutation = useApproveHrPayrollRun();
  const approveFinanceMutation = useApproveFinancePayrollRun();
  const finalizeMutation = useFinalizePayrollRun();

  const handleCreateRun = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!legalEntityId) return;
    try {
      // Find pay group or fallback dummy
      const le = legalEntities.find((l) => l.id === legalEntityId);
      if (!le) return;

      await createRunMutation.mutateAsync({
        legalEntityId,
        payGroupId: legalEntityId, // standard group
        periodStart,
        periodEnd,
        payDate,
      });
      setIsCreateOpen(false);
    } catch (err) {
      console.error('Failed to create payroll run', err);
    }
  };

  const getStatusBadge = (status: PayrollRunStatus) => {
    switch (status) {
      case 'draft':
        return <span className="rounded-none bg-canvas-soft px-2 py-0.5 text-[10px] font-bold text-ink uppercase">Draft</span>;
      case 'calculated':
        return <span className="rounded-none bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700 border border-blue-200 uppercase">Calculated</span>;
      case 'hr_reviewed':
        return <span className="rounded-none bg-purple-50 px-2 py-0.5 text-[10px] font-bold text-purple-700 border border-purple-200 uppercase">HR Reviewed</span>;
      case 'finance_approved':
        return <span className="rounded-none bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700 border border-amber-200 uppercase">Finance Approved</span>;
      case 'finalized':
        return <span className="rounded-none bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200 uppercase">Finalized & Locked</span>;
      default:
        return <span className="rounded-none bg-canvas-soft px-2 py-0.5 text-[10px] font-bold text-ink uppercase">{status}</span>;
    }
  };

  // KPIs
  const latestRun = runs[0];
  const totalNetPayout = latestRun ? Number(latestRun.totalNet) : 0;
  const totalEmployerCost = latestRun ? Number(latestRun.totalEmployerCost) : 0;
  const totalDeductions = latestRun ? Number(latestRun.totalDeductions) : 0;
  const totalGross = latestRun ? Number(latestRun.totalGross) : 0;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-5 border-b border-hairline">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold tracking-tight text-ink">Sri Lanka Statutory Payroll & Runs</h1>
          <p className="text-sm text-muted mt-1">Sri Lanka EPF, ETF, and APIT automated payroll runs and payslips.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <Button
            variant="primary-pill"
            size="sm"
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-1.5"
          >
            <Plus className="h-4 w-4" />
            <span>New Monthly Run</span>
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-none border border-hairline bg-canvas p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted">Monthly Net Payout</span>
            <Banknote className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="mt-2 text-xl sm:text-2xl font-bold text-emerald-700 tracking-tight">
            LKR {totalNetPayout.toLocaleString('en-LK', { minimumFractionDigits: 2 })}
          </p>
          <span className="text-[11px] text-muted">{latestRun?.runNumber || 'Current Period'}</span>
        </div>

        <div className="rounded-none border border-hairline bg-canvas p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted">Gross Earnings</span>
            <Calculator className="h-4 w-4 text-primary" />
          </div>
          <p className="mt-2 text-xl sm:text-2xl font-bold text-ink tracking-tight">
            LKR {totalGross.toLocaleString('en-LK', { minimumFractionDigits: 2 })}
          </p>
          <span className="text-[11px] text-muted">Basic + Allowances</span>
        </div>

        <div className="rounded-none border border-hairline bg-canvas p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted">Statutory Deductions (EPF/APIT)</span>
            <ShieldCheck className="h-4 w-4 text-amber-600" />
          </div>
          <p className="mt-2 text-xl sm:text-2xl font-bold text-amber-700 tracking-tight">
            LKR {totalDeductions.toLocaleString('en-LK', { minimumFractionDigits: 2 })}
          </p>
          <span className="text-[11px] text-muted">Employee 8% EPF + Tax</span>
        </div>

        <div className="rounded-none border border-hairline bg-canvas p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted">Total Employer Cost</span>
            <Landmark className="h-4 w-4 text-purple-600" />
          </div>
          <p className="mt-2 text-xl sm:text-2xl font-bold text-purple-700 tracking-tight">
            LKR {totalEmployerCost.toLocaleString('en-LK', { minimumFractionDigits: 2 })}
          </p>
          <span className="text-[11px] text-muted">Gross + 12% EPF + 3% ETF</span>
        </div>
      </div>

      {/* Navigation Tab Bar */}
      <div className="flex items-center gap-2 overflow-x-auto border-b border-[#e6e6e6] pb-0 mb-6 scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveTab('runs')}
          className={cn(
            'inline-flex items-center gap-2 rounded-none px-3.5 py-2 text-sm font-medium whitespace-nowrap transition-colors cursor-pointer select-none',
            activeTab === 'runs'
              ? 'bg-[#1c69d4]/10 text-[#1c69d4] font-bold border-b-2 border-[#1c69d4] rounded-none'
              : 'bg-transparent text-[#6b6b6b] hover:bg-[#f7f7f7] hover:text-[#262626] border-b-2 border-transparent font-normal rounded-none',
          )}
        >
          <Calculator className="h-4 w-4" />
          <span>Monthly Payroll Runs ({runs.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('register')}
          className={cn(
            'inline-flex items-center gap-2 rounded-none px-3.5 py-2 text-sm font-medium whitespace-nowrap transition-colors cursor-pointer select-none',
            activeTab === 'register'
              ? 'bg-[#1c69d4]/10 text-[#1c69d4] font-bold border-b-2 border-[#1c69d4] rounded-none'
              : 'bg-transparent text-[#6b6b6b] hover:bg-[#f7f7f7] hover:text-[#262626] border-b-2 border-transparent font-normal rounded-none',
          )}
        >
          <Layers className="h-4 w-4" />
          <span>Master Pay Register</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('payslips')}
          className={cn(
            'inline-flex items-center gap-2 rounded-none px-3.5 py-2 text-sm font-medium whitespace-nowrap transition-colors cursor-pointer select-none',
            activeTab === 'payslips'
              ? 'bg-[#1c69d4]/10 text-[#1c69d4] font-bold border-b-2 border-[#1c69d4] rounded-none'
              : 'bg-transparent text-[#6b6b6b] hover:bg-[#f7f7f7] hover:text-[#262626] border-b-2 border-transparent font-normal rounded-none',
          )}
        >
          <FileText className="h-4 w-4" />
          <span>Digital Payslips ({payslips.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('bank')}
          className={cn(
            'inline-flex items-center gap-2 rounded-none px-3.5 py-2 text-sm font-medium whitespace-nowrap transition-colors cursor-pointer select-none',
            activeTab === 'bank'
              ? 'bg-[#1c69d4]/10 text-[#1c69d4] font-bold border-b-2 border-[#1c69d4] rounded-none'
              : 'bg-transparent text-[#6b6b6b] hover:bg-[#f7f7f7] hover:text-[#262626] border-b-2 border-transparent font-normal rounded-none',
          )}
        >
          <Landmark className="h-4 w-4" />
          <span>Bank SLIPS Batches ({bankBatches.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('statutory')}
          className={cn(
            'inline-flex items-center gap-2 rounded-none px-3.5 py-2 text-sm font-medium whitespace-nowrap transition-colors cursor-pointer select-none',
            activeTab === 'statutory'
              ? 'bg-[#1c69d4]/10 text-[#1c69d4] font-bold border-b-2 border-[#1c69d4] rounded-none'
              : 'bg-transparent text-[#6b6b6b] hover:bg-[#f7f7f7] hover:text-[#262626] border-b-2 border-transparent font-normal rounded-none',
          )}
        >
          <ShieldCheck className="h-4 w-4" />
          <span>Statutory APIT & EPF Rules</span>
        </button>
      </div>

      {/* TAB 1: PAYROLL RUNS */}
      {activeTab === 'runs' && (
        <div className="overflow-hidden rounded-none border border-hairline bg-canvas ">
          {runsLoading ? (
            <div className="flex h-48 items-center justify-center">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : runs.length === 0 ? (
            <div className="p-12 text-center">
              <Calculator className="mx-auto h-8 w-8 text-ink-mute/50" />
              <h3 className="mt-3 text-sm font-semibold text-ink">No payroll runs found</h3>
              <p className="mt-1 text-xs text-ink-mute">
                Use "New Monthly Run" to initialize a payroll period.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-hairline bg-canvas-lavender/30 text-[11px] font-semibold uppercase text-ink-mute">
                  <tr>
                    <th className="py-3 pl-4 pr-3">Run Number</th>
                    <th className="px-3 py-3">Period</th>
                    <th className="px-3 py-3">Pay Date</th>
                    <th className="px-3 py-3">Gross Total</th>
                    <th className="px-3 py-3">Net Payout</th>
                    <th className="px-3 py-3">Employer Cost</th>
                    <th className="px-3 py-3">Status</th>
                    <th className="py-3 pl-3 pr-4 text-right">Pipeline Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hairline">
                  {runs.map((r) => (
                    <tr key={r.id} className="hover:bg-canvas-soft/30 transition-colors">
                      <td className="py-3 pl-4 pr-3 font-mono font-bold text-ink">
                        {r.runNumber}
                      </td>
                      <td className="px-3 py-3 text-ink">
                        {r.periodStart} — {r.periodEnd}
                      </td>
                      <td className="px-3 py-3 font-mono text-ink">
                        {r.payDate}
                      </td>
                      <td className="px-3 py-3 font-mono text-ink">
                        LKR {Number(r.totalGross).toLocaleString('en-LK', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-3 py-3 font-mono font-bold text-emerald-700">
                        LKR {Number(r.totalNet).toLocaleString('en-LK', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-3 py-3 font-mono text-purple-700">
                        LKR {Number(r.totalEmployerCost).toLocaleString('en-LK', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-3 py-3">
                        {getStatusBadge(r.status)}
                      </td>
                      <td className="py-3 pl-3 pr-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {r.status === 'draft' && (
                            <Button
                              variant="primary-pill"
                              size="sm"
                              onClick={() => calculateMutation.mutate(r.id)}
                              disabled={calculateMutation.isPending}
                              className="h-7 text-[11px] px-2.5 flex items-center gap-1"
                            >
                              <Play className="h-3 w-3" />
                              Calculate
                            </Button>
                          )}
                          {r.status === 'calculated' && (
                            <Button
                              variant="primary-pill"
                              size="sm"
                              onClick={() => approveHrMutation.mutate(r.id)}
                              disabled={approveHrMutation.isPending}
                              className="h-7 text-[11px] px-2.5 flex items-center gap-1"
                            >
                              <CheckCircle2 className="h-3 w-3" />
                              HR Review
                            </Button>
                          )}
                          {r.status === 'hr_reviewed' && (
                            <Button
                              variant="primary-pill"
                              size="sm"
                              onClick={() => approveFinanceMutation.mutate(r.id)}
                              disabled={approveFinanceMutation.isPending}
                              className="h-7 text-[11px] px-2.5 flex items-center gap-1"
                            >
                              <CheckCircle2 className="h-3 w-3" />
                              Finance Approve
                            </Button>
                          )}
                          {r.status === 'finance_approved' && (
                            <Button
                              variant="primary-pill"
                              size="sm"
                              onClick={() => finalizeMutation.mutate(r.id)}
                              disabled={finalizeMutation.isPending}
                              className="h-7 text-[11px] px-2.5 flex items-center gap-1 bg-emerald-700 hover:bg-emerald-800"
                            >
                              <FileCheck className="h-3 w-3" />
                              Finalize & Issue Payslips
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedRunId(r.id);
                              setActiveTab('register');
                            }}
                            className="h-7 text-[11px] px-2"
                          >
                            Pay Register
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

      {/* TAB 2: EMPLOYEE PAY REGISTER */}
      {activeTab === 'register' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-none border border-hairline bg-canvas p-4 ">
            <div>
              <span className="text-xs text-ink-mute">Active Payroll Run:</span>
              <div className="font-bold text-ink text-sm">
                {activeRun?.runNumber} ({activeRun?.periodStart} to {activeRun?.periodEnd})
              </div>
            </div>
            <div>
              {activeRun && getStatusBadge(activeRun.status)}
            </div>
          </div>

          <div className="overflow-hidden rounded-none border border-hairline bg-canvas ">
            {detailLoading ? (
              <div className="flex h-48 items-center justify-center">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
            ) : !activeRun?.employees || activeRun.employees.length === 0 ? (
              <div className="p-12 text-center">
                <Calculator className="mx-auto h-8 w-8 text-ink-mute/50" />
                <h3 className="mt-3 text-sm font-semibold text-ink">No calculation results available</h3>
                <p className="mt-1 text-xs text-ink-mute">
                  Click "Calculate" on the payroll run to execute statutory formulas.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-hairline bg-canvas-lavender/30 text-[11px] font-semibold uppercase text-ink-mute">
                    <tr>
                      <th className="py-3 pl-4 pr-3">Employee</th>
                      <th className="px-3 py-3">Base Salary</th>
                      <th className="px-3 py-3">Gross Pay</th>
                      <th className="px-3 py-3">EPF 8% (EE)</th>
                      <th className="px-3 py-3">APIT Tax</th>
                      <th className="px-3 py-3">Net Pay</th>
                      <th className="px-3 py-3">EPF 12% (ER)</th>
                      <th className="px-3 py-3">ETF 3% (ER)</th>
                      <th className="py-3 pl-3 pr-4">Total Cost</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-hairline font-mono">
                    {activeRun.employees.map((e) => {
                      const epfEe = e.items?.find((i) => i.itemCode === 'EPF_EE_8')?.amount || 0;
                      const apit = e.items?.find((i) => i.itemCode === 'APIT_TAX')?.amount || 0;
                      const epfEr = e.items?.find((i) => i.itemCode === 'EPF_ER_12')?.amount || 0;
                      const etfEr = e.items?.find((i) => i.itemCode === 'ETF_ER_3')?.amount || 0;

                      return (
                        <tr key={e.id} className="hover:bg-canvas-soft/30 transition-colors">
                          <td className="py-3 pl-4 pr-3 font-sans">
                            <div className="font-semibold text-ink">{e.employee?.displayName}</div>
                            <span className="font-mono text-[11px] text-ink-mute">{e.employee?.employeeNumber}</span>
                          </td>
                          <td className="px-3 py-3 text-ink">
                            {Number(e.baseSalary).toLocaleString('en-LK')}
                          </td>
                          <td className="px-3 py-3 font-bold text-ink">
                            {Number(e.grossPay).toLocaleString('en-LK')}
                          </td>
                          <td className="px-3 py-3 text-amber-700">
                            {Number(epfEe).toLocaleString('en-LK')}
                          </td>
                          <td className="px-3 py-3 text-red-700">
                            {Number(apit).toLocaleString('en-LK')}
                          </td>
                          <td className="px-3 py-3 font-bold text-emerald-700">
                            {Number(e.netPay).toLocaleString('en-LK')}
                          </td>
                          <td className="px-3 py-3 text-purple-700">
                            {Number(epfEr).toLocaleString('en-LK')}
                          </td>
                          <td className="px-3 py-3 text-purple-700">
                            {Number(etfEr).toLocaleString('en-LK')}
                          </td>
                          <td className="py-3 pl-3 pr-4 font-bold text-ink">
                            {Number(e.employerCost).toLocaleString('en-LK')}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: DIGITAL PAYSLIPS */}
      {activeTab === 'payslips' && (
        <div className="overflow-hidden rounded-none border border-hairline bg-canvas ">
          {payslipsLoading ? (
            <div className="flex h-48 items-center justify-center">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : payslips.length === 0 ? (
            <div className="p-12 text-center">
              <FileText className="mx-auto h-8 w-8 text-ink-mute/50" />
              <h3 className="mt-3 text-sm font-semibold text-ink">No payslips issued yet</h3>
              <p className="mt-1 text-xs text-ink-mute">
                Finalizing a payroll run generates digital payslips automatically.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-hairline bg-canvas-lavender/30 text-[11px] font-semibold uppercase text-ink-mute">
                  <tr>
                    <th className="py-3 pl-4 pr-3">Employee</th>
                    <th className="px-3 py-3">Period</th>
                    <th className="px-3 py-3">Gross Earnings</th>
                    <th className="px-3 py-3">Deductions</th>
                    <th className="px-3 py-3">Net Payout</th>
                    <th className="px-3 py-3">Generated At</th>
                    <th className="py-3 pl-3 pr-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hairline">
                  {payslips.map((ps) => (
                    <tr key={ps.id} className="hover:bg-canvas-soft/30 transition-colors">
                      <td className="py-3 pl-4 pr-3">
                        <div className="font-semibold text-ink">{ps.payrollRunEmployee?.employee?.displayName}</div>
                        <span className="font-mono text-[11px] text-ink-mute">{ps.payrollRunEmployee?.employee?.employeeNumber}</span>
                      </td>
                      <td className="px-3 py-3 font-medium text-ink">
                        {ps.payrollRunEmployee?.payrollRun?.runNumber}
                      </td>
                      <td className="px-3 py-3 font-mono text-ink">
                        LKR {Number(ps.payrollRunEmployee?.grossPay || 0).toLocaleString('en-LK', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-3 py-3 font-mono text-amber-700">
                        LKR {Number(ps.payrollRunEmployee?.totalDeductions || 0).toLocaleString('en-LK', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-3 py-3 font-mono font-bold text-emerald-700">
                        LKR {Number(ps.payrollRunEmployee?.netPay || 0).toLocaleString('en-LK', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-3 py-3 font-mono text-[11px] text-ink-mute">
                        {new Date(ps.generatedAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 pl-3 pr-4 text-right">
                        <Button
                          variant="secondary-pill"
                          size="sm"
                          onClick={() => setViewingPayslip(ps)}
                          className="h-7 text-[11px] px-2.5 flex items-center gap-1"
                        >
                          <Eye className="h-3 w-3" />
                          View Payslip
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: BANK TRANSFERS */}
      {activeTab === 'bank' && (
        <div className="overflow-hidden rounded-none border border-hairline bg-canvas ">
          {bankLoading ? (
            <div className="flex h-48 items-center justify-center">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : bankBatches.length === 0 ? (
            <div className="p-12 text-center">
              <Landmark className="mx-auto h-8 w-8 text-ink-mute/50" />
              <h3 className="mt-3 text-sm font-semibold text-ink">No bank transfer batches</h3>
              <p className="mt-1 text-xs text-ink-mute">
                Finalized runs automatically generate SLIPS / CEFTS bank file batches.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-hairline bg-canvas-lavender/30 text-[11px] font-semibold uppercase text-ink-mute">
                  <tr>
                    <th className="py-3 pl-4 pr-3">Batch Reference</th>
                    <th className="px-3 py-3">Payroll Run</th>
                    <th className="px-3 py-3">Format</th>
                    <th className="px-3 py-3">Item Count</th>
                    <th className="px-3 py-3">Total Amount</th>
                    <th className="px-3 py-3">Status</th>
                    <th className="py-3 pl-3 pr-4 font-mono text-[11px]">Generated Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hairline">
                  {bankBatches.map((b) => (
                    <tr key={b.id} className="hover:bg-canvas-soft/30 transition-colors">
                      <td className="py-3 pl-4 pr-3 font-mono font-bold text-ink">
                        {b.reconciliationReference}
                      </td>
                      <td className="px-3 py-3 font-medium text-ink">
                        {b.payrollRun?.runNumber}
                      </td>
                      <td className="px-3 py-3">
                        <span className="rounded bg-canvas-soft px-2 py-0.5 font-mono text-[10px] font-bold text-ink">
                          {b.formatCode}
                        </span>
                      </td>
                      <td className="px-3 py-3 font-medium text-ink">
                        {b.itemCount} Accounts
                      </td>
                      <td className="px-3 py-3 font-mono font-bold text-emerald-700">
                        LKR {Number(b.totalAmount).toLocaleString('en-LK', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-3 py-3">
                        <span className="rounded-none bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200 uppercase">
                          {b.status}
                        </span>
                      </td>
                      <td className="py-3 pl-3 pr-4 font-mono text-[11px] text-ink-mute">
                        {new Date(b.generatedAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 5: STATUTORY RULES & APIT SLABS */}
      {activeTab === 'statutory' && (
        <div className="space-y-6">
          {/* EPF & ETF Rule Card */}
          <div className="rounded-none border border-hairline bg-canvas p-5  space-y-4">
            <div className="flex items-center justify-between border-b border-hairline pb-3">
              <div>
                <h3 className="font-bold text-ink text-sm">Employees' Provident Fund & Employees' Trust Fund (EPF/ETF)</h3>
                <p className="text-xs text-ink-mute">Sri Lanka Department of Labour & Central Bank statutory requirements</p>
              </div>
              <span className="rounded bg-emerald-100/70 px-2.5 py-1 text-xs font-bold text-emerald-800">
                Effective 2026.1
              </span>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-none bg-canvas-lavender/30 p-4 border border-hairline">
                <span className="text-xs font-medium text-ink-mute">EPF Employee Contribution</span>
                <p className="mt-1 text-2xl font-bold text-ink">8.0%</p>
                <span className="text-[11px] text-ink-mute">Deducted from gross EPF base</span>
              </div>

              <div className="rounded-none bg-canvas-lavender/30 p-4 border border-hairline">
                <span className="text-xs font-medium text-ink-mute">EPF Employer Contribution</span>
                <p className="mt-1 text-2xl font-bold text-purple-700">12.0%</p>
                <span className="text-[11px] text-purple-600">Company statutory cost</span>
              </div>

              <div className="rounded-none bg-canvas-lavender/30 p-4 border border-hairline">
                <span className="text-xs font-medium text-ink-mute">ETF Employer Contribution</span>
                <p className="mt-1 text-2xl font-bold text-purple-700">3.0%</p>
                <span className="text-[11px] text-purple-600">Trust Fund contribution</span>
              </div>
            </div>
          </div>

          {/* APIT Slabs Card */}
          <div className="rounded-none border border-hairline bg-canvas p-5  space-y-4">
            <div className="flex items-center justify-between border-b border-hairline pb-3">
              <div>
                <h3 className="font-bold text-ink text-sm">Advance Personal Income Tax (APIT) Schedule</h3>
                <p className="text-xs text-ink-mute">Inland Revenue Department progressive tax brackets</p>
              </div>
              <span className="rounded bg-blue-100/70 px-2.5 py-1 text-xs font-bold text-blue-800">
                Tax Year 2026/2027
              </span>
            </div>

            <div className="rounded-none bg-canvas-lavender/30 p-3 text-xs flex justify-between items-center border border-hairline">
              <span className="font-semibold text-ink">Monthly Tax-Free Personal Relief:</span>
              <span className="font-mono font-bold text-emerald-700">LKR 100,000.00 / month</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-hairline bg-canvas-lavender/30 text-[11px] font-semibold uppercase text-ink-mute">
                  <tr>
                    <th className="py-2.5 pl-3 pr-2">Slab Sequence</th>
                    <th className="px-2 py-2.5">Monthly Taxable Income Range (Above Relief)</th>
                    <th className="px-2 py-2.5">Tax Rate</th>
                    <th className="py-2.5 pl-2 pr-3 text-right">Max Tax in Slab</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hairline font-mono">
                  {statutoryData?.taxTables?.[0]?.brackets?.map((b) => (
                    <tr key={b.id} className="hover:bg-canvas-soft/30">
                      <td className="py-2 pl-3 pr-2 font-sans font-medium text-ink">
                        Slab {b.sequence}
                      </td>
                      <td className="px-2 py-2 text-ink">
                        LKR {Number(b.lowerBound).toLocaleString('en-LK')} {b.upperBound ? `— LKR ${Number(b.upperBound).toLocaleString('en-LK')}` : 'and above'}
                      </td>
                      <td className="px-2 py-2 font-bold text-primary">
                        {(Number(b.rate) * 100).toFixed(0)}%
                      </td>
                      <td className="py-2 pl-2 pr-3 text-right text-ink-mute">
                        {b.upperBound ? `LKR ${(Math.round((Number(b.upperBound) - Number(b.lowerBound)) * Number(b.rate))).toLocaleString('en-LK')}` : 'Remaining balance'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* CREATE PAYROLL RUN MODAL */}
      <Dialog
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Initialize Monthly Payroll Run"
        description="Initialize payroll period."
        maxWidth="md"
      >
        <form onSubmit={handleCreateRun} className="space-y-4 text-xs">
          <div>
            <Label htmlFor="legalEntityId">Legal Entity *</Label>
            <Select
              id="legalEntityId"
              required
              value={legalEntityId}
              onChange={(e) => setLegalEntityId(e.target.value)}
              
            >
              <option value="">Select Entity</option>
              {legalEntities.map((le) => (
                <option key={le.id} value={le.id}>
                  {le.displayName} ({le.code})
                </option>
              ))}
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="periodStart">Period Start *</Label>
              <Input
                id="periodStart"
                type="date"
                required
                value={periodStart}
                onChange={(e) => setPeriodStart(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="periodEnd">Period End *</Label>
              <Input
                id="periodEnd"
                type="date"
                required
                value={periodEnd}
                onChange={(e) => setPeriodEnd(e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="payDate">Scheduled Pay Date *</Label>
            <Input
              id="payDate"
              type="date"
              required
              value={payDate}
              onChange={(e) => setPayDate(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-hairline">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsCreateOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary-pill"
              size="sm"
              disabled={createRunMutation.isPending}
            >
              {createRunMutation.isPending ? 'Creating...' : 'Initialize Run'}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* VIEW PAYSLIP MODAL */}
      <Dialog
        isOpen={!!viewingPayslip}
        onClose={() => setViewingPayslip(null)}
        title="Employee Payslip"
        description="Salary advice voucher."
        maxWidth="lg"
      >
        {viewingPayslip && (
          <div className="space-y-5 text-xs border border-hairline p-5 rounded-none bg-canvas">
            {/* Header info */}
            <div className="flex justify-between items-start border-b border-hairline pb-4">
              <div>
                <h2 className="text-base font-bold text-ink">CEYLON HOLDINGS PLC</h2>
                <p className="text-[11px] text-ink-mute">Confidential Salary Statement</p>
                <p className="text-[11px] font-mono text-ink-mute">Period: {viewingPayslip.payrollRunEmployee?.payrollRun?.runNumber}</p>
              </div>
              <div className="text-right">
                <div className="font-bold text-ink">{viewingPayslip.payrollRunEmployee?.employee?.displayName}</div>
                <span className="font-mono text-[11px] text-ink-mute">{viewingPayslip.payrollRunEmployee?.employee?.employeeNumber}</span>
              </div>
            </div>

            {/* Earnings and Deductions 2-col */}
            <div className="grid grid-cols-2 gap-6">
              {/* Earnings */}
              <div className="space-y-2">
                <h4 className="font-bold text-ink border-b border-hairline pb-1 text-[11px] uppercase">Gross Earnings</h4>
                <div className="space-y-1">
                  {viewingPayslip.payrollRunEmployee?.items
                    ?.filter((i) => i.itemType === 'earning')
                    .map((i) => (
                      <div key={i.id} className="flex justify-between font-mono">
                        <span className="font-sans text-ink">{i.itemName}</span>
                        <span className="text-ink">LKR {Number(i.amount).toLocaleString('en-LK', { minimumFractionDigits: 2 })}</span>
                      </div>
                    ))}
                </div>
                <div className="flex justify-between font-mono font-bold text-ink border-t border-hairline pt-2">
                  <span className="font-sans">Total Earnings</span>
                  <span>LKR {Number(viewingPayslip.payrollRunEmployee?.grossPay).toLocaleString('en-LK', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>

              {/* Deductions */}
              <div className="space-y-2">
                <h4 className="font-bold text-ink border-b border-hairline pb-1 text-[11px] uppercase">Deductions</h4>
                <div className="space-y-1">
                  {viewingPayslip.payrollRunEmployee?.items
                    ?.filter((i) => i.itemType === 'deduction')
                    .map((i) => (
                      <div key={i.id} className="flex justify-between font-mono">
                        <span className="font-sans text-ink">{i.itemName}</span>
                        <span className="text-amber-700">LKR {Number(i.amount).toLocaleString('en-LK', { minimumFractionDigits: 2 })}</span>
                      </div>
                    ))}
                </div>
                <div className="flex justify-between font-mono font-bold text-amber-700 border-t border-hairline pt-2">
                  <span className="font-sans">Total Deductions</span>
                  <span>LKR {Number(viewingPayslip.payrollRunEmployee?.totalDeductions).toLocaleString('en-LK', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>

            {/* Net Payout Banner */}
            <div className="rounded-none bg-emerald-50 border border-emerald-200 p-4 flex justify-between items-center">
              <div>
                <span className="text-xs font-semibold text-emerald-800">NET REMUNERATION (PAYABLE)</span>
                <p className="text-[11px] text-emerald-600">Disbursed via direct SLIPS bank transfer</p>
              </div>
              <span className="font-mono text-2xl font-bold text-emerald-800">
                LKR {Number(viewingPayslip.payrollRunEmployee?.netPay).toLocaleString('en-LK', { minimumFractionDigits: 2 })}
              </span>
            </div>

            {/* Employer Contributions Box */}
            <div className="border-t border-hairline pt-3 flex justify-between text-[11px] text-ink-mute font-mono">
              <span>EPF Employer (12%): LKR {Number(viewingPayslip.payrollRunEmployee?.items?.find((i) => i.itemCode === 'EPF_ER_12')?.amount || 0).toLocaleString('en-LK')}</span>
              <span>ETF Employer (3%): LKR {Number(viewingPayslip.payrollRunEmployee?.items?.find((i) => i.itemCode === 'ETF_ER_3')?.amount || 0).toLocaleString('en-LK')}</span>
              <span>Total Employer Cost: LKR {Number(viewingPayslip.payrollRunEmployee?.employerCost).toLocaleString('en-LK')}</span>
            </div>

            {/* Verification Checksum */}
            <div className="text-[10px] font-mono text-ink-mute/60 truncate border-t border-hairline pt-2">
              Verification SHA-256 Checksum: {viewingPayslip.checksum}
            </div>

            <div className="flex justify-end pt-2">
              <Button
                type="button"
                variant="primary-pill"
                size="sm"
                onClick={() => setViewingPayslip(null)}
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
