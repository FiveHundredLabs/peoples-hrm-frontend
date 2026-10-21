import { Select } from '../../../components/ui/select';
import React, { useState } from 'react';
import {
  CheckCircle2,
  Clock,
  Coins,
  FileCheck,
  Layers,
  Plus,
  Receipt,
  ShieldCheck,
  Trash2,
  Wallet,
  XCircle,
  Eye,
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Textarea } from '../../../components/ui/textarea';
import { Label } from '../../../components/ui/label';
import { Dialog } from '../../../components/ui/dialog';
import {
  useLoanTypes,
  useEmployeeLoans,
  useEmployeeLoanDetail,
  useCreateLoanRequest,
  useApproveLoan,
  useRejectLoan,
  useSalaryAdvances,
  useCreateSalaryAdvance,
  useApproveSalaryAdvance,
  useRejectSalaryAdvance,
  useExpensePolicies,
  useExpenseClaims,
  useExpenseClaimDetail,
  useCreateExpenseClaim,
  useApproveExpenseClaim,
  useRejectExpenseClaim,
  useReimburseExpenseClaim,
} from '../data/expenses-and-loans-data';
import { useEmployees } from '../../employee/data/employee-data';
import { cn } from '../../../lib/utils';
import { LoanStatus, ExpenseClaimStatus } from '../types/expenses-and-loans';

export const ExpensesLoansHubPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'loans' | 'schedules' | 'advances' | 'expenses' | 'policies'>('loans');
  const [selectedLoanId, setSelectedLoanId] = useState<string>('');
  const [selectedClaimId, setSelectedClaimId] = useState<string>('');

  // Dialog states
  const [isLoanModalOpen, setIsLoanModalOpen] = useState(false);
  const [isAdvanceModalOpen, setIsAdvanceModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);

  // Queries
  const { data: loansData, isLoading: loansLoading } = useEmployeeLoans();
  const { data: loanDetail, isLoading: loanDetailLoading } = useEmployeeLoanDetail(selectedLoanId);
  const { data: loanTypes = [] } = useLoanTypes();
  const { data: advances = [], isLoading: advancesLoading } = useSalaryAdvances();
  const { data: claimsData, isLoading: claimsLoading } = useExpenseClaims();
  const { data: claimDetail, isLoading: claimDetailLoading } = useExpenseClaimDetail(selectedClaimId);
  const { data: expensePolicies = [] } = useExpensePolicies();
  const { data: employeesData } = useEmployees({ limit: 100 });

  const employees = employeesData?.data || [];
  const loans = loansData?.data || [];
  const claims = claimsData?.data || [];
  const activeLoan = loanDetail || loans[0];

  // Mutations
  const createLoanMutation = useCreateLoanRequest();
  const approveLoanMutation = useApproveLoan();
  const rejectLoanMutation = useRejectLoan();

  const createAdvanceMutation = useCreateSalaryAdvance();
  const approveAdvanceMutation = useApproveSalaryAdvance();
  const rejectAdvanceMutation = useRejectSalaryAdvance();

  const createClaimMutation = useCreateExpenseClaim();
  const approveClaimMutation = useApproveExpenseClaim();
  const rejectClaimMutation = useRejectExpenseClaim();
  const reimburseClaimMutation = useReimburseExpenseClaim();

  // Loan Request Form State
  const [loanEmployeeId, setLoanEmployeeId] = useState('');
  const [loanTypeId, setLoanTypeId] = useState('');
  const [loanPrincipal, setLoanPrincipal] = useState(120000);
  const [loanTermMonths, setLoanTermMonths] = useState(12);
  const [loanStartsOn, setLoanStartsOn] = useState('2026-10-01');

  // Salary Advance Form State
  const [advEmployeeId, setAdvEmployeeId] = useState('');
  const [advAmount, setAdvAmount] = useState(25000);
  const [advRequestedOn, setAdvRequestedOn] = useState('2026-09-15');
  const [advDeductionDate, setAdvDeductionDate] = useState('2026-09-28');
  const [advReason, setAdvReason] = useState('Medical emergency allowance');

  // Expense Claim Form State
  const [expEmployeeId, setExpEmployeeId] = useState('');
  const [expItems, setExpItems] = useState([
    {
      expenseDate: '2026-09-10',
      category: 'Travel & Transport',
      merchant: 'PickMe Sri Lanka',
      description: 'Client site visit transport in Colombo',
      amount: 4500,
    },
  ]);

  const handleAddExpenseItem = () => {
    setExpItems([
      ...expItems,
      {
        expenseDate: '2026-09-11',
        category: 'Meals & Subsistence',
        merchant: '',
        description: '',
        amount: 2500,
      },
    ]);
  };

  const handleRemoveExpenseItem = (index: number) => {
    setExpItems(expItems.filter((_, i) => i !== index));
  };

  const handleCreateLoan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loanEmployeeId || !loanTypeId) return;
    try {
      await createLoanMutation.mutateAsync({
        employeeId: loanEmployeeId,
        loanTypeId,
        principalAmount: Number(loanPrincipal),
        termMonths: Number(loanTermMonths),
        startsOn: loanStartsOn,
      });
      setIsLoanModalOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateAdvance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!advEmployeeId) return;
    try {
      await createAdvanceMutation.mutateAsync({
        employeeId: advEmployeeId,
        amount: Number(advAmount),
        requestedOn: advRequestedOn,
        deductionPayDate: advDeductionDate,
        reason: advReason,
      });
      setIsAdvanceModalOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateExpenseClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expEmployeeId || expItems.length === 0) return;
    try {
      await createClaimMutation.mutateAsync({
        employeeId: expEmployeeId,
        currency: 'LKR',
        items: expItems,
      });
      setIsExpenseModalOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  const getLoanStatusBadge = (status: LoanStatus) => {
    switch (status) {
      case 'draft':
        return <span className="rounded-none bg-canvas-soft px-2 py-0.5 text-[10px] font-bold text-ink uppercase">Draft</span>;
      case 'pending':
        return <span className="rounded-none bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700 border border-amber-200 uppercase">Pending</span>;
      case 'approved':
      case 'active':
        return <span className="rounded-none bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200 uppercase">Active</span>;
      case 'settled':
        return <span className="rounded-none bg-purple-50 px-2 py-0.5 text-[10px] font-bold text-purple-700 border border-purple-200 uppercase">Settled</span>;
      case 'rejected':
        return <span className="rounded-none bg-red-50 px-2 py-0.5 text-[10px] font-bold text-red-700 border border-red-200 uppercase">Rejected</span>;
      default:
        return <span className="rounded-none bg-canvas-soft px-2 py-0.5 text-[10px] font-bold text-ink uppercase">{status}</span>;
    }
  };

  const getExpenseStatusBadge = (status: ExpenseClaimStatus) => {
    switch (status) {
      case 'draft':
        return <span className="rounded-none bg-canvas-soft px-2 py-0.5 text-[10px] font-bold text-ink uppercase">Draft</span>;
      case 'submitted':
      case 'pending_approval':
        return <span className="rounded-none bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700 border border-amber-200 uppercase">Submitted</span>;
      case 'approved':
        return <span className="rounded-none bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700 border border-blue-200 uppercase">Approved</span>;
      case 'reimbursed':
        return <span className="rounded-none bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200 uppercase">Reimbursed</span>;
      case 'rejected':
        return <span className="rounded-none bg-red-50 px-2 py-0.5 text-[10px] font-bold text-red-700 border border-red-200 uppercase">Rejected</span>;
      default:
        return <span className="rounded-none bg-canvas-soft px-2 py-0.5 text-[10px] font-bold text-ink uppercase">{status}</span>;
    }
  };

  // KPIs
  const totalOutstandingLoans = loans.reduce((acc, l) => acc + Number(l.outstandingPrincipal || l.principalAmount || 0), 0);
  const activeLoansCount = loans.filter((l) => l.status === 'active' || l.status === 'approved').length;
  const pendingAdvancesCount = advances.filter((a) => a.status === 'pending').length;
  const pendingClaimsAmount = claims
    .filter((c) => c.status === 'submitted' || c.status === 'pending_approval')
    .reduce((acc, c) => acc + Number(c.totalAmount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-5 border-b border-hairline">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold tracking-tight text-ink">Expenses, Salary Advances & Staff Loans</h1>
          <p className="text-sm text-muted mt-1">Expense claims, festival advances, and staff loan disbursements.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAdvanceModalOpen(true)}
            className="flex items-center gap-1.5"
          >
            <Coins className="h-3.5 w-3.5" />
            <span>Salary Advance</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsExpenseModalOpen(true)}
            className="flex items-center gap-1.5"
          >
            <Receipt className="h-3.5 w-3.5" />
            <span>Submit Expense</span>
          </Button>
          <Button
            variant="primary-pill"
            size="sm"
            onClick={() => setIsLoanModalOpen(true)}
            className="flex items-center gap-1.5"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Request Loan</span>
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-none border border-hairline bg-canvas p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted">Total Outstanding Loans</span>
            <Wallet className="h-4 w-4 text-purple-600" />
          </div>
          <p className="mt-2 text-xl sm:text-2xl font-bold text-purple-700 tracking-tight">
            LKR {totalOutstandingLoans.toLocaleString('en-LK', { minimumFractionDigits: 2 })}
          </p>
          <span className="text-[11px] text-muted">{loans.length} Total Loans</span>
        </div>

        <div className="rounded-none border border-hairline bg-canvas p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted">Active Staff Loans</span>
            <Coins className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="mt-2 text-xl sm:text-2xl font-bold text-emerald-700 tracking-tight">
            {activeLoansCount} Active
          </p>
          <span className="text-[11px] text-muted">Payroll deducted monthly</span>
        </div>

        <div className="rounded-none border border-hairline bg-canvas p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted">Pending Salary Advances</span>
            <Clock className="h-4 w-4 text-amber-600" />
          </div>
          <p className="mt-2 text-xl sm:text-2xl font-bold text-amber-700 tracking-tight">
            {pendingAdvancesCount} Requests
          </p>
          <span className="text-[11px] text-muted">Awaiting HR approval</span>
        </div>

        <div className="rounded-none border border-hairline bg-canvas p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted">Pending Claims Amount</span>
            <Receipt className="h-4 w-4 text-primary" />
          </div>
          <p className="mt-2 text-xl sm:text-2xl font-bold text-ink tracking-tight">
            LKR {pendingClaimsAmount.toLocaleString('en-LK', { minimumFractionDigits: 2 })}
          </p>
          <span className="text-[11px] text-muted">Reimbursements pending</span>
        </div>
      </div>

      {/* Navigation Tab Bar */}
      <div className="flex items-center gap-2 overflow-x-auto border-b border-[#e6e6e6] pb-0 mb-6 scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveTab('loans')}
          className={cn(
            'inline-flex items-center gap-2 rounded-none px-3.5 py-2 text-sm font-medium whitespace-nowrap transition-colors cursor-pointer select-none',
            activeTab === 'loans'
              ? 'bg-[#1c69d4]/10 text-[#1c69d4] font-bold border-b-2 border-[#1c69d4] rounded-none'
              : 'bg-transparent text-[#6b6b6b] hover:bg-[#f7f7f7] hover:text-[#262626] border-b-2 border-transparent font-normal rounded-none',
          )}
        >
          <Coins className="h-4 w-4" />
          <span>Staff Loans ({loans.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('schedules')}
          className={cn(
            'inline-flex items-center gap-2 rounded-none px-3.5 py-2 text-sm font-medium whitespace-nowrap transition-colors cursor-pointer select-none',
            activeTab === 'schedules'
              ? 'bg-[#1c69d4]/10 text-[#1c69d4] font-bold border-b-2 border-[#1c69d4] rounded-none'
              : 'bg-transparent text-[#6b6b6b] hover:bg-[#f7f7f7] hover:text-[#262626] border-b-2 border-transparent font-normal rounded-none',
          )}
        >
          <Layers className="h-4 w-4" />
          <span>Repayment Schedules</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('advances')}
          className={cn(
            'inline-flex items-center gap-2 rounded-none px-3.5 py-2 text-sm font-medium whitespace-nowrap transition-colors cursor-pointer select-none',
            activeTab === 'advances'
              ? 'bg-[#1c69d4]/10 text-[#1c69d4] font-bold border-b-2 border-[#1c69d4] rounded-none'
              : 'bg-transparent text-[#6b6b6b] hover:bg-[#f7f7f7] hover:text-[#262626] border-b-2 border-transparent font-normal rounded-none',
          )}
        >
          <Wallet className="h-4 w-4" />
          <span>Salary Advances ({advances.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('expenses')}
          className={cn(
            'inline-flex items-center gap-2 rounded-none px-3.5 py-2 text-sm font-medium whitespace-nowrap transition-colors cursor-pointer select-none',
            activeTab === 'expenses'
              ? 'bg-[#1c69d4]/10 text-[#1c69d4] font-bold border-b-2 border-[#1c69d4] rounded-none'
              : 'bg-transparent text-[#6b6b6b] hover:bg-[#f7f7f7] hover:text-[#262626] border-b-2 border-transparent font-normal rounded-none',
          )}
        >
          <Receipt className="h-4 w-4" />
          <span>Expense Claims ({claims.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('policies')}
          className={cn(
            'inline-flex items-center gap-2 rounded-none px-3.5 py-2 text-sm font-medium whitespace-nowrap transition-colors cursor-pointer select-none',
            activeTab === 'policies'
              ? 'bg-[#1c69d4]/10 text-[#1c69d4] font-bold border-b-2 border-[#1c69d4] rounded-none'
              : 'bg-transparent text-[#6b6b6b] hover:bg-[#f7f7f7] hover:text-[#262626] border-b-2 border-transparent font-normal rounded-none',
          )}
        >
          <ShieldCheck className="h-4 w-4" />
          <span>Policies & Loan Types</span>
        </button>
      </div>

      {/* TAB 1: STAFF LOANS */}
      {activeTab === 'loans' && (
        <div className="overflow-hidden rounded-none border border-hairline bg-canvas ">
          {loansLoading ? (
            <div className="flex h-48 items-center justify-center">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : loans.length === 0 ? (
            <div className="p-12 text-center">
              <Coins className="mx-auto h-8 w-8 text-ink-mute/50" />
              <h3 className="mt-3 text-sm font-semibold text-ink">No employee loans found</h3>
              <p className="mt-1 text-xs text-ink-mute">
                Click "Request Loan" to issue an employee staff loan or festival advance.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-hairline bg-canvas-lavender/30 text-[11px] font-semibold uppercase text-ink-mute">
                  <tr>
                    <th className="py-3 pl-4 pr-3">Loan #</th>
                    <th className="px-3 py-3">Employee</th>
                    <th className="px-3 py-3">Loan Type</th>
                    <th className="px-3 py-3">Principal</th>
                    <th className="px-3 py-3">Term</th>
                    <th className="px-3 py-3">Monthly EMI</th>
                    <th className="px-3 py-3">Outstanding</th>
                    <th className="px-3 py-3">Status</th>
                    <th className="py-3 pl-3 pr-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hairline">
                  {loans.map((l) => (
                    <tr key={l.id} className="hover:bg-canvas-soft/30 transition-colors">
                      <td className="py-3 pl-4 pr-3 font-mono font-bold text-ink">
                        {l.loanNumber}
                      </td>
                      <td className="px-3 py-3">
                        <div className="font-semibold text-ink">{l.employee?.displayName}</div>
                        <span className="font-mono text-[11px] text-ink-mute">{l.employee?.employeeNumber}</span>
                      </td>
                      <td className="px-3 py-3 font-medium text-ink">
                        {l.loanType?.name}
                      </td>
                      <td className="px-3 py-3 font-mono font-bold text-ink">
                        LKR {Number(l.principalAmount).toLocaleString('en-LK', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-3 py-3 font-medium text-ink">
                        {l.termMonths} Months
                      </td>
                      <td className="px-3 py-3 font-mono text-purple-700">
                        LKR {Number(l.installmentAmount || 0).toLocaleString('en-LK', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-3 py-3 font-mono font-bold text-amber-700">
                        LKR {Number(l.outstandingPrincipal || l.principalAmount).toLocaleString('en-LK', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-3 py-3">
                        {getLoanStatusBadge(l.status)}
                      </td>
                      <td className="py-3 pl-3 pr-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {l.status === 'pending' && (
                            <>
                              <Button
                                variant="primary-pill"
                                size="sm"
                                onClick={() => approveLoanMutation.mutate({ id: l.id })}
                                disabled={approveLoanMutation.isPending}
                                className="h-7 text-[11px] px-2.5 flex items-center gap-1"
                              >
                                <CheckCircle2 className="h-3 w-3" />
                                Approve
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => rejectLoanMutation.mutate(l.id)}
                                disabled={rejectLoanMutation.isPending}
                                className="h-7 text-[11px] px-2 text-red-600 hover:text-red-700"
                              >
                                <XCircle className="h-3 w-3" />
                              </Button>
                            </>
                          )}
                          <Button
                            variant="secondary-pill"
                            size="sm"
                            onClick={() => {
                              setSelectedLoanId(l.id);
                              setActiveTab('schedules');
                            }}
                            className="h-7 text-[11px] px-2.5 flex items-center gap-1"
                          >
                            <Eye className="h-3 w-3" />
                            Schedule
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

      {/* TAB 2: REPAYMENT SCHEDULES */}
      {activeTab === 'schedules' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-none border border-hairline bg-canvas p-4 ">
            <div>
              <span className="text-xs text-ink-mute">Selected Loan:</span>
              <div className="font-bold text-ink text-sm">
                {activeLoan?.loanNumber} — {activeLoan?.employee?.displayName} ({activeLoan?.loanType?.name})
              </div>
            </div>
            <div>
              {activeLoan && getLoanStatusBadge(activeLoan.status)}
            </div>
          </div>

          <div className="overflow-hidden rounded-none border border-hairline bg-canvas ">
            {loanDetailLoading ? (
              <div className="flex h-48 items-center justify-center">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
            ) : !activeLoan?.installments || activeLoan.installments.length === 0 ? (
              <div className="p-12 text-center">
                <Layers className="mx-auto h-8 w-8 text-ink-mute/50" />
                <h3 className="mt-3 text-sm font-semibold text-ink">No repayment installments generated</h3>
                <p className="mt-1 text-xs text-ink-mute">
                  Approving the loan generates the complete monthly amortization installment schedule.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-hairline bg-canvas-lavender/30 text-[11px] font-semibold uppercase text-ink-mute">
                    <tr>
                      <th className="py-3 pl-4 pr-3">Installment #</th>
                      <th className="px-3 py-3">Due Date</th>
                      <th className="px-3 py-3">Principal Due</th>
                      <th className="px-3 py-3">Interest Due</th>
                      <th className="px-3 py-3">Total Installment</th>
                      <th className="px-3 py-3">Paid Amount</th>
                      <th className="px-3 py-3">Status</th>
                      <th className="py-3 pl-3 pr-4">Paid Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-hairline font-mono">
                    {activeLoan.installments.map((inst) => (
                      <tr key={inst.id} className="hover:bg-canvas-soft/30 transition-colors">
                        <td className="py-3 pl-4 pr-3 font-sans font-bold text-ink">
                          Month {inst.installmentNo}
                        </td>
                        <td className="px-3 py-3 text-ink">
                          {inst.dueDate}
                        </td>
                        <td className="px-3 py-3 font-bold text-ink">
                          LKR {Number(inst.principalAmount).toLocaleString('en-LK', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-3 py-3 text-ink-mute">
                          LKR {Number(inst.interestAmount).toLocaleString('en-LK', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-3 py-3 font-bold text-purple-700">
                          LKR {Number(inst.totalAmount).toLocaleString('en-LK', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-3 py-3 text-emerald-700">
                          LKR {Number(inst.paidAmount).toLocaleString('en-LK', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-3 py-3 font-sans">
                          {inst.status === 'paid' ? (
                            <span className="rounded-none bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200 uppercase">Paid</span>
                          ) : (
                            <span className="rounded-none bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700 border border-blue-200 uppercase">Scheduled</span>
                          )}
                        </td>
                        <td className="py-3 pl-3 pr-4 text-ink-mute font-sans text-[11px]">
                          {inst.paidAt ? new Date(inst.paidAt).toLocaleDateString() : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: SALARY ADVANCES */}
      {activeTab === 'advances' && (
        <div className="overflow-hidden rounded-none border border-hairline bg-canvas ">
          {advancesLoading ? (
            <div className="flex h-48 items-center justify-center">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : advances.length === 0 ? (
            <div className="p-12 text-center">
              <Wallet className="mx-auto h-8 w-8 text-ink-mute/50" />
              <h3 className="mt-3 text-sm font-semibold text-ink">No salary advances requested</h3>
              <p className="mt-1 text-xs text-ink-mute">
                Use "Salary Advance" to create an emergency mid-month salary withdrawal.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-hairline bg-canvas-lavender/30 text-[11px] font-semibold uppercase text-ink-mute">
                  <tr>
                    <th className="py-3 pl-4 pr-3">Employee</th>
                    <th className="px-3 py-3">Requested Date</th>
                    <th className="px-3 py-3">Advance Amount</th>
                    <th className="px-3 py-3">Deduction Pay Date</th>
                    <th className="px-3 py-3">Reason</th>
                    <th className="px-3 py-3">Status</th>
                    <th className="py-3 pl-3 pr-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hairline">
                  {advances.map((a) => (
                    <tr key={a.id} className="hover:bg-canvas-soft/30 transition-colors">
                      <td className="py-3 pl-4 pr-3">
                        <div className="font-semibold text-ink">{a.employee?.displayName}</div>
                        <span className="font-mono text-[11px] text-ink-mute">{a.employee?.employeeNumber}</span>
                      </td>
                      <td className="px-3 py-3 font-mono text-ink">
                        {a.requestedOn}
                      </td>
                      <td className="px-3 py-3 font-mono font-bold text-emerald-700">
                        LKR {Number(a.amount).toLocaleString('en-LK', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-3 py-3 font-mono text-ink">
                        {a.deductionPayDate}
                      </td>
                      <td className="px-3 py-3 text-ink max-w-xs truncate">
                        {a.reason || '—'}
                      </td>
                      <td className="px-3 py-3">
                        {a.status === 'approved' ? (
                          <span className="rounded-none bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200 uppercase">Approved</span>
                        ) : a.status === 'rejected' ? (
                          <span className="rounded-none bg-red-50 px-2 py-0.5 text-[10px] font-bold text-red-700 border border-red-200 uppercase">Rejected</span>
                        ) : (
                          <span className="rounded-none bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700 border border-amber-200 uppercase">Pending</span>
                        )}
                      </td>
                      <td className="py-3 pl-3 pr-4 text-right">
                        {a.status === 'pending' && (
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              variant="primary-pill"
                              size="sm"
                              onClick={() => approveAdvanceMutation.mutate(a.id)}
                              disabled={approveAdvanceMutation.isPending}
                              className="h-7 text-[11px] px-2.5 flex items-center gap-1"
                            >
                              <CheckCircle2 className="h-3 w-3" />
                              Approve
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => rejectAdvanceMutation.mutate(a.id)}
                              disabled={rejectAdvanceMutation.isPending}
                              className="h-7 text-[11px] px-2 text-red-600 hover:text-red-700"
                            >
                              <XCircle className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: EXPENSE CLAIMS */}
      {activeTab === 'expenses' && (
        <div className="overflow-hidden rounded-none border border-hairline bg-canvas ">
          {claimsLoading ? (
            <div className="flex h-48 items-center justify-center">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : claims.length === 0 ? (
            <div className="p-12 text-center">
              <Receipt className="mx-auto h-8 w-8 text-ink-mute/50" />
              <h3 className="mt-3 text-sm font-semibold text-ink">No expense claims found</h3>
              <p className="mt-1 text-xs text-ink-mute">
                Click "Submit Expense" to claim client entertainment, travel, and meal costs.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-hairline bg-canvas-lavender/30 text-[11px] font-semibold uppercase text-ink-mute">
                  <tr>
                    <th className="py-3 pl-4 pr-3">Claim #</th>
                    <th className="px-3 py-3">Employee</th>
                    <th className="px-3 py-3">Items</th>
                    <th className="px-3 py-3">Total Amount</th>
                    <th className="px-3 py-3">Approved Amount</th>
                    <th className="px-3 py-3">Status</th>
                    <th className="px-3 py-3">Submitted At</th>
                    <th className="py-3 pl-3 pr-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hairline">
                  {claims.map((c) => (
                    <tr key={c.id} className="hover:bg-canvas-soft/30 transition-colors">
                      <td className="py-3 pl-4 pr-3 font-mono font-bold text-ink">
                        {c.claimNumber}
                      </td>
                      <td className="px-3 py-3">
                        <div className="font-semibold text-ink">{c.employee?.displayName}</div>
                        <span className="font-mono text-[11px] text-ink-mute">{c.employee?.employeeNumber}</span>
                      </td>
                      <td className="px-3 py-3 font-medium text-ink">
                        {c.items?.length || 1} Item(s)
                      </td>
                      <td className="px-3 py-3 font-mono font-bold text-ink">
                        LKR {Number(c.totalAmount).toLocaleString('en-LK', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-3 py-3 font-mono font-bold text-emerald-700">
                        LKR {Number(c.approvedAmount).toLocaleString('en-LK', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-3 py-3">
                        {getExpenseStatusBadge(c.status)}
                      </td>
                      <td className="px-3 py-3 font-mono text-[11px] text-ink-mute">
                        {c.submittedAt ? new Date(c.submittedAt).toLocaleDateString() : '—'}
                      </td>
                      <td className="py-3 pl-3 pr-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {(c.status === 'submitted' || c.status === 'pending_approval') && (
                            <>
                              <Button
                                variant="primary-pill"
                                size="sm"
                                onClick={() => approveClaimMutation.mutate({ id: c.id })}
                                disabled={approveClaimMutation.isPending}
                                className="h-7 text-[11px] px-2.5 flex items-center gap-1"
                              >
                                <CheckCircle2 className="h-3 w-3" />
                                Approve
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => rejectClaimMutation.mutate(c.id)}
                                disabled={rejectClaimMutation.isPending}
                                className="h-7 text-[11px] px-2 text-red-600 hover:text-red-700"
                              >
                                <XCircle className="h-3 w-3" />
                              </Button>
                            </>
                          )}
                          {c.status === 'approved' && (
                            <Button
                              variant="primary-pill"
                              size="sm"
                              onClick={() => reimburseClaimMutation.mutate(c.id)}
                              disabled={reimburseClaimMutation.isPending}
                              className="h-7 text-[11px] px-2.5 flex items-center gap-1 bg-emerald-700 hover:bg-emerald-800"
                            >
                              <FileCheck className="h-3 w-3" />
                              Reimburse
                            </Button>
                          )}
                          <Button
                            variant="secondary-pill"
                            size="sm"
                            onClick={() => setSelectedClaimId(c.id)}
                            className="h-7 text-[11px] px-2.5 flex items-center gap-1"
                          >
                            <Eye className="h-3 w-3" />
                            Items
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

      {/* TAB 5: POLICIES & CONFIG */}
      {activeTab === 'policies' && (
        <div className="space-y-6">
          {/* Corporate Expense Policies */}
          <div className="rounded-none border border-hairline bg-canvas p-5  space-y-4">
            <div className="flex items-center justify-between border-b border-hairline pb-3">
              <div>
                <h3 className="font-bold text-ink text-sm">Ceylon Corporate Expense & Travel Policy (2026)</h3>
                <p className="text-xs text-ink-mute">Category limits, max reimbursement per claim, and mandatory receipt thresholds</p>
              </div>
              <span className="rounded bg-blue-100/70 px-2.5 py-1 text-xs font-bold text-blue-800">
                Active Policy
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-hairline bg-canvas-lavender/30 text-[11px] font-semibold uppercase text-ink-mute">
                  <tr>
                    <th className="py-2.5 pl-3 pr-2">Expense Category</th>
                    <th className="px-2 py-2.5">Maximum Cap Per Claim</th>
                    <th className="px-2 py-2.5">Receipt Mandatory Above</th>
                    <th className="py-2.5 pl-2 pr-3 text-right">Policy Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hairline">
                  {expensePolicies[0]?.categoryRules?.categories?.map((cat, i) => (
                    <tr key={i} className="hover:bg-canvas-soft/30">
                      <td className="py-2.5 pl-3 pr-2 font-medium text-ink">
                        {cat.category}
                      </td>
                      <td className="px-2 py-2.5 font-mono font-bold text-ink">
                        LKR {Number(cat.maxPerClaim).toLocaleString('en-LK')}
                      </td>
                      <td className="px-2 py-2.5 font-mono text-amber-700">
                        LKR {Number(cat.receiptRequiredAbove).toLocaleString('en-LK')}
                      </td>
                      <td className="py-2.5 pl-2 pr-3 text-right">
                        <span className="rounded-none bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                          ENFORCED
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Loan Types Card */}
          <div className="rounded-none border border-hairline bg-canvas p-5  space-y-4">
            <div className="flex items-center justify-between border-b border-hairline pb-3">
              <div>
                <h3 className="font-bold text-ink text-sm">Configured Staff Loan Schemes</h3>
                <p className="text-xs text-ink-mute">Interest computation methods, limits, and maximum repayment terms</p>
              </div>
              <span className="rounded bg-purple-100/70 px-2.5 py-1 text-xs font-bold text-purple-800">
                {loanTypes.length} Loan Schemes
              </span>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {loanTypes.map((lt) => (
                <div key={lt.id} className="rounded-none bg-canvas-lavender/30 p-4 border border-hairline space-y-2">
                  <div className="font-bold text-ink text-xs">{lt.name}</div>
                  <div className="text-[11px] text-ink-mute font-mono">Code: {lt.code}</div>
                  <div className="border-t border-hairline pt-2 space-y-1 font-mono text-[11px]">
                    <div className="flex justify-between">
                      <span className="font-sans text-ink-mute">Interest Rate:</span>
                      <span className="font-bold text-primary">{((Number(lt.defaultInterestRate) || 0) * 100).toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-sans text-ink-mute">Max Amount:</span>
                      <span className="font-bold text-ink">LKR {Number(lt.maxAmount || 0).toLocaleString('en-LK')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-sans text-ink-mute">Max Term:</span>
                      <span className="font-bold text-purple-700">{lt.maxTermMonths} Months</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* REQUEST LOAN MODAL */}
      <Dialog
        isOpen={isLoanModalOpen}
        onClose={() => setIsLoanModalOpen(false)}
        title="Request Staff Personal Loan"
        description="Apply for an employee staff loan or festival advance."
        maxWidth="md"
      >
        <form onSubmit={handleCreateLoan} className="space-y-4 text-xs">
          <div>
            <Label htmlFor="loanEmp">Employee *</Label>
            <Select
              id="loanEmp"
              required
              value={loanEmployeeId}
              onChange={(e) => setLoanEmployeeId(e.target.value)}
              
            >
              <option value="">Select Employee</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.displayName} ({emp.employeeNumber})
                </option>
              ))}
            </Select>
          </div>

          <div>
            <Label htmlFor="loanType">Loan Scheme *</Label>
            <Select
              id="loanType"
              required
              value={loanTypeId}
              onChange={(e) => setLoanTypeId(e.target.value)}
              
            >
              <option value="">Select Loan Scheme</option>
              {loanTypes.map((lt) => (
                <option key={lt.id} value={lt.id}>
                  {lt.name} (Max LKR {Number(lt.maxAmount).toLocaleString('en-LK')})
                </option>
              ))}
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="loanPrincipal">Principal Amount (LKR) *</Label>
              <Input
                id="loanPrincipal"
                type="number"
                min={5000}
                step={5000}
                required
                value={loanPrincipal}
                onChange={(e) => setLoanPrincipal(Number(e.target.value))}
              />
            </div>

            <div>
              <Label htmlFor="loanTerm">Term (Months) *</Label>
              <Input
                id="loanTerm"
                type="number"
                min={1}
                max={36}
                required
                value={loanTermMonths}
                onChange={(e) => setLoanTermMonths(Number(e.target.value))}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="loanStart">Repayment Starts On *</Label>
            <Input
              id="loanStart"
              type="date"
              required
              value={loanStartsOn}
              onChange={(e) => setLoanStartsOn(e.target.value)}
            />
          </div>

          {/* EMI Estimate Box */}
          <div className="rounded-none bg-canvas-lavender/40 p-3 border border-hairline flex justify-between items-center">
            <span className="font-semibold text-ink">Estimated Monthly Installment (EMI):</span>
            <span className="font-mono font-bold text-base text-purple-700">
              LKR {Math.round((loanPrincipal / loanTermMonths) * 100 / 100).toLocaleString('en-LK', { minimumFractionDigits: 2 })} / mo
            </span>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-hairline">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsLoanModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary-pill"
              size="sm"
              disabled={createLoanMutation.isPending}
            >
              {createLoanMutation.isPending ? 'Submitting...' : 'Submit Request'}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* REQUEST SALARY ADVANCE MODAL */}
      <Dialog
        isOpen={isAdvanceModalOpen}
        onClose={() => setIsAdvanceModalOpen(false)}
        title="Request Salary Advance"
        description="Apply for an emergency mid-month advance against current month salary."
        maxWidth="md"
      >
        <form onSubmit={handleCreateAdvance} className="space-y-4 text-xs">
          <div>
            <Label htmlFor="advEmp">Employee *</Label>
            <Select
              id="advEmp"
              required
              value={advEmployeeId}
              onChange={(e) => setAdvEmployeeId(e.target.value)}
              
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
              <Label htmlFor="advAmt">Amount (LKR) *</Label>
              <Input
                id="advAmt"
                type="number"
                min={1000}
                step={1000}
                required
                value={advAmount}
                onChange={(e) => setAdvAmount(Number(e.target.value))}
              />
            </div>

            <div>
              <Label htmlFor="advReqDate">Requested Date *</Label>
              <Input
                id="advReqDate"
                type="date"
                required
                value={advRequestedOn}
                onChange={(e) => setAdvRequestedOn(e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="advDedDate">Scheduled Deduction Pay Date *</Label>
            <Input
              id="advDedDate"
              type="date"
              required
              value={advDeductionDate}
              onChange={(e) => setAdvDeductionDate(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="advReason">Reason for Advance *</Label>
            <Input
              id="advReason"
              type="text"
              required
              value={advReason}
              onChange={(e) => setAdvReason(e.target.value)}
              placeholder="e.g. Urgent home repair / medical assistance"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-hairline">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsAdvanceModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary-pill"
              size="sm"
              disabled={createAdvanceMutation.isPending}
            >
              {createAdvanceMutation.isPending ? 'Submitting...' : 'Submit Advance'}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* SUBMIT EXPENSE CLAIM MODAL */}
      <Dialog
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        title="Submit Expense Reimbursement Claim"
        description="Submit business expense reimbursement line items."
        maxWidth="xl"
      >
        <form onSubmit={handleCreateExpenseClaim} className="space-y-4 text-xs">
          <div>
            <Label htmlFor="expEmp">Employee *</Label>
            <Select
              id="expEmp"
              required
              value={expEmployeeId}
              onChange={(e) => setExpEmployeeId(e.target.value)}
            >
              <option value="">Select Employee</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.displayName} ({emp.employeeNumber})
                </option>
              ))}
            </Select>
          </div>

          {/* Line items */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-bold text-[#262626] uppercase tracking-[0.5px]">Expense Line Items ({expItems.length})</span>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleAddExpenseItem}
                className="h-8 text-xs px-3 flex items-center gap-1.5 font-bold"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Item
              </Button>
            </div>

            {expItems.map((item, idx) => (
              <div key={idx} className="p-4 rounded-none border border-[#e6e6e6] bg-[#fafafa] space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-[#262626] text-xs uppercase tracking-[0.5px]">Item #{idx + 1}</span>
                  {expItems.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveExpenseItem(idx)}
                      className="text-red-500 hover:text-red-700 cursor-pointer p-1"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <Label>Date *</Label>
                    <Input
                      type="date"
                      required
                      value={item.expenseDate}
                      onChange={(e) => {
                        const newItems = [...expItems];
                        newItems[idx].expenseDate = e.target.value;
                        setExpItems(newItems);
                      }}
                    />
                  </div>
                  <div>
                    <Label>Category *</Label>
                    <select
                      value={item.category}
                      onChange={(e) => {
                        const newItems = [...expItems];
                        newItems[idx].category = e.target.value;
                        setExpItems(newItems);
                      }}
                      className="flex h-11 w-full rounded-none border border-[#e6e6e6] bg-white px-3 py-2 text-sm text-[#262626] transition-all focus:outline-none focus:border-[#262626] focus:ring-1 focus:ring-[#262626]"
                    >
                      <option value="Travel & Transport">Travel & Transport</option>
                      <option value="Meals & Subsistence">Meals & Subsistence</option>
                      <option value="Client Entertainment">Client Entertainment</option>
                      <option value="Accommodation & Lodging">Accommodation & Lodging</option>
                      <option value="Fuel & Mileage">Fuel & Mileage</option>
                      <option value="Office Supplies">Office Supplies</option>
                    </select>
                  </div>
                  <div>
                    <Label>Amount (LKR) *</Label>
                    <Input
                      type="number"
                      min={100}
                      required
                      placeholder="0.00"
                      value={item.amount || ''}
                      onChange={(e) => {
                        const newItems = [...expItems];
                        newItems[idx].amount = Number(e.target.value);
                        setExpItems(newItems);
                      }}
                    />
                  </div>
                </div>

                <div>
                  <Label>Merchant / Vendor</Label>
                  <Input
                    type="text"
                    placeholder="e.g. PickMe, Dialog Axiata, Cinnamon Grand"
                    value={item.merchant}
                    onChange={(e) => {
                      const newItems = [...expItems];
                      newItems[idx].merchant = e.target.value;
                      setExpItems(newItems);
                    }}
                  />
                </div>

                <div>
                  <Label>Description / Business Purpose</Label>
                  <Textarea
                    rows={2}
                    placeholder="Enter business purpose, client visit, or journey details..."
                    value={item.description}
                    onChange={(e) => {
                      const newItems = [...expItems];
                      newItems[idx].description = e.target.value;
                      setExpItems(newItems);
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-none bg-[#f7f7f7] p-3.5 border border-[#e6e6e6] flex justify-between items-center font-mono">
            <span className="font-sans font-bold text-[#262626] text-xs uppercase tracking-[0.5px]">Total Claim Reimbursement:</span>
            <span className="font-bold text-base text-emerald-700">
              LKR {expItems.reduce((acc, i) => acc + (Number(i.amount) || 0), 0).toLocaleString('en-LK', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-hairline">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsExpenseModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary-pill"
              size="sm"
              disabled={createClaimMutation.isPending}
            >
              {createClaimMutation.isPending ? 'Submitting...' : 'Submit Claim'}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* VIEW CLAIM ITEMS MODAL */}
      <Dialog
        isOpen={!!selectedClaimId}
        onClose={() => setSelectedClaimId('')}
        title="Expense Claim Breakdown"
        description="Itemized receipts and business justification."
        maxWidth="md"
      >
        {claimDetailLoading ? (
          <div className="flex h-32 items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : claimDetail ? (
          <div className="space-y-4 text-xs">
            <div className="flex justify-between items-center border-b border-hairline pb-2">
              <div>
                <span className="font-mono font-bold text-ink">{claimDetail.claimNumber}</span>
                <p className="text-[11px] text-ink-mute">{claimDetail.employee?.displayName}</p>
              </div>
              <div className="text-right">
                <span className="font-mono font-bold text-emerald-700">
                  LKR {Number(claimDetail.totalAmount).toLocaleString('en-LK', { minimumFractionDigits: 2 })}
                </span>
                <div>{getExpenseStatusBadge(claimDetail.status)}</div>
              </div>
            </div>

            <div className="space-y-2">
              {claimDetail.items?.map((itm) => (
                <div key={itm.id} className="p-3 rounded-none border border-hairline bg-canvas-lavender/30 flex justify-between items-center">
                  <div>
                    <div className="font-semibold text-ink">{itm.category}</div>
                    <p className="text-[11px] text-ink-mute">{itm.merchant || 'General Merchant'} — {itm.description}</p>
                    <span className="font-mono text-[10px] text-ink-mute">{itm.expenseDate}</span>
                  </div>
                  <span className="font-mono font-bold text-ink">
                    LKR {Number(itm.amount).toLocaleString('en-LK', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <Button
                type="button"
                variant="primary-pill"
                size="sm"
                onClick={() => setSelectedClaimId('')}
              >
                Close
              </Button>
            </div>
          </div>
        ) : null}
      </Dialog>
    </div>
  );
};
