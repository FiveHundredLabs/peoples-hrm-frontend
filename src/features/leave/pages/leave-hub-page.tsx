import { Select } from '../../../components/ui/select';
import React, { useState } from 'react';
import {
  CalendarDays,
  Clock,
  CheckCircle2,
  Plus,
  FileCheck,
  History,
  Calendar,
  Layers,
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Dialog } from '../../../components/ui/dialog';
import {
  useLeaveTypes,
  useEntitlements,
  useAllocateEntitlement,
  useLeaveRequests,
  useCreateLeaveRequest,
  useApproveLeaveRequest,
  useRejectLeaveRequest,
  useLeaveLedger,
} from '../data/leave-data';
import { useEmployees } from '../../employee/data/employee-data';
import { LeaveRequestStatus, DayPart, LeaveRequest } from '../types/leave';
import { cn } from '../../../lib/utils';

export const LeaveHubPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'requests' | 'entitlements' | 'types' | 'ledger'>('requests');
  const [statusFilter, setStatusFilter] = useState<LeaveRequestStatus | undefined>('pending');
  const [selectedYear, setSelectedYear] = useState<number>(2026);

  // Modals State
  const [isApplyOpen, setIsApplyOpen] = useState(false);
  const [isAllocateOpen, setIsAllocateOpen] = useState(false);
  const [reviewingRequest, setReviewingRequest] = useState<LeaveRequest | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  // Apply Form State
  const [applyEmpId, setApplyEmpId] = useState('');
  const [applyTypeId, setApplyTypeId] = useState('');
  const [applyStartDate, setApplyStartDate] = useState('');
  const [applyEndDate, setApplyEndDate] = useState('');
  const [applyQuantity, setApplyQuantity] = useState(1.0);
  const [applyDayPart, setApplyDayPart] = useState<DayPart>('full_day');
  const [applyReason, setApplyReason] = useState('');

  // Allocate Form State
  const [allocEmpId, setAllocEmpId] = useState('');
  const [allocTypeId, setAllocTypeId] = useState('');
  const [allocQuantity, setAllocQuantity] = useState(14);
  const [allocOpening, setAllocOpening] = useState(0);

  // Queries
  const { data: leaveTypes = [] } = useLeaveTypes();
  const { data: entitlements = [], isLoading: entitlementsLoading } = useEntitlements({
    leaveYear: selectedYear,
  });
  const { data: requestsData, isLoading: requestsLoading } = useLeaveRequests({
    status: statusFilter,
  });
  const { data: ledger = [], isLoading: ledgerLoading } = useLeaveLedger();
  const { data: employeesData } = useEmployees({ limit: 100 });

  const employees = employeesData?.data || [];
  const requests = requestsData?.data || [];

  // Mutations
  const createRequestMutation = useCreateLeaveRequest();
  const approveRequestMutation = useApproveLeaveRequest();
  const rejectRequestMutation = useRejectLeaveRequest();
  const allocateMutation = useAllocateEntitlement();

  const handleApplyLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!applyEmpId || !applyTypeId || !applyStartDate || !applyEndDate) return;
    try {
      await createRequestMutation.mutateAsync({
        employeeId: applyEmpId,
        leaveTypeId: applyTypeId,
        startsAt: `${applyStartDate}T08:30:00+05:30`,
        endsAt: `${applyEndDate}T17:00:00+05:30`,
        requestedQuantity: Number(applyQuantity),
        dayPart: applyDayPart,
        reason: applyReason || undefined,
      });
      setIsApplyOpen(false);
      setApplyReason('');
    } catch (err: any) {
      console.error('Failed to submit leave application', err);
    }
  };

  const handleAllocate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!allocEmpId || !allocTypeId) return;
    try {
      await allocateMutation.mutateAsync({
        employeeId: allocEmpId,
        leaveTypeId: allocTypeId,
        leaveYear: selectedYear,
        allocated: Number(allocQuantity),
        openingBalance: Number(allocOpening),
      });
      setIsAllocateOpen(false);
    } catch (err) {
      console.error('Failed to allocate entitlement', err);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await approveRequestMutation.mutateAsync(id);
      setReviewingRequest(null);
    } catch (err) {
      console.error('Failed to approve leave', err);
    }
  };

  const handleReject = async (id: string) => {
    try {
      await rejectRequestMutation.mutateAsync({ id, reason: rejectReason || undefined });
      setReviewingRequest(null);
      setRejectReason('');
    } catch (err) {
      console.error('Failed to reject leave', err);
    }
  };

  // KPIs
  const pendingCount = requests.filter((r) => r.status === 'pending').length;
  const approvedCount = requests.filter((r) => r.status === 'approved').length;
  const totalAllocatedDays = entitlements.reduce((sum, e) => sum + Number(e.allocated), 0);
  const totalConsumedDays = entitlements.reduce((sum, e) => sum + Number(e.consumed), 0);

  const getStatusBadge = (status: LeaveRequestStatus) => {
    switch (status) {
      case 'approved':
        return <span className="rounded-none bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200 uppercase">Approved</span>;
      case 'pending':
        return <span className="rounded-none bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700 border border-amber-200 uppercase">Pending Approval</span>;
      case 'rejected':
        return <span className="rounded-none bg-red-50 px-2 py-0.5 text-[10px] font-bold text-red-700 border border-red-200 uppercase">Rejected</span>;
      default:
        return <span className="rounded-none bg-canvas-soft px-2 py-0.5 text-[10px] font-bold text-ink uppercase">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-5 border-b border-hairline">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold tracking-tight text-ink">Leave Management & Balances</h1>
          <p className="text-sm text-muted mt-1">Statutory leave balances, vacation requests, and atomic approvals.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <Button
            variant="primary-pill"
            size="sm"
            onClick={() => setIsApplyOpen(true)}
            className="flex items-center gap-1.5"
          >
            <Calendar className="h-3.5 w-3.5" />
            <span>Apply for Leave</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAllocateOpen(true)}
            className="flex items-center gap-1.5"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Allocate Quota</span>
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-none border border-hairline bg-canvas p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted">Pending Requests</span>
            <Clock className="h-4 w-4 text-amber-600" />
          </div>
          <p className="mt-2 text-xl sm:text-2xl font-bold text-amber-700 tracking-tight">{pendingCount}</p>
          <span className="text-[11px] text-muted">Awaiting supervisor approval</span>
        </div>

        <div className="rounded-none border border-hairline bg-canvas p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted">Approved Leaves</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="mt-2 text-xl sm:text-2xl font-bold text-emerald-700 tracking-tight">{approvedCount}</p>
          <span className="text-[11px] text-muted">Consumed this period</span>
        </div>

        <div className="rounded-none border border-hairline bg-canvas p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted">Total Allocated Days</span>
            <CalendarDays className="h-4 w-4 text-primary" />
          </div>
          <p className="mt-2 text-xl sm:text-2xl font-bold text-ink tracking-tight">{totalAllocatedDays} d</p>
          <span className="text-[11px] text-muted">Year {selectedYear} statutory quota</span>
        </div>

        <div className="rounded-none border border-hairline bg-canvas p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted">Consumed Days</span>
            <FileCheck className="h-4 w-4 text-purple-600" />
          </div>
          <p className="mt-2 text-xl sm:text-2xl font-bold text-purple-700 tracking-tight">{totalConsumedDays} d</p>
          <span className="text-[11px] text-muted">Across organization</span>
        </div>
      </div>

      {/* Navigation Tab Bar */}
      <div className="flex items-center gap-2 overflow-x-auto border-b border-[#e6e6e6] pb-0 mb-6 scrollbar-none">
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
          <Calendar className="h-4 w-4" />
          <span>Leave Requests ({requests.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('entitlements')}
          className={cn(
            'inline-flex items-center gap-2 rounded-none px-3.5 py-2 text-sm font-medium whitespace-nowrap transition-colors cursor-pointer select-none',
            activeTab === 'entitlements'
              ? 'bg-[#1c69d4]/10 text-[#1c69d4] font-bold border-b-2 border-[#1c69d4] rounded-none'
              : 'bg-transparent text-[#6b6b6b] hover:bg-[#f7f7f7] hover:text-[#262626] border-b-2 border-transparent font-normal rounded-none',
          )}
        >
          <CalendarDays className="h-4 w-4" />
          <span>Entitlements & Balances</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('types')}
          className={cn(
            'inline-flex items-center gap-2 rounded-none px-3.5 py-2 text-sm font-medium whitespace-nowrap transition-colors cursor-pointer select-none',
            activeTab === 'types'
              ? 'bg-[#1c69d4]/10 text-[#1c69d4] font-bold border-b-2 border-[#1c69d4] rounded-none'
              : 'bg-transparent text-[#6b6b6b] hover:bg-[#f7f7f7] hover:text-[#262626] border-b-2 border-transparent font-normal rounded-none',
          )}
        >
          <Layers className="h-4 w-4" />
          <span>Statutory Leave Types</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('ledger')}
          className={cn(
            'inline-flex items-center gap-2 rounded-none px-3.5 py-2 text-sm font-medium whitespace-nowrap transition-colors cursor-pointer select-none',
            activeTab === 'ledger'
              ? 'bg-[#1c69d4]/10 text-[#1c69d4] font-bold border-b-2 border-[#1c69d4] rounded-none'
              : 'bg-transparent text-[#6b6b6b] hover:bg-[#f7f7f7] hover:text-[#262626] border-b-2 border-transparent font-normal rounded-none',
          )}
        >
          <History className="h-4 w-4" />
          <span>Atomic Audit Ledger</span>
        </button>
      </div>

      {/* TAB 1: LEAVE APPLICATIONS */}
      {activeTab === 'requests' && (
        <div className="space-y-4">
          {/* Status Filter Bar */}
          <div className="flex flex-wrap items-center gap-1.5">
            {(
              [
                { label: 'Pending Approval', value: 'pending' },
                { label: 'Approved', value: 'approved' },
                { label: 'Rejected', value: 'rejected' },
                { label: 'All Requests', value: undefined },
              ] as const
            ).map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => setStatusFilter(item.value as any)}
                className={`rounded-none px-3 py-1 text-xs font-medium transition-colors cursor-pointer ${
                  statusFilter === item.value
                    ? 'bg-[#1c69d4] text-white font-bold rounded-none'
                    : 'bg-[#f7f7f7] text-[#262626] border border-[#e6e6e6] hover:bg-[#ebebeb]'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Table */}
          <div className="overflow-hidden rounded-none border border-hairline bg-canvas ">
            {requestsLoading ? (
              <div className="flex h-48 items-center justify-center">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
            ) : requests.length === 0 ? (
              <div className="p-12 text-center">
                <CalendarDays className="mx-auto h-8 w-8 text-ink-mute/50" />
                <h3 className="mt-3 text-sm font-semibold text-ink">No leave applications found</h3>
                <p className="mt-1 text-xs text-ink-mute">
                  Use "Apply for Leave" to submit an application.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-hairline bg-canvas-lavender/30 text-[11px] font-semibold uppercase text-ink-mute">
                    <tr>
                      <th className="py-3 pl-4 pr-3">Employee</th>
                      <th className="px-3 py-3">Leave Type</th>
                      <th className="px-3 py-3">Dates</th>
                      <th className="px-3 py-3">Duration</th>
                      <th className="px-3 py-3">Reason</th>
                      <th className="px-3 py-3">Status</th>
                      <th className="py-3 pl-3 pr-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-hairline">
                    {requests.map((r) => (
                      <tr key={r.id} className="hover:bg-canvas-soft/30 transition-colors">
                        <td className="py-3 pl-4 pr-3">
                          <div className="font-semibold text-ink">{r.employee?.displayName || 'Employee'}</div>
                          <span className="font-mono text-[11px] text-ink-mute">{r.employee?.employeeNumber}</span>
                        </td>
                        <td className="px-3 py-3 font-medium text-ink">
                          {r.leaveType?.name || 'Leave'}
                        </td>
                        <td className="px-3 py-3 text-ink">
                          {new Date(r.startsAt).toLocaleDateString()} — {new Date(r.endsAt).toLocaleDateString()}
                        </td>
                        <td className="px-3 py-3 font-semibold text-ink">
                          {r.requestedQuantity} Day(s)
                        </td>
                        <td className="px-3 py-3 text-ink-mute max-w-xs truncate">
                          {r.reason || '—'}
                        </td>
                        <td className="px-3 py-3">
                          {getStatusBadge(r.status)}
                        </td>
                        <td className="py-3 pl-3 pr-4 text-right">
                          {r.status === 'pending' && (
                            <div className="flex items-center justify-end gap-1.5">
                              <Button
                                variant="primary-pill"
                                size="sm"
                                onClick={() => handleApprove(r.id)}
                                disabled={approveRequestMutation.isPending}
                                className="h-7 text-[11px] px-2.5"
                              >
                                Approve
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => {
                                  setReviewingRequest(r);
                                }}
                                className="h-7 text-[11px] px-2.5 rounded-none"
                              >
                                Reject
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
        </div>
      )}

      {/* TAB 2: ENTITLEMENTS & BALANCES */}
      {activeTab === 'entitlements' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-none border border-hairline bg-canvas p-4 ">
            <span className="text-xs font-semibold text-ink">Leave Entitlement Year:</span>
            <Select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
              className="rounded bg-canvas p-1.5 text-xs font-semibold text-ink border border-hairline"
            >
              <option value={2025}>Year 2025</option>
              <option value={2026}>Year 2026 (Current)</option>
              <option value={2027}>Year 2027</option>
            </Select>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {entitlementsLoading ? (
              <div className="col-span-full flex h-48 items-center justify-center">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
            ) : entitlements.length === 0 ? (
              <div className="col-span-full p-12 text-center border border-hairline rounded-none">
                <Layers className="mx-auto h-8 w-8 text-ink-mute/50" />
                <h3 className="mt-3 text-sm font-semibold text-ink">No entitlements allocated for {selectedYear}</h3>
                <p className="mt-1 text-xs text-ink-mute">
                  Allocate statutory leave quotas (Annual 14d, Casual 7d) using the "Allocate Quota" button.
                </p>
              </div>
            ) : (
              entitlements.map((ent) => {
                const total = Number(ent.allocated) + Number(ent.openingBalance) + Number(ent.carriedForward);
                const consumed = Number(ent.consumed);
                const reserved = Number(ent.reserved);
                const available = Number(ent.currentBalance);
                const consumedPercent = total > 0 ? (consumed / total) * 100 : 0;
                const reservedPercent = total > 0 ? (reserved / total) * 100 : 0;

                return (
                  <div key={ent.id} className="rounded-none border border-hairline bg-canvas p-5  space-y-4">
                    <div className="flex items-center justify-between border-b border-hairline pb-3">
                      <div>
                        <div className="font-bold text-ink text-sm">{ent.employee?.displayName}</div>
                        <span className="text-[11px] font-mono text-ink-mute">{ent.employee?.employeeNumber}</span>
                      </div>
                      <span className="rounded bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
                        {ent.leaveType?.name}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-emerald-700">{available} Days Available</span>
                        <span className="text-ink-mute">Total: {total} Days</span>
                      </div>

                      {/* Visual Progress Stack */}
                      <div className="h-2.5 w-full overflow-hidden rounded-none bg-canvas-soft flex">
                        <div
                          style={{ width: `${consumedPercent}%` }}
                          className="bg-purple-600"
                          title={`Consumed: ${consumed} days`}
                        />
                        <div
                          style={{ width: `${reservedPercent}%` }}
                          className="bg-amber-500"
                          title={`Reserved: ${reserved} days`}
                        />
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-ink-mute pt-1">
                        <span>Consumed: {consumed}d</span>
                        {reserved > 0 && <span className="text-amber-700 font-semibold">Reserved: {reserved}d</span>}
                        <span>Allocated: {ent.allocated}d</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* TAB 3: STATUTORY LEAVE TYPES */}
      {activeTab === 'types' && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {leaveTypes.map((t) => (
            <div key={t.id} className="rounded-none border border-hairline bg-canvas p-5  space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-ink text-sm">{t.name}</h3>
                <span className="rounded bg-canvas-soft px-2 py-0.5 font-mono text-[10px] font-bold text-ink">
                  {t.code}
                </span>
              </div>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-ink-mute">
                  <span>Category:</span>
                  <span className="font-semibold text-ink uppercase">{t.category}</span>
                </div>
                <div className="flex justify-between text-ink-mute">
                  <span>Remuneration:</span>
                  <span className="font-semibold text-emerald-700">{t.paid ? 'Fully Paid' : 'Unpaid (No Pay)'}</span>
                </div>
                <div className="flex justify-between text-ink-mute">
                  <span>Statutory (Shop & Office):</span>
                  <span className="font-semibold text-ink">{t.statutory ? 'Yes (Statutory Mandate)' : 'Company Policy'}</span>
                </div>
                <div className="flex justify-between text-ink-mute">
                  <span>Half-Day Allowed:</span>
                  <span className="font-semibold text-ink">{t.allowHalfDay ? 'Yes (0.5 Day)' : 'Full Day Only'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 4: AUDIT LEDGER */}
      {activeTab === 'ledger' && (
        <div className="overflow-hidden rounded-none border border-hairline bg-canvas ">
          {ledgerLoading ? (
            <div className="flex h-48 items-center justify-center">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : ledger.length === 0 ? (
            <div className="p-12 text-center">
              <History className="mx-auto h-8 w-8 text-ink-mute/50" />
              <h3 className="mt-3 text-sm font-semibold text-ink">No ledger transactions</h3>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-hairline bg-canvas-lavender/30 text-[11px] font-semibold uppercase text-ink-mute">
                  <tr>
                    <th className="py-3 pl-4 pr-3">Date</th>
                    <th className="px-3 py-3">Employee</th>
                    <th className="px-3 py-3">Leave Type</th>
                    <th className="px-3 py-3">Transaction</th>
                    <th className="px-3 py-3">Quantity</th>
                    <th className="px-3 py-3">Balance After</th>
                    <th className="py-3 pl-3 pr-4">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hairline">
                  {ledger.map((l) => (
                    <tr key={l.id} className="hover:bg-canvas-soft/30 transition-colors">
                      <td className="py-3 pl-4 pr-3 font-mono text-[11px] text-ink-mute">
                        {l.effectiveDate}
                      </td>
                      <td className="px-3 py-3 font-medium text-ink">
                        {l.employee?.displayName || 'Employee'}
                      </td>
                      <td className="px-3 py-3 font-medium text-ink">
                        {l.leaveType?.name || 'Leave'}
                      </td>
                      <td className="px-3 py-3">
                        <span className="font-mono font-bold uppercase text-[10px] text-primary">
                          {l.entryType}
                        </span>
                      </td>
                      <td className="px-3 py-3 font-semibold text-ink">
                        {l.quantity} d
                      </td>
                      <td className="px-3 py-3 font-bold text-emerald-700">
                        {l.balanceAfter} d
                      </td>
                      <td className="py-3 pl-3 pr-4 text-ink-mute max-w-xs truncate">
                        {l.description || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* APPLY FOR LEAVE MODAL */}
      <Dialog
        isOpen={isApplyOpen}
        onClose={() => setIsApplyOpen(false)}
        title="Apply for Leave"
        description="Submit leave application."
        maxWidth="md"
      >
        <form onSubmit={handleApplyLeave} className="space-y-4 text-xs">
          <div>
            <Label htmlFor="applyEmpId">Employee *</Label>
            <Select
              id="applyEmpId"
              required
              value={applyEmpId}
              onChange={(e) => setApplyEmpId(e.target.value)}
              
            >
              <option value="">Select Employee</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.displayName} ({emp.employeeNumber})
                </option>
              ))}
            </Select>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label htmlFor="applyTypeId">Leave Type *</Label>
              <Select
                id="applyTypeId"
                required
                value={applyTypeId}
                onChange={(e) => setApplyTypeId(e.target.value)}
                
              >
                <option value="">Select Type</option>
                {leaveTypes.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.paid ? 'Paid' : 'Unpaid'})
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <Label htmlFor="applyQuantity">Requested Days *</Label>
              <Input
                id="applyQuantity"
                type="number"
                step="0.5"
                min="0.5"
                required
                value={applyQuantity}
                onChange={(e) => setApplyQuantity(parseFloat(e.target.value))}
              />
            </div>

            <div>
              <Label htmlFor="applyDayPart">Day Part</Label>
              <Select
                id="applyDayPart"
                value={applyDayPart}
                onChange={(e) => setApplyDayPart(e.target.value as any)}
                
              >
                <option value="full_day">Full Day</option>
                <option value="first_half">First Half (Morning)</option>
                <option value="second_half">Second Half (Afternoon)</option>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="applyStartDate">Start Date *</Label>
              <Input
                id="applyStartDate"
                type="date"
                required
                value={applyStartDate}
                onChange={(e) => {
                  setApplyStartDate(e.target.value);
                  if (!applyEndDate) setApplyEndDate(e.target.value);
                }}
              />
            </div>

            <div>
              <Label htmlFor="applyEndDate">End Date *</Label>
              <Input
                id="applyEndDate"
                type="date"
                required
                value={applyEndDate}
                onChange={(e) => setApplyEndDate(e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="applyReason">Reason for Leave</Label>
            <Input
              id="applyReason"
              placeholder="e.g. Attending family function"
              value={applyReason}
              onChange={(e) => setApplyReason(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-hairline">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsApplyOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary-pill"
              size="sm"
              disabled={createRequestMutation.isPending}
            >
              {createRequestMutation.isPending ? 'Submitting...' : 'Submit Application'}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* ALLOCATE QUOTA MODAL */}
      <Dialog
        isOpen={isAllocateOpen}
        onClose={() => setIsAllocateOpen(false)}
        title="Allocate Leave Quota"
        description="Assign leave quota."
        maxWidth="md"
      >
        <form onSubmit={handleAllocate} className="space-y-4 text-xs">
          <div>
            <Label htmlFor="allocEmpId">Employee *</Label>
            <Select
              id="allocEmpId"
              required
              value={allocEmpId}
              onChange={(e) => setAllocEmpId(e.target.value)}
              
            >
              <option value="">Select Employee</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.displayName} ({emp.employeeNumber})
                </option>
              ))}
            </Select>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label htmlFor="allocTypeId">Leave Type *</Label>
              <Select
                id="allocTypeId"
                required
                value={allocTypeId}
                onChange={(e) => setAllocTypeId(e.target.value)}
                
              >
                <option value="">Select Type</option>
                {leaveTypes.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <Label htmlFor="allocQuantity">Allocated Days *</Label>
              <Input
                id="allocQuantity"
                type="number"
                step="1"
                min="1"
                required
                value={allocQuantity}
                onChange={(e) => setAllocQuantity(parseInt(e.target.value, 10))}
              />
            </div>

            <div>
              <Label htmlFor="allocOpening">Opening Balance</Label>
              <Input
                id="allocOpening"
                type="number"
                step="1"
                min="0"
                value={allocOpening}
                onChange={(e) => setAllocOpening(parseInt(e.target.value, 10))}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-hairline">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsAllocateOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary-pill"
              size="sm"
              disabled={allocateMutation.isPending}
            >
              {allocateMutation.isPending ? 'Saving...' : 'Save Allocation'}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* REJECT LEAVE MODAL */}
      <Dialog
        isOpen={!!reviewingRequest}
        onClose={() => setReviewingRequest(null)}
        title="Reject Leave Application"
        description="Enter rejection reason."
        maxWidth="sm"
      >
        <div className="space-y-4 text-xs">
          <div>
            <Label htmlFor="rejectReason">Rejection Reason</Label>
            <Input
              id="rejectReason"
              placeholder="e.g. Critical project deadline"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-hairline">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setReviewingRequest(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => reviewingRequest && handleReject(reviewingRequest.id)}
              disabled={rejectRequestMutation.isPending}
              className="rounded-none"
            >
              {rejectRequestMutation.isPending ? 'Rejecting...' : 'Confirm Rejection'}
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
};
