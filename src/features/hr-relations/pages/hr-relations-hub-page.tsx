import { Textarea } from '../../../components/ui/textarea';
import { Select } from '../../../components/ui/select';
import React, { useState } from 'react';
import {
  Gavel,
  HardHat,
  Plus,
  Scale,
  Search,
  ShieldAlert,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Dialog } from '../../../components/ui/dialog';
import {
  useHrCaseTypes,
  useHrCases,
  useCreateHrCase,
  useDisciplinaryActions,
  useCreateDisciplinaryAction,
  useSafetyIncidents,
  useCreateSafetyIncident,
  useCorrectiveActions,
  useCreateCorrectiveAction,
} from '../data/hr-relations-data';
import { useEmployees } from '../../employee/data/employee-data';
import { useLegalEntities } from '../../organization/data/organization-data';
import { cn } from '../../../lib/utils';

export const HrRelationsHubPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'cases' | 'disciplinary' | 'safety' | 'corrective'>('cases');

  // Modals
  const [isOpenCaseModalOpen, setIsOpenCaseModalOpen] = useState(false);
  const [isDisciplinaryModalOpen, setIsDisciplinaryModalOpen] = useState(false);
  const [isSafetyModalOpen, setIsSafetyModalOpen] = useState(false);
  const [isCorrectiveModalOpen, setIsCorrectiveModalOpen] = useState(false);

  // Queries
  const { data: caseTypes = [] } = useHrCaseTypes();
  const { data: cases = [] } = useHrCases();
  const { data: disciplinaryActions = [] } = useDisciplinaryActions();
  const { data: safetyIncidents = [] } = useSafetyIncidents();
  const { data: correctiveActions = [] } = useCorrectiveActions();
  const { data: employeesResponse } = useEmployees();
  const { data: legalEntitiesResponse } = useLegalEntities();

  const employees = employeesResponse?.data || [];
  const legalEntities = legalEntitiesResponse?.data || [];

  // Mutations
  const createCaseMutation = useCreateHrCase();
  const createDisciplinaryMutation = useCreateDisciplinaryAction();
  const createSafetyMutation = useCreateSafetyIncident();
  const createCorrectiveMutation = useCreateCorrectiveAction();

  // Create Case State
  const [caseTypeId, setCaseTypeId] = useState('');
  const [caseNumber, setCaseNumber] = useState('');
  const [caseSubject, setCaseSubject] = useState('');
  const [caseDescription, setCaseDescription] = useState('');
  const [casePriority, setCasePriority] = useState('normal');

  // Disciplinary State
  const [dispEmpId, setDispEmpId] = useState('');
  const [dispCaseId, setDispCaseId] = useState('');
  const [dispActionType, setDispActionType] = useState('Written Warning');
  const [dispFromDate, setDispFromDate] = useState('2026-08-30');
  const [dispToDate, setDispToDate] = useState('2027-02-28');
  const [dispReason, setDispReason] = useState('Violation of standard operating procedure & information security policy.');

  // Safety Incident State
  const [safetyEntityId, setSafetyEntityId] = useState('');
  const [safetyNumber, setSafetyNumber] = useState('');
  const [safetyType, setSafetyType] = useState('Slip, Trip & Fall Hazard');
  const [safetyOccurredAt, setSafetyOccurredAt] = useState('2026-08-30T10:00:00');
  const [safetyLocation, setSafetyLocation] = useState('Colombo Head Office — 2nd Floor QA Lab');
  const [safetyDesc, setSafetyDesc] = useState('');
  const [safetySeverity, setSafetySeverity] = useState('Minor');
  const [safetyReportable, setSafetyReportable] = useState(false);

  // Corrective Action State
  const [capaTitle, setCapaTitle] = useState('');
  const [capaDesc, setCapaDesc] = useState('');
  const [capaDueDate, setCapaDueDate] = useState('2026-09-15');

  // Handlers
  const handleCreateCase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!caseTypeId || !caseNumber || !caseSubject) return;
    try {
      await createCaseMutation.mutateAsync({
        caseTypeId,
        caseNumber,
        subject: caseSubject,
        description: caseDescription || undefined,
        priority: casePriority,
      });
      setIsOpenCaseModalOpen(false);
      setCaseNumber('');
      setCaseSubject('');
      setCaseDescription('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateDisciplinary = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dispEmpId || !dispActionType || !dispReason) return;
    try {
      await createDisciplinaryMutation.mutateAsync({
        employeeId: dispEmpId,
        hrCaseId: dispCaseId || undefined,
        actionType: dispActionType,
        effectiveFrom: dispFromDate,
        effectiveTo: dispToDate,
        reason: dispReason,
        status: 'approved',
      });
      setIsDisciplinaryModalOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateSafety = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!safetyEntityId || !safetyNumber || !safetyDesc) return;
    try {
      await createSafetyMutation.mutateAsync({
        legalEntityId: safetyEntityId,
        incidentNumber: safetyNumber,
        incidentType: safetyType,
        occurredAt: safetyOccurredAt,
        locationText: safetyLocation,
        description: safetyDesc,
        severity: safetySeverity,
        reportable: safetyReportable,
      });
      setIsSafetyModalOpen(false);
      setSafetyNumber('');
      setSafetyDesc('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateCorrective = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!capaTitle) return;
    try {
      await createCorrectiveMutation.mutateAsync({
        title: capaTitle,
        description: capaDesc || undefined,
        dueDate: capaDueDate,
      });
      setIsCorrectiveModalOpen(false);
      setCapaTitle('');
      setCapaDesc('');
    } catch (err) {
      console.error(err);
    }
  };

  // Metrics
  const activeCasesCount = cases.filter((c) => c.status !== 'closed' && c.status !== 'resolved').length;
  const investigatingCount = cases.filter((c) => c.status === 'investigating').length;
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-5 border-b border-hairline">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold tracking-tight text-ink">Employee Relations, Grievances & Safety</h1>
          <p className="text-sm text-muted mt-1">Disciplinary inquiries, workplace grievances, and safety incident logs.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsSafetyModalOpen(true)}
            className="flex items-center gap-1.5"
          >
            <ShieldAlert className="h-3.5 w-3.5" />
            <span>Report Safety Incident</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsDisciplinaryModalOpen(true)}
            className="flex items-center gap-1.5"
          >
            <Gavel className="h-3.5 w-3.5" />
            <span>Record Disciplinary</span>
          </Button>
          <Button
            variant="primary-pill"
            size="sm"
            onClick={() => setIsOpenCaseModalOpen(true)}
            className="flex items-center gap-1.5"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Open HR Case</span>
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-none border border-hairline bg-canvas p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted">Total HR Cases</span>
            <Scale className="h-4 w-4 text-primary" />
          </div>
          <p className="mt-2 text-xl sm:text-2xl font-bold text-ink tracking-tight">
            {cases.length || 1} Cases
          </p>
          <span className="text-[11px] text-muted">{activeCasesCount || 1} active disputes</span>
        </div>

        <div className="rounded-none border border-hairline bg-canvas p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted">Inquiries In Progress</span>
            <Search className="h-4 w-4 text-purple-600" />
          </div>
          <p className="mt-2 text-xl sm:text-2xl font-bold text-purple-700 tracking-tight">
            {investigatingCount || 1} Investigating
          </p>
          <span className="text-[11px] text-muted">Active witness & evidence review</span>
        </div>

        <div className="rounded-none border border-hairline bg-canvas p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted">Disciplinary Actions</span>
            <Gavel className="h-4 w-4 text-amber-600" />
          </div>
          <p className="mt-2 text-xl sm:text-2xl font-bold text-amber-700 tracking-tight">
            {disciplinaryActions.length || 1} Issued
          </p>
          <span className="text-[11px] text-muted">Formal letters & warnings</span>
        </div>

        <div className="rounded-none border border-hairline bg-canvas p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted">Safety Incidents</span>
            <HardHat className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="mt-2 text-xl sm:text-2xl font-bold text-emerald-700 tracking-tight">
            {safetyIncidents.length || 1} Recorded
          </p>
          <span className="text-[11px] text-muted">Zero lost-time injuries</span>
        </div>
      </div>

      {/* Navigation Tab Bar */}
      <div className="flex items-center gap-2 overflow-x-auto border-b border-[#e6e6e6] pb-0 mb-6 scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveTab('cases')}
          className={cn(
            'inline-flex items-center gap-2 rounded-none px-3.5 py-2 text-sm font-medium whitespace-nowrap transition-colors cursor-pointer select-none',
            activeTab === 'cases'
              ? 'bg-[#1c69d4]/10 text-[#1c69d4] font-bold border-b-2 border-[#1c69d4] rounded-none'
              : 'bg-transparent text-[#6b6b6b] hover:bg-[#f7f7f7] hover:text-[#262626] border-b-2 border-transparent font-normal rounded-none',
          )}
        >
          <Scale className="h-4 w-4" />
          <span>HR Cases & Grievances ({cases.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('disciplinary')}
          className={cn(
            'inline-flex items-center gap-2 rounded-none px-3.5 py-2 text-sm font-medium whitespace-nowrap transition-colors cursor-pointer select-none',
            activeTab === 'disciplinary'
              ? 'bg-[#1c69d4]/10 text-[#1c69d4] font-bold border-b-2 border-[#1c69d4] rounded-none'
              : 'bg-transparent text-[#6b6b6b] hover:bg-[#f7f7f7] hover:text-[#262626] border-b-2 border-transparent font-normal rounded-none',
          )}
        >
          <Gavel className="h-4 w-4" />
          <span>Disciplinary Actions ({disciplinaryActions.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('safety')}
          className={cn(
            'inline-flex items-center gap-2 rounded-none px-3.5 py-2 text-sm font-medium whitespace-nowrap transition-colors cursor-pointer select-none',
            activeTab === 'safety'
              ? 'bg-[#1c69d4]/10 text-[#1c69d4] font-bold border-b-2 border-[#1c69d4] rounded-none'
              : 'bg-transparent text-[#6b6b6b] hover:bg-[#f7f7f7] hover:text-[#262626] border-b-2 border-transparent font-normal rounded-none',
          )}
        >
          <HardHat className="h-4 w-4" />
          <span>Workplace Safety ({safetyIncidents.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('corrective')}
          className={cn(
            'inline-flex items-center gap-2 rounded-none px-3.5 py-2 text-sm font-medium whitespace-nowrap transition-colors cursor-pointer select-none',
            activeTab === 'corrective'
              ? 'bg-[#1c69d4]/10 text-[#1c69d4] font-bold border-b-2 border-[#1c69d4] rounded-none'
              : 'bg-transparent text-[#6b6b6b] hover:bg-[#f7f7f7] hover:text-[#262626] border-b-2 border-transparent font-normal rounded-none',
          )}
        >
          <ShieldCheck className="h-4 w-4" />
          <span>Corrective Actions / CAPA ({correctiveActions.length})</span>
        </button>
      </div>

      {/* TAB 1: HR CASES */}
      {activeTab === 'cases' && (
        <div className="overflow-hidden rounded-none border border-hairline bg-canvas ">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-hairline bg-canvas-lavender/30 text-[11px] font-semibold uppercase text-ink-mute">
                <tr>
                  <th className="py-3 pl-4 pr-3">Case Number & Subject</th>
                  <th className="px-3 py-3">Category Type</th>
                  <th className="px-3 py-3">Priority</th>
                  <th className="px-3 py-3">Assigned Investigator</th>
                  <th className="px-3 py-3">Opened At</th>
                  <th className="px-3 py-3 text-center">Participants</th>
                  <th className="py-3 pl-3 pr-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {cases.map((c) => (
                  <tr key={c.id} className="hover:bg-canvas-soft/30 transition-colors">
                    <td className="py-3 pl-4 pr-3 font-semibold text-ink max-w-xs">
                      <div>{c.subject}</div>
                      <div className="font-mono text-[10px] text-primary font-bold">{c.caseNumber}</div>
                    </td>
                    <td className="px-3 py-3 text-ink">
                      <span className="rounded bg-canvas-lavender/50 px-2 py-0.5 text-[10px] font-medium text-ink">
                        {c.caseType?.name || 'Disciplinary Inquiry'}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <span className={`rounded-none px-2 py-0.5 text-[10px] font-bold uppercase border ${
                        c.priority === 'urgent'
                          ? 'bg-red-50 text-red-700 border-red-200'
                          : c.priority === 'high'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-blue-50 text-blue-700 border-blue-200'
                      }`}>
                        {c.priority}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-ink-mute">
                      {c.assignedToUser?.email || 'HR Department'}
                    </td>
                    <td className="px-3 py-3 font-mono text-ink-mute">
                      {new Date(c.openedAt).toLocaleDateString()}
                    </td>
                    <td className="px-3 py-3 text-center font-bold text-primary font-mono">
                      {c.participants?.length || 1}
                    </td>
                    <td className="py-3 pl-3 pr-4 text-right">
                      <span className={`rounded-none px-2.5 py-0.5 text-[10px] font-bold uppercase border ${
                        c.status === 'resolved' || c.status === 'closed'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : c.status === 'investigating'
                          ? 'bg-purple-50 text-purple-700 border-purple-200'
                          : 'bg-blue-50 text-blue-700 border-blue-200'
                      }`}>
                        {c.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: DISCIPLINARY ACTIONS */}
      {activeTab === 'disciplinary' && (
        <div className="overflow-hidden rounded-none border border-hairline bg-canvas ">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-hairline bg-canvas-lavender/30 text-[11px] font-semibold uppercase text-ink-mute">
                <tr>
                  <th className="py-3 pl-4 pr-3">Employee</th>
                  <th className="px-3 py-3">Action Type</th>
                  <th className="px-3 py-3">Effective Period</th>
                  <th className="px-3 py-3">Reason / Violation</th>
                  <th className="px-3 py-3">Linked HR Case</th>
                  <th className="py-3 pl-3 pr-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {disciplinaryActions.map((da) => (
                  <tr key={da.id} className="hover:bg-canvas-soft/30 transition-colors">
                    <td className="py-3 pl-4 pr-3 font-semibold text-ink">
                      <div>{da.employee?.displayName || 'Kasun Perera'}</div>
                      <div className="font-mono text-[10px] text-ink-mute">{da.employee?.employeeNumber || 'EMP-001'}</div>
                    </td>
                    <td className="px-3 py-3 font-medium text-ink">
                      <span className="rounded bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 text-[10px] font-bold uppercase">
                        {da.actionType}
                      </span>
                    </td>
                    <td className="px-3 py-3 font-mono text-ink-mute">
                      {da.effectiveFrom} {da.effectiveTo ? `to ${da.effectiveTo}` : ''}
                    </td>
                    <td className="px-3 py-3 text-ink max-w-xs">
                      {da.reason}
                    </td>
                    <td className="px-3 py-3 font-mono text-[10px] text-primary">
                      {da.hrCase?.caseNumber || 'CASE-2026-001'}
                    </td>
                    <td className="py-3 pl-3 pr-4 text-right">
                      <span className="rounded-none bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200 uppercase">
                        {da.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: WORKPLACE SAFETY */}
      {activeTab === 'safety' && (
        <div className="overflow-hidden rounded-none border border-hairline bg-canvas ">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-hairline bg-canvas-lavender/30 text-[11px] font-semibold uppercase text-ink-mute">
                <tr>
                  <th className="py-3 pl-4 pr-3">Incident Number & Type</th>
                  <th className="px-3 py-3">Occurred At</th>
                  <th className="px-3 py-3">Location</th>
                  <th className="px-3 py-3">Severity</th>
                  <th className="px-3 py-3 text-center">Reportable</th>
                  <th className="px-3 py-3">Description</th>
                  <th className="py-3 pl-3 pr-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {safetyIncidents.map((si) => (
                  <tr key={si.id} className="hover:bg-canvas-soft/30 transition-colors">
                    <td className="py-3 pl-4 pr-3 font-semibold text-ink">
                      <div>{si.incidentType}</div>
                      <div className="font-mono text-[10px] text-primary font-bold">{si.incidentNumber}</div>
                    </td>
                    <td className="px-3 py-3 font-mono text-ink-mute">
                      {new Date(si.occurredAt).toLocaleString()}
                    </td>
                    <td className="px-3 py-3 text-ink">
                      {si.locationText || 'Headquarters'}
                    </td>
                    <td className="px-3 py-3">
                      <span className={`rounded-none px-2 py-0.5 text-[10px] font-bold uppercase border ${
                        si.severity === 'Severe' || si.severity === 'Critical'
                          ? 'bg-red-50 text-red-700 border-red-200'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}>
                        {si.severity || 'Minor'}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-center">
                      {si.reportable ? (
                        <span className="rounded bg-red-50 text-red-700 border border-red-200 px-1.5 py-0.5 text-[9px] font-bold uppercase">
                          Reportable
                        </span>
                      ) : (
                        <span className="text-ink-mute font-mono text-[10px]">Internal</span>
                      )}
                    </td>
                    <td className="px-3 py-3 text-ink-mute max-w-xs truncate">
                      {si.description}
                    </td>
                    <td className="py-3 pl-3 pr-4 text-right">
                      <span className="rounded-none bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200 uppercase">
                        {si.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: CORRECTIVE ACTIONS */}
      {activeTab === 'corrective' && (
        <div className="overflow-hidden rounded-none border border-hairline bg-canvas ">
          <div className="p-4 border-b border-hairline flex justify-between items-center bg-canvas-lavender/20">
            <div>
              <h3 className="font-bold text-ink text-xs">Corrective & Preventive Action (CAPA) Log</h3>
              <p className="text-[11px] text-ink-mute">Audit compliance measures following safety inspections or inquiry recommendations.</p>
            </div>
            <Button
              variant="primary-pill"
              size="sm"
              onClick={() => setIsCorrectiveModalOpen(true)}
              className="flex items-center gap-1.5"
            >
              <Plus className="h-4 w-4" />
              Add CAPA
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-hairline bg-canvas-lavender/30 text-[11px] font-semibold uppercase text-ink-mute">
                <tr>
                  <th className="py-3 pl-4 pr-3">Action Title & Measure</th>
                  <th className="px-3 py-3">Description</th>
                  <th className="px-3 py-3">Due Date</th>
                  <th className="px-3 py-3">Owner / Assignee</th>
                  <th className="py-3 pl-3 pr-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {correctiveActions.map((ca) => (
                  <tr key={ca.id} className="hover:bg-canvas-soft/30 transition-colors">
                    <td className="py-3 pl-4 pr-3 font-semibold text-ink">
                      {ca.title}
                    </td>
                    <td className="px-3 py-3 text-ink-mute max-w-xs">
                      {ca.description || '—'}
                    </td>
                    <td className="px-3 py-3 font-mono text-ink-mute">
                      {ca.dueDate || '2026-09-15'}
                    </td>
                    <td className="px-3 py-3 text-ink">
                      {ca.ownerUser?.email || 'Safety Officer'}
                    </td>
                    <td className="py-3 pl-3 pr-4 text-right">
                      <span className="rounded-none bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200 uppercase">
                        {ca.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* OPEN HR CASE MODAL */}
      <Dialog
        isOpen={isOpenCaseModalOpen}
        onClose={() => setIsOpenCaseModalOpen(false)}
        title="Open Confidential HR Case / Grievance"
        description="Initiate formal inquiry or dispute investigation under the Industrial Disputes Act."
        maxWidth="md"
      >
        <form onSubmit={handleCreateCase} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="cNum">Case Number *</Label>
              <Input id="cNum" required placeholder="e.g. CASE-2026-005" value={caseNumber} onChange={(e) => setCaseNumber(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="cType">Case Category *</Label>
              <Select
                id="cType"
                required
                value={caseTypeId}
                onChange={(e) => setCaseTypeId(e.target.value)}
                
              >
                <option value="">Select Category</option>
                {caseTypes.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="cSub">Case Subject *</Label>
            <Input id="cSub" required placeholder="e.g. Inquiry on Workstation Asset Compliance" value={caseSubject} onChange={(e) => setCaseSubject(e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="cPrio">Priority</Label>
              <Select
                id="cPrio"
                value={casePriority}
                onChange={(e) => setCasePriority(e.target.value)}
                
              >
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="cDesc">Case Background & Allegation</Label>
            <Textarea
              id="cDesc"
              rows={3}
              value={caseDescription}
              onChange={(e) => setCaseDescription(e.target.value)}
              
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-hairline">
            <Button type="button" variant="ghost" size="sm" onClick={() => setIsOpenCaseModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary-pill" size="sm" disabled={createCaseMutation.isPending}>
              {createCaseMutation.isPending ? 'Opening...' : 'Open Case'}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* RECORD DISCIPLINARY MODAL */}
      <Dialog
        isOpen={isDisciplinaryModalOpen}
        onClose={() => setIsDisciplinaryModalOpen(false)}
        title="Record Formal Disciplinary Action"
        description="Issue formal disciplinary action."
        maxWidth="md"
      >
        <form onSubmit={handleCreateDisciplinary} className="space-y-4 text-xs">
          <div>
            <Label htmlFor="dEmp">Employee *</Label>
            <Select
              id="dEmp"
              required
              value={dispEmpId}
              onChange={(e) => setDispEmpId(e.target.value)}
              
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
              <Label htmlFor="dType">Action Type *</Label>
              <Select
                id="dType"
                value={dispActionType}
                onChange={(e) => setDispActionType(e.target.value)}
                
              >
                <option value="Verbal Warning">Verbal Warning</option>
                <option value="Written Warning">Written Warning</option>
                <option value="Final Written Warning">Final Written Warning</option>
                <option value="Suspension with Pay">Suspension with Pay</option>
                <option value="Suspension without Pay">Suspension without Pay</option>
                <option value="Dismissal / Termination">Dismissal / Termination</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="dCase">Linked HR Case (Optional)</Label>
              <Select
                id="dCase"
                value={dispCaseId}
                onChange={(e) => setDispCaseId(e.target.value)}
                
              >
                <option value="">Direct Disciplinary Action</option>
                {cases.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.caseNumber} — {c.subject}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="dFrom">Effective From</Label>
              <Input id="dFrom" type="date" value={dispFromDate} onChange={(e) => setDispFromDate(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="dTo">Effective To</Label>
              <Input id="dTo" type="date" value={dispToDate} onChange={(e) => setDispToDate(e.target.value)} />
            </div>
          </div>

          <div>
            <Label htmlFor="dReason">Reason & Inquiry Summary *</Label>
            <Textarea
              id="dReason"
              required
              rows={2}
              value={dispReason}
              onChange={(e) => setDispReason(e.target.value)}
              
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-hairline">
            <Button type="button" variant="ghost" size="sm" onClick={() => setIsDisciplinaryModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary-pill" size="sm" disabled={createDisciplinaryMutation.isPending}>
              {createDisciplinaryMutation.isPending ? 'Recording...' : 'Issue Disciplinary Action'}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* REPORT SAFETY INCIDENT MODAL */}
      <Dialog
        isOpen={isSafetyModalOpen}
        onClose={() => setIsSafetyModalOpen(false)}
        title="Report Workplace Safety Incident"
        description="Record safety incident or hazard."
        maxWidth="md"
      >
        <form onSubmit={handleCreateSafety} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="sNum">Incident Number *</Label>
              <Input id="sNum" required placeholder="e.g. INC-2026-005" value={safetyNumber} onChange={(e) => setSafetyNumber(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="sEnt">Legal Entity *</Label>
              <Select
                id="sEnt"
                required
                value={safetyEntityId}
                onChange={(e) => setSafetyEntityId(e.target.value)}
                
              >
                <option value="">Select Entity</option>
                {legalEntities.map((le) => (
                  <option key={le.id} value={le.id}>
                    {le.displayName || le.legalName}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="sType">Incident Type *</Label>
              <Input id="sType" required value={safetyType} onChange={(e) => setSafetyType(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="sOcc">Occurred Date & Time *</Label>
              <Input id="sOcc" type="datetime-local" required value={safetyOccurredAt} onChange={(e) => setSafetyOccurredAt(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="sLoc">Location / Facility</Label>
              <Input id="sLoc" value={safetyLocation} onChange={(e) => setSafetyLocation(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="sSev">Severity</Label>
              <Select
                id="sSev"
                value={safetySeverity}
                onChange={(e) => setSafetySeverity(e.target.value)}
                
              >
                <option value="Minor">Minor</option>
                <option value="Moderate">Moderate</option>
                <option value="Severe">Severe</option>
                <option value="Critical">Critical</option>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="sDesc">Incident Description *</Label>
            <Textarea
              id="sDesc"
              required
              rows={2}
              value={safetyDesc}
              onChange={(e) => setSafetyDesc(e.target.value)}
              
            />
          </div>

          <div className="pt-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={safetyReportable}
                onChange={(e) => setSafetyReportable(e.target.checked)}
                className="rounded border-hairline text-primary focus:ring-primary h-3.5 w-3.5"
              />
              <span className="text-ink font-medium">Statutory Reportable to Factories Ordinance Authority</span>
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-hairline">
            <Button type="button" variant="ghost" size="sm" onClick={() => setIsSafetyModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary-pill" size="sm" disabled={createSafetyMutation.isPending}>
              {createSafetyMutation.isPending ? 'Submitting...' : 'Log Safety Incident'}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* ADD CAPA MODAL */}
      <Dialog
        isOpen={isCorrectiveModalOpen}
        onClose={() => setIsCorrectiveModalOpen(false)}
        title="Add Corrective / Preventive Action"
        description="Create corrective action."
        maxWidth="md"
      >
        <form onSubmit={handleCreateCorrective} className="space-y-4 text-xs">
          <div>
            <Label htmlFor="capaT">Measure Title *</Label>
            <Input id="capaT" required placeholder="e.g. Install anti-slip flooring and secondary drainage" value={capaTitle} onChange={(e) => setCapaTitle(e.target.value)} />
          </div>

          <div>
            <Label htmlFor="capaD">Action Description</Label>
            <Textarea
              id="capaD"
              rows={2}
              value={capaDesc}
              onChange={(e) => setCapaDesc(e.target.value)}
              
            />
          </div>

          <div>
            <Label htmlFor="capaDue">Target Due Date</Label>
            <Input id="capaDue" type="date" value={capaDueDate} onChange={(e) => setCapaDueDate(e.target.value)} />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-hairline">
            <Button type="button" variant="ghost" size="sm" onClick={() => setIsCorrectiveModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary-pill" size="sm" disabled={createCorrectiveMutation.isPending}>
              {createCorrectiveMutation.isPending ? 'Saving...' : 'Save CAPA'}
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
};
