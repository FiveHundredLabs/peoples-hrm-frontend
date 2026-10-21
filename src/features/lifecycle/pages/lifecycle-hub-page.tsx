import { Textarea } from '../../../components/ui/textarea';
import { Select } from '../../../components/ui/select';
import React, { useState } from 'react';
import {
  TrendingUp,
  FileCheck,
  Award,
  Clock,
  ArrowRight,
  Star,
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Dialog } from '../../../components/ui/dialog';
import {
  useProbationReviews,
  useSubmitProbationReview,
  useMovements,
  useCreateMovement,
  useApproveMovement,
  useContracts,
  useCreateContract,
  useSkills,
} from '../data/lifecycle-data';
import { useEmployees } from '../../employee/data/employee-data';
import { useDepartments, useBranches } from '../../organization/data/organization-data';
import { cn } from '../../../lib/utils';
import { ProbationReview, MovementType } from '../types/lifecycle';

export const LifecycleHubPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'probation' | 'movements' | 'contracts' | 'skills'>('probation');

  // Probation Modal State
  const [evaluatingReview, setEvaluatingReview] = useState<ProbationReview | null>(null);
  const [probationOutcome, setProbationOutcome] = useState<'confirmed' | 'extended' | 'terminated'>('confirmed');
  const [probationRating, setProbationRating] = useState<number>(4.5);
  const [probationComments, setProbationComments] = useState<string>('');
  const [probationEffectiveDate, setProbationEffectiveDate] = useState<string>(
    new Date().toISOString().split('T')[0],
  );
  const [probationExtensionDate, setProbationExtensionDate] = useState<string>('');

  // Movement Modal State
  const [isCreateMovementOpen, setIsCreateMovementOpen] = useState(false);
  const [selectedEmpId, setSelectedEmpId] = useState('');
  const [movementType, setMovementType] = useState<MovementType>('promotion');
  const [effectiveDate, setEffectiveDate] = useState(new Date().toISOString().split('T')[0]);
  const [proposedTitle, setProposedTitle] = useState('');
  const [proposedDeptId, setProposedDeptId] = useState('');
  const [proposedBranchId, setProposedBranchId] = useState('');
  const [movementReason, setMovementReason] = useState('');

  // Contract Modal State
  const [isCreateContractOpen, setIsCreateContractOpen] = useState(false);
  const [contractEmpId, setContractEmpId] = useState('');
  const [contractNumber, setContractNumber] = useState('');
  const [contractType, setContractType] = useState('permanent');
  const [contractStartDate, setContractStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [contractEndDate, setContractEndDate] = useState('');

  // Queries
  const { data: probationData, isLoading: probationsLoading } = useProbationReviews();
  const { data: movementsData, isLoading: movementsLoading } = useMovements();
  const { data: contractsData, isLoading: contractsLoading } = useContracts();
  const { data: skills = [], isLoading: skillsLoading } = useSkills();
  const { data: employeesData } = useEmployees({ limit: 100 });
  const { data: departmentsData } = useDepartments();
  const { data: branchesData } = useBranches();

  const employees = employeesData?.data || [];
  const departments = departmentsData?.data || [];
  const branches = branchesData?.data || [];

  const probations = probationData?.data || [];
  const movements = movementsData?.data || [];
  const contracts = contractsData?.data || [];

  // Mutations
  const submitReviewMutation = useSubmitProbationReview();
  const createMovementMutation = useCreateMovement();
  const approveMovementMutation = useApproveMovement();
  const createContractMutation = useCreateContract();

  const handleProbationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!evaluatingReview) return;
    try {
      await submitReviewMutation.mutateAsync({
        id: evaluatingReview.id,
        data: {
          outcome: probationOutcome,
          rating: probationRating,
          comments: probationComments,
          effectiveDate: probationEffectiveDate,
          extensionEndDate: probationExtensionDate || undefined,
        },
      });
      setEvaluatingReview(null);
      setProbationComments('');
    } catch (err) {
      console.error('Failed to submit probation review', err);
    }
  };

  const handleMovementCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmpId) return;
    try {
      await createMovementMutation.mutateAsync({
        employeeId: selectedEmpId,
        movementType,
        requestedEffectiveDate: effectiveDate,
        proposedTitle: proposedTitle || undefined,
        proposedDepartmentId: proposedDeptId || undefined,
        proposedBranchId: proposedBranchId || undefined,
        reason: movementReason,
        proposedFte: 1.0,
      });
      setIsCreateMovementOpen(false);
      setSelectedEmpId('');
      setProposedTitle('');
      setMovementReason('');
    } catch (err) {
      console.error('Failed to create movement request', err);
    }
  };

  const handleContractCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contractEmpId) return;
    const selectedEmp = employees.find((emp) => emp.id === contractEmpId);
    const empRecordId = selectedEmp?.employmentRecords?.[0]?.id || contractEmpId;

    try {
      await createContractMutation.mutateAsync({
        employeeId: contractEmpId,
        employmentRecordId: empRecordId,
        contractNumber: contractNumber || undefined,
        contractType,
        startDate: contractStartDate,
        endDate: contractEndDate || undefined,
      });
      setIsCreateContractOpen(false);
      setContractEmpId('');
      setContractNumber('');
    } catch (err) {
      console.error('Failed to create contract', err);
    }
  };

  const pendingProbationsCount = probations.filter((p) => p.status === 'pending').length;
  const pendingMovementsCount = movements.filter((m) => m.status === 'pending').length;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-5 border-b border-hairline">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold tracking-tight text-ink">Career & Lifecycle Governance</h1>
          <p className="text-sm text-muted mt-1">Probation evaluations, promotions, transfers, and employment contracts.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsCreateContractOpen(true)}
            className="flex items-center gap-1.5"
          >
            <FileCheck className="h-3.5 w-3.5" />
            <span>New Contract</span>
          </Button>
          <Button
            variant="primary-pill"
            size="sm"
            onClick={() => setIsCreateMovementOpen(true)}
            className="flex items-center gap-1.5"
          >
            <TrendingUp className="h-3.5 w-3.5" />
            <span>Initiate Movement</span>
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-none border border-hairline bg-canvas p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted">Pending Probations</span>
            <Clock className="h-4 w-4 text-amber-600" />
          </div>
          <p className="mt-2 text-xl sm:text-2xl font-bold text-amber-700 tracking-tight">{pendingProbationsCount}</p>
          <span className="text-[11px] text-muted">Due for confirmation</span>
        </div>

        <div className="rounded-none border border-hairline bg-canvas p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted">Career Movements</span>
            <TrendingUp className="h-4 w-4 text-primary" />
          </div>
          <p className="mt-2 text-xl sm:text-2xl font-bold text-ink tracking-tight">{pendingMovementsCount}</p>
          <span className="text-[11px] text-muted">Promotions & transfers pending</span>
        </div>

        <div className="rounded-none border border-hairline bg-canvas p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted">Active Contracts</span>
            <FileCheck className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="mt-2 text-xl sm:text-2xl font-bold text-emerald-700 tracking-tight">{contracts.length}</p>
          <span className="text-[11px] text-muted">On file & active</span>
        </div>

        <div className="rounded-none border border-hairline bg-canvas p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted">Skills Catalog</span>
            <Award className="h-4 w-4 text-primary" />
          </div>
          <p className="mt-2 text-xl sm:text-2xl font-bold text-ink tracking-tight">{skills.length}</p>
          <span className="text-[11px] text-muted">Standard competencies</span>
        </div>
      </div>

      {/* Navigation Tab Bar */}
      <div className="flex items-center gap-2 overflow-x-auto border-b border-[#e6e6e6] pb-0 mb-6 scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveTab('probation')}
          className={cn(
            'inline-flex items-center gap-2 rounded-none px-3.5 py-2 text-sm font-medium whitespace-nowrap transition-colors cursor-pointer select-none',
            activeTab === 'probation'
              ? 'bg-[#1c69d4]/10 text-[#1c69d4] font-bold border-b-2 border-[#1c69d4] rounded-none'
              : 'bg-transparent text-[#6b6b6b] hover:bg-[#f7f7f7] hover:text-[#262626] border-b-2 border-transparent font-normal rounded-none',
          )}
        >
          <Clock className="h-4 w-4" />
          <span>Probation Reviews ({probations.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('movements')}
          className={cn(
            'inline-flex items-center gap-2 rounded-none px-3.5 py-2 text-sm font-medium whitespace-nowrap transition-colors cursor-pointer select-none',
            activeTab === 'movements'
              ? 'bg-[#1c69d4]/10 text-[#1c69d4] font-bold border-b-2 border-[#1c69d4] rounded-none'
              : 'bg-transparent text-[#6b6b6b] hover:bg-[#f7f7f7] hover:text-[#262626] border-b-2 border-transparent font-normal rounded-none',
          )}
        >
          <TrendingUp className="h-4 w-4" />
          <span>Career Movements ({movements.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('contracts')}
          className={cn(
            'inline-flex items-center gap-2 rounded-none px-3.5 py-2 text-sm font-medium whitespace-nowrap transition-colors cursor-pointer select-none',
            activeTab === 'contracts'
              ? 'bg-[#1c69d4]/10 text-[#1c69d4] font-bold border-b-2 border-[#1c69d4] rounded-none'
              : 'bg-transparent text-[#6b6b6b] hover:bg-[#f7f7f7] hover:text-[#262626] border-b-2 border-transparent font-normal rounded-none',
          )}
        >
          <FileCheck className="h-4 w-4" />
          <span>Contracts ({contracts.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('skills')}
          className={cn(
            'inline-flex items-center gap-2 rounded-none px-3.5 py-2 text-sm font-medium whitespace-nowrap transition-colors cursor-pointer select-none',
            activeTab === 'skills'
              ? 'bg-[#1c69d4]/10 text-[#1c69d4] font-bold border-b-2 border-[#1c69d4] rounded-none'
              : 'bg-transparent text-[#6b6b6b] hover:bg-[#f7f7f7] hover:text-[#262626] border-b-2 border-transparent font-normal rounded-none',
          )}
        >
          <Award className="h-4 w-4" />
          <span>Skills ({skills.length})</span>
        </button>
      </div>

      {/* TAB 1: PROBATION REVIEWS */}
      {activeTab === 'probation' && (
        <div className="overflow-hidden rounded-none border border-hairline bg-canvas ">
          {probationsLoading ? (
            <div className="flex h-48 items-center justify-center">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : probations.length === 0 ? (
            <div className="p-12 text-center">
              <Clock className="mx-auto h-8 w-8 text-ink-mute/50" />
              <h3 className="mt-3 text-sm font-semibold text-ink">No probation reviews scheduled</h3>
              <p className="mt-1 text-xs text-ink-mute">
                Probation reviews are automatically generated for probationary employees per Sri Lankan labor guidelines.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-hairline bg-canvas-lavender/30 text-[11px] font-semibold uppercase text-ink-mute">
                  <tr>
                    <th className="py-3 pl-4 pr-3">Employee</th>
                    <th className="px-3 py-3">Review Due Date</th>
                    <th className="px-3 py-3">Rating</th>
                    <th className="px-3 py-3">Outcome</th>
                    <th className="px-3 py-3">Status</th>
                    <th className="py-3 pl-3 pr-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hairline">
                  {probations.map((p) => (
                    <tr key={p.id} className="hover:bg-canvas-soft/30 transition-colors">
                      <td className="py-3 pl-4 pr-3">
                        <div className="font-semibold text-ink">{p.employee?.displayName || 'Employee'}</div>
                        <span className="font-mono text-[11px] text-ink-mute">{p.employee?.employeeNumber}</span>
                      </td>
                      <td className="px-3 py-3 font-medium text-ink">{p.reviewDueDate}</td>
                      <td className="px-3 py-3">
                        {p.rating ? (
                          <span className="flex items-center gap-1 font-semibold text-amber-700">
                            <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                            {Number(p.rating).toFixed(1)} / 5.0
                          </span>
                        ) : (
                          <span className="text-ink-mute">—</span>
                        )}
                      </td>
                      <td className="px-3 py-3">
                        {p.outcome ? (
                          <span className="rounded bg-canvas-soft px-2 py-0.5 font-bold uppercase text-[10px] text-ink">
                            {p.outcome}
                          </span>
                        ) : (
                          <span className="text-ink-mute">Pending Evaluation</span>
                        )}
                      </td>
                      <td className="px-3 py-3">
                        <span
                          className={`rounded-none px-2 py-0.5 text-[10px] font-bold uppercase ${
                            p.status === 'approved'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td className="py-3 pl-3 pr-4 text-right">
                        {p.status !== 'approved' && (
                          <Button
                            variant="outline-aubergine"
                            size="sm"
                            onClick={() => {
                              setEvaluatingReview(p);
                              setProbationRating(4.5);
                              setProbationOutcome('confirmed');
                            }}
                            className="h-7 text-xs"
                          >
                            Evaluate & Confirm
                          </Button>
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

      {/* TAB 2: CAREER MOVEMENTS */}
      {activeTab === 'movements' && (
        <div className="overflow-hidden rounded-none border border-hairline bg-canvas ">
          {movementsLoading ? (
            <div className="flex h-48 items-center justify-center">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : movements.length === 0 ? (
            <div className="p-12 text-center">
              <TrendingUp className="mx-auto h-8 w-8 text-ink-mute/50" />
              <h3 className="mt-3 text-sm font-semibold text-ink">No career movement requests</h3>
              <p className="mt-1 text-xs text-ink-mute">
                Submit promotion and transfer requests with complete before/after snapshot governance.
              </p>
              <Button
                variant="primary-pill"
                size="sm"
                onClick={() => setIsCreateMovementOpen(true)}
                className="mt-4"
              >
                Initiate Career Movement
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-hairline bg-canvas-lavender/30 text-[11px] font-semibold uppercase text-ink-mute">
                  <tr>
                    <th className="py-3 pl-4 pr-3">Employee</th>
                    <th className="px-3 py-3">Movement Type</th>
                    <th className="px-3 py-3">Current Assignment</th>
                    <th className="px-3 py-3">Proposed Changes</th>
                    <th className="px-3 py-3">Effective Date</th>
                    <th className="px-3 py-3">Status</th>
                    <th className="py-3 pl-3 pr-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hairline">
                  {movements.map((m) => (
                    <tr key={m.id} className="hover:bg-canvas-soft/30 transition-colors">
                      <td className="py-3 pl-4 pr-3">
                        <div className="font-semibold text-ink">{m.employee?.displayName || 'Employee'}</div>
                        <span className="font-mono text-[11px] text-ink-mute">{m.employee?.employeeNumber}</span>
                      </td>
                      <td className="px-3 py-3">
                        <span className="rounded bg-primary/10 px-2 py-0.5 font-bold uppercase text-[10px] text-primary">
                          {m.movementType}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-ink-mute">
                        <div className="font-medium text-ink">{m.currentSnapshot.title}</div>
                        <span className="text-[11px]">{m.currentSnapshot.departmentName || 'Department'}</span>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-1 font-medium text-emerald-700">
                          <ArrowRight className="h-3.5 w-3.5 text-emerald-600" />
                          {m.proposedSnapshot.title}
                        </div>
                      </td>
                      <td className="px-3 py-3 text-ink-mute">{m.requestedEffectiveDate}</td>
                      <td className="px-3 py-3">
                        <span
                          className={`rounded-none px-2 py-0.5 text-[10px] font-bold uppercase ${
                            m.status === 'approved'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : m.status === 'rejected'
                              ? 'bg-red-50 text-red-700 border border-red-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {m.status}
                        </span>
                      </td>
                      <td className="py-3 pl-3 pr-4 text-right">
                        {m.status === 'pending' && (
                          <div className="flex justify-end gap-1.5">
                            <Button
                              variant="primary-pill"
                              size="sm"
                              onClick={() => approveMovementMutation.mutateAsync({ id: m.id, status: 'approved' })}
                              className="h-7 text-xs"
                            >
                              Approve
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => approveMovementMutation.mutateAsync({ id: m.id, status: 'rejected' })}
                              className="h-7 text-xs text-red-600 hover:bg-red-50"
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
      )}

      {/* TAB 3: EMPLOYMENT CONTRACTS */}
      {activeTab === 'contracts' && (
        <div className="overflow-hidden rounded-none border border-hairline bg-canvas ">
          {contractsLoading ? (
            <div className="flex h-48 items-center justify-center">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : contracts.length === 0 ? (
            <div className="p-12 text-center">
              <FileCheck className="mx-auto h-8 w-8 text-ink-mute/50" />
              <h3 className="mt-3 text-sm font-semibold text-ink">No employment contracts recorded</h3>
              <p className="mt-1 text-xs text-ink-mute">
                Register permanent, fixed-term, and consultant contracts for statutory labor compliance.
              </p>
              <Button
                variant="primary-pill"
                size="sm"
                onClick={() => setIsCreateContractOpen(true)}
                className="mt-4"
              >
                Register First Contract
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-hairline bg-canvas-lavender/30 text-[11px] font-semibold uppercase text-ink-mute">
                  <tr>
                    <th className="py-3 pl-4 pr-3">Contract No</th>
                    <th className="px-3 py-3">Employee</th>
                    <th className="px-3 py-3">Contract Type</th>
                    <th className="px-3 py-3">Start Date</th>
                    <th className="px-3 py-3">End Date</th>
                    <th className="px-3 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hairline">
                  {contracts.map((c) => (
                    <tr key={c.id} className="hover:bg-canvas-soft/30 transition-colors">
                      <td className="py-3 pl-4 pr-3 font-mono font-medium text-ink">
                        {c.contractNumber || '—'}
                      </td>
                      <td className="px-3 py-3">
                        <div className="font-semibold text-ink">{c.employee?.displayName || 'Employee'}</div>
                        <span className="font-mono text-[11px] text-ink-mute">{c.employee?.employeeNumber}</span>
                      </td>
                      <td className="px-3 py-3 font-medium capitalize text-ink">{c.contractType}</td>
                      <td className="px-3 py-3 text-ink-mute">{c.startDate}</td>
                      <td className="px-3 py-3 text-ink-mute">{c.endDate || 'Permanent'}</td>
                      <td className="px-3 py-3">
                        <span className="rounded-none bg-emerald-50 px-2 py-0.5 font-bold uppercase text-[10px] text-emerald-700 border border-emerald-200">
                          {c.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: SKILLS & COMPETENCIES */}
      {activeTab === 'skills' && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {skillsLoading ? (
            <div className="col-span-full flex h-48 items-center justify-center">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : skills.length === 0 ? (
            <div className="col-span-full rounded-none border border-hairline bg-canvas p-12 text-center">
              <Award className="mx-auto h-8 w-8 text-ink-mute/50" />
              <h3 className="mt-3 text-sm font-semibold text-ink">Skills Catalog Ready</h3>
              <p className="mt-1 text-xs text-ink-mute">
                Competencies and skills can be evaluated and mapped against employee profiles.
              </p>
            </div>
          ) : (
            skills.map((skill) => (
              <div key={skill.id} className="rounded-none border border-hairline bg-canvas p-4  space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-ink text-sm">{skill.name}</span>
                  <span className="font-mono text-xs text-ink-mute">{skill.code}</span>
                </div>
                <span className="rounded bg-canvas-soft px-2 py-0.5 text-[10px] font-semibold text-ink">
                  {skill.category || 'General Skill'}
                </span>
              </div>
            ))
          )}
        </div>
      )}

      {/* PROBATION EVALUATION MODAL */}
      {evaluatingReview && (
        <Dialog
          isOpen={Boolean(evaluatingReview)}
          onClose={() => setEvaluatingReview(null)}
          title="Complete Probation Evaluation"
          description={`Submit performance review for ${evaluatingReview.employee?.displayName || 'Employee'}`}
          maxWidth="md"
        >
          <form onSubmit={handleProbationSubmit} className="space-y-4 text-xs">
            <div>
              <Label htmlFor="probationOutcome">Probation Outcome *</Label>
              <Select
                id="probationOutcome"
                value={probationOutcome}
                onChange={(e) => setProbationOutcome(e.target.value as any)}
                
              >
                <option value="confirmed">Confirm (Pass Probation & Confirm Full Employment)</option>
                <option value="extended">Extend Probation Period</option>
                <option value="terminated">Terminate Employment</option>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="probationRating">Performance Rating (1.0 to 5.0) *</Label>
                <Input
                  id="probationRating"
                  type="number"
                  step="0.1"
                  min="1"
                  max="5"
                  value={probationRating}
                  onChange={(e) => setProbationRating(parseFloat(e.target.value))}
                />
              </div>

              <div>
                <Label htmlFor="probationEffectiveDate">Effective Date *</Label>
                <Input
                  id="probationEffectiveDate"
                  type="date"
                  value={probationEffectiveDate}
                  onChange={(e) => setProbationEffectiveDate(e.target.value)}
                />
              </div>
            </div>

            {probationOutcome === 'extended' && (
              <div>
                <Label htmlFor="probationExtensionDate">New Probation End Date *</Label>
                <Input
                  id="probationExtensionDate"
                  type="date"
                  value={probationExtensionDate}
                  onChange={(e) => setProbationExtensionDate(e.target.value)}
                />
              </div>
            )}

            <div>
              <Label htmlFor="probationComments">Assessment Comments & Notes *</Label>
              <Textarea
                id="probationComments"
                rows={3}
                required
                value={probationComments}
                onChange={(e) => setProbationComments(e.target.value)}
                placeholder="Detail key performance achievements, KPI metrics, and manager approval notes..."
                
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-hairline">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setEvaluatingReview(null)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary-pill"
                size="sm"
                disabled={submitReviewMutation.isPending}
              >
                {submitReviewMutation.isPending ? 'Submitting...' : 'Save & Confirm'}
              </Button>
            </div>
          </form>
        </Dialog>
      )}

      {/* CREATE MOVEMENT REQUEST MODAL */}
      <Dialog
        isOpen={isCreateMovementOpen}
        onClose={() => setIsCreateMovementOpen(false)}
        title="Initiate Career Movement"
        description="Request role transfer or promotion."
        maxWidth="md"
      >
        <form onSubmit={handleMovementCreate} className="space-y-4 text-xs">
          <div>
            <Label htmlFor="selectedEmpId">Select Employee *</Label>
            <Select
              id="selectedEmpId"
              required
              value={selectedEmpId}
              onChange={(e) => setSelectedEmpId(e.target.value)}
              
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
              <Label htmlFor="movementType">Movement Type *</Label>
              <Select
                id="movementType"
                value={movementType}
                onChange={(e) => setMovementType(e.target.value as any)}
                
              >
                <option value="promotion">Promotion</option>
                <option value="transfer">Department Transfer</option>
                <option value="redesignation">Re-designation</option>
                <option value="location_transfer">Location Transfer</option>
              </Select>
            </div>

            <div>
              <Label htmlFor="effectiveDate">Effective Date *</Label>
              <Input
                id="effectiveDate"
                type="date"
                required
                value={effectiveDate}
                onChange={(e) => setEffectiveDate(e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="proposedTitle">Proposed Title / Designation</Label>
            <Input
              id="proposedTitle"
              placeholder="e.g. Lead Software Architect"
              value={proposedTitle}
              onChange={(e) => setProposedTitle(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="proposedDeptId">Proposed Department</Label>
              <Select
                id="proposedDeptId"
                value={proposedDeptId}
                onChange={(e) => setProposedDeptId(e.target.value)}
                
              >
                <option value="">Keep Existing</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <Label htmlFor="proposedBranchId">Proposed Branch</Label>
              <Select
                id="proposedBranchId"
                value={proposedBranchId}
                onChange={(e) => setProposedBranchId(e.target.value)}
                
              >
                <option value="">Keep Existing</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="movementReason">Reason for Movement *</Label>
            <Textarea
              id="movementReason"
              rows={3}
              required
              value={movementReason}
              onChange={(e) => setMovementReason(e.target.value)}
              placeholder="e.g. Promotion based on H1 engineering review and leadership assessment."
              
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-hairline">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsCreateMovementOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary-pill"
              size="sm"
              disabled={createMovementMutation.isPending}
            >
              {createMovementMutation.isPending ? 'Submitting...' : 'Submit Movement'}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* CREATE CONTRACT MODAL */}
      <Dialog
        isOpen={isCreateContractOpen}
        onClose={() => setIsCreateContractOpen(false)}
        title="Register Employment Contract"
        description="Upload employment contract."
        maxWidth="md"
      >
        <form onSubmit={handleContractCreate} className="space-y-4 text-xs">
          <div>
            <Label htmlFor="contractEmpId">Select Employee *</Label>
            <Select
              id="contractEmpId"
              required
              value={contractEmpId}
              onChange={(e) => setContractEmpId(e.target.value)}
              
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
              <Label htmlFor="contractNumber">Contract Reference No</Label>
              <Input
                id="contractNumber"
                placeholder="e.g. CONT-2026-001"
                value={contractNumber}
                onChange={(e) => setContractNumber(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="contractType">Contract Type *</Label>
              <Select
                id="contractType"
                value={contractType}
                onChange={(e) => setContractType(e.target.value)}
                
              >
                <option value="permanent">Permanent</option>
                <option value="fixed_term">Fixed Term Contract</option>
                <option value="consultant">Consultant Agreement</option>
                <option value="internship">Internship Contract</option>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="contractStartDate">Start Date *</Label>
              <Input
                id="contractStartDate"
                type="date"
                required
                value={contractStartDate}
                onChange={(e) => setContractStartDate(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="contractEndDate">End Date (If Fixed Term)</Label>
              <Input
                id="contractEndDate"
                type="date"
                value={contractEndDate}
                onChange={(e) => setContractEndDate(e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-hairline">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsCreateContractOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary-pill"
              size="sm"
              disabled={createContractMutation.isPending}
            >
              {createContractMutation.isPending ? 'Saving...' : 'Register Contract'}
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
};
