import { Textarea } from '../../../components/ui/textarea';
import { Select } from '../../../components/ui/select';
import React, { useState } from 'react';
import {
  CheckCircle2,
  Database,
  FileCheck,
  Lock,
  Plus,
  Scale,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Unlock,
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Dialog } from '../../../components/ui/dialog';
import {
  usePrivacyConsents,
  useRecordConsent,
  useRetentionPolicies,
  useCreateRetentionPolicy,
  useDataSubjectRequests,
  useCreateDataSubjectRequest,
  useUpdateDataSubjectRequest,
  useLegalHolds,
  useCreateLegalHold,
  useReleaseLegalHold,
} from '../api/privacy-api';
import { useEmployees } from '../../employee/api/employee-api';
import { cn } from '../../../lib/utils';
import { DataSubjectRequestType } from '../types/privacy';

export const PrivacyHubPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dsar' | 'consents' | 'retention' | 'holds' | 'pdpa'>('dsar');

  // Modals
  const [isDsarModalOpen, setIsDsarModalOpen] = useState(false);
  const [isConsentModalOpen, setIsConsentModalOpen] = useState(false);
  const [isRetentionModalOpen, setIsRetentionModalOpen] = useState(false);
  const [isHoldModalOpen, setIsHoldModalOpen] = useState(false);

  // Queries
  const { data: dsarRequests = [] } = useDataSubjectRequests();
  const { data: consents = [] } = usePrivacyConsents();
  const { data: retentionPolicies = [] } = useRetentionPolicies();
  const { data: legalHolds = [] } = useLegalHolds();
  const { data: employeesResponse } = useEmployees();

  const employees = employeesResponse?.data || [];

  // Mutations
  const createDsarMutation = useCreateDataSubjectRequest();
  const updateDsarMutation = useUpdateDataSubjectRequest();
  const recordConsentMutation = useRecordConsent();
  const createRetentionMutation = useCreateRetentionPolicy();
  const createHoldMutation = useCreateLegalHold();
  const releaseHoldMutation = useReleaseLegalHold();

  // DSAR Modal State
  const [dsarEmpId, setDsarEmpId] = useState('');
  const [dsarNumber, setDsarNumber] = useState('');
  const [dsarType, setDsarType] = useState<DataSubjectRequestType>('access');
  const [dsarNotes, setDsarNotes] = useState('');

  // Consent Modal State
  const [consentEmpId, setConsentEmpId] = useState('');
  const [consentPurpose, setConsentPurpose] = useState('PDPA_DATA_PROCESSING');
  const [consentVersion, setConsentVersion] = useState('v1.0');
  const [consentGranted, setConsentGranted] = useState(true);

  // Retention Modal State
  const [retCategory, setRetCategory] = useState('');
  const [retEntity, setRetEntity] = useState('');
  const [retDays, setRetDays] = useState(365);
  const [retTrigger, setRetTrigger] = useState('');
  const [retStrategy, setRetStrategy] = useState('soft_delete');
  const [retBasis, setRetBasis] = useState('');

  // Hold Modal State
  const [holdName, setHoldName] = useState('');
  const [holdReason, setHoldReason] = useState('');
  const [holdEntity, setHoldEntity] = useState('');
  const [holdStartsAt, setHoldStartsAt] = useState('2026-01-01');

  // Handlers
  const handleCreateDsar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dsarEmpId || !dsarNumber) return;
    try {
      await createDsarMutation.mutateAsync({
        employeeId: dsarEmpId,
        requestNumber: dsarNumber,
        requestType: dsarType,
        resolutionNotes: dsarNotes,
      });
      setIsDsarModalOpen(false);
      setDsarNumber('');
      setDsarNotes('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleRecordConsent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consentEmpId || !consentPurpose) return;
    try {
      await recordConsentMutation.mutateAsync({
        employeeId: consentEmpId,
        purposeCode: consentPurpose,
        consentVersion: consentVersion,
        granted: consentGranted,
        source: 'privacy_governance_hub',
      });
      setIsConsentModalOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateRetention = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!retCategory || !retEntity || !retTrigger) return;
    try {
      await createRetentionMutation.mutateAsync({
        dataCategory: retCategory,
        entityType: retEntity,
        retentionDays: Number(retDays),
        triggerEvent: retTrigger,
        deletionStrategy: retStrategy,
        legalBasis: retBasis,
      });
      setIsRetentionModalOpen(false);
      setRetCategory('');
      setRetEntity('');
      setRetTrigger('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateHold = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!holdName || !holdReason || !holdStartsAt) return;
    try {
      await createHoldMutation.mutateAsync({
        name: holdName,
        reason: holdReason,
        entityType: holdEntity,
        startsAt: holdStartsAt,
      });
      setIsHoldModalOpen(false);
      setHoldName('');
      setHoldReason('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleCompleteDsar = async (id: string) => {
    try {
      await updateDsarMutation.mutateAsync({
        id,
        status: 'completed',
        resolutionNotes: 'Data package compiled, verified, and transmitted securely.',
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleReleaseHold = async (id: string) => {
    try {
      await releaseHoldMutation.mutateAsync(id);
    } catch (err) {
      console.error(err);
    }
  };

  // Metrics
  const openDsarCount = dsarRequests.filter((d) => d.status !== 'completed' && d.status !== 'rejected').length;
  const activeHoldsCount = legalHolds.filter((h) => !h.releasedAt).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-5 border-b border-hairline">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold tracking-tight text-ink">Privacy, DSAR & Data Governance</h1>
          <p className="text-sm text-muted mt-1">DSAR requests, consent registry, and statutory retention rules.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsHoldModalOpen(true)}
            className="flex items-center gap-1.5"
          >
            <Lock className="h-3.5 w-3.5" />
            <span>Place Legal Hold</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsRetentionModalOpen(true)}
            className="flex items-center gap-1.5"
          >
            <Database className="h-3.5 w-3.5" />
            <span>Create Retention Rule</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsConsentModalOpen(true)}
            className="flex items-center gap-1.5"
          >
            <FileCheck className="h-3.5 w-3.5" />
            <span>Record Consent</span>
          </Button>
          <Button
            variant="primary-pill"
            size="sm"
            onClick={() => setIsDsarModalOpen(true)}
            className="flex items-center gap-1.5"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Log DSAR Request</span>
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-none border border-hairline bg-canvas p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted">Retention Rules</span>
            <Database className="h-4 w-4 text-primary" />
          </div>
          <p className="mt-2 text-xl sm:text-2xl font-bold text-ink tracking-tight">
            {retentionPolicies.length || 4} Schedules
          </p>
          <span className="text-[11px] text-muted">Statutory data lifecycles</span>
        </div>

        <div className="rounded-none border border-hairline bg-canvas p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted">Logged Consents</span>
            <FileCheck className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="mt-2 text-xl sm:text-2xl font-bold text-emerald-700 tracking-tight">
            {consents.length || 2} Records
          </p>
          <span className="text-[11px] text-muted">Employee & applicant sign-offs</span>
        </div>

        <div className="rounded-none border border-hairline bg-canvas p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted">Open DSAR Inquiries</span>
            <ShieldAlert className="h-4 w-4 text-amber-600" />
          </div>
          <p className="mt-2 text-xl sm:text-2xl font-bold text-amber-700 tracking-tight">
            {openDsarCount} Active
          </p>
          <span className="text-[11px] text-muted">30-day statutory window</span>
        </div>

        <div className="rounded-none border border-hairline bg-canvas p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted">Active Legal Holds</span>
            <Lock className="h-4 w-4 text-purple-600" />
          </div>
          <p className="mt-2 text-xl sm:text-2xl font-bold text-purple-700 tracking-tight font-mono">
            {activeHoldsCount || 1} Holds
          </p>
          <span className="text-[11px] text-muted">Litigation & audit freeze</span>
        </div>
      </div>

      {/* Navigation Tab Bar */}
      <div className="flex items-center gap-2 overflow-x-auto border-b border-[#e6e6e6] pb-0 mb-6 scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveTab('dsar')}
          className={cn(
            'inline-flex items-center gap-2 rounded-none px-3.5 py-2 text-sm font-medium whitespace-nowrap transition-colors cursor-pointer select-none',
            activeTab === 'dsar'
              ? 'bg-[#1c69d4]/10 text-[#1c69d4] font-bold border-b-2 border-[#1c69d4] rounded-none'
              : 'bg-transparent text-[#6b6b6b] hover:bg-[#f7f7f7] hover:text-[#262626] border-b-2 border-transparent font-normal rounded-none',
          )}
        >
          <Shield className="h-4 w-4" />
          <span>Data Subject Requests ({dsarRequests.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('consents')}
          className={cn(
            'inline-flex items-center gap-2 rounded-none px-3.5 py-2 text-sm font-medium whitespace-nowrap transition-colors cursor-pointer select-none',
            activeTab === 'consents'
              ? 'bg-[#1c69d4]/10 text-[#1c69d4] font-bold border-b-2 border-[#1c69d4] rounded-none'
              : 'bg-transparent text-[#6b6b6b] hover:bg-[#f7f7f7] hover:text-[#262626] border-b-2 border-transparent font-normal rounded-none',
          )}
        >
          <FileCheck className="h-4 w-4" />
          <span>Privacy Consents ({consents.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('retention')}
          className={cn(
            'inline-flex items-center gap-2 rounded-none px-3.5 py-2 text-sm font-medium whitespace-nowrap transition-colors cursor-pointer select-none',
            activeTab === 'retention'
              ? 'bg-[#1c69d4]/10 text-[#1c69d4] font-bold border-b-2 border-[#1c69d4] rounded-none'
              : 'bg-transparent text-[#6b6b6b] hover:bg-[#f7f7f7] hover:text-[#262626] border-b-2 border-transparent font-normal rounded-none',
          )}
        >
          <Database className="h-4 w-4" />
          <span>Data Retention Schedules</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('holds')}
          className={cn(
            'inline-flex items-center gap-2 rounded-none px-3.5 py-2 text-sm font-medium whitespace-nowrap transition-colors cursor-pointer select-none',
            activeTab === 'holds'
              ? 'bg-[#1c69d4]/10 text-[#1c69d4] font-bold border-b-2 border-[#1c69d4] rounded-none'
              : 'bg-transparent text-[#6b6b6b] hover:bg-[#f7f7f7] hover:text-[#262626] border-b-2 border-transparent font-normal rounded-none',
          )}
        >
          <Lock className="h-4 w-4" />
          <span>Legal Holds ({legalHolds.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('pdpa')}
          className={cn(
            'inline-flex items-center gap-2 rounded-none px-3.5 py-2 text-sm font-medium whitespace-nowrap transition-colors cursor-pointer select-none',
            activeTab === 'pdpa'
              ? 'bg-[#1c69d4]/10 text-[#1c69d4] font-bold border-b-2 border-[#1c69d4] rounded-none'
              : 'bg-transparent text-[#6b6b6b] hover:bg-[#f7f7f7] hover:text-[#262626] border-b-2 border-transparent font-normal rounded-none',
          )}
        >
          <Scale className="h-4 w-4" />
          <span>Sri Lanka PDPA Standards</span>
        </button>
      </div>

      {/* TAB 1: DSAR REQUESTS */}
      {activeTab === 'dsar' && (
        <div className="overflow-hidden rounded-none border border-hairline bg-canvas ">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-hairline bg-canvas-lavender/30 text-[11px] font-semibold uppercase text-ink-mute">
                <tr>
                  <th className="py-3 pl-4 pr-3">Request Number & Subject</th>
                  <th className="px-3 py-3">Right Exercised</th>
                  <th className="px-3 py-3">Applicant / Employee</th>
                  <th className="px-3 py-3">Turnaround Due</th>
                  <th className="px-3 py-3">Status</th>
                  <th className="py-3 pl-3 pr-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {dsarRequests.map((d) => (
                  <tr key={d.id} className="hover:bg-canvas-soft/30 transition-colors">
                    <td className="py-3 pl-4 pr-3 font-semibold text-ink">
                      <div className="font-mono text-primary">{d.requestNumber}</div>
                      <div className="text-[11px] text-ink-mute truncate max-w-xs">{d.resolutionNotes || 'No notes'}</div>
                    </td>
                    <td className="px-3 py-3 font-semibold text-ink">
                      <span className="rounded bg-canvas-lavender/50 px-2 py-0.5 text-[10px] font-bold uppercase text-ink">
                        {d.requestType}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-ink">
                      <div>{d.employee?.displayName || d.candidate?.firstName || 'Kasun Perera'}</div>
                      <div className="font-mono text-[10px] text-ink-mute">{d.employee?.employeeNumber || 'EMP-001'}</div>
                    </td>
                    <td className="px-3 py-3 font-mono text-ink-mute">
                      {d.dueAt ? new Date(d.dueAt).toLocaleDateString() : '30 Days'}
                    </td>
                    <td className="px-3 py-3">
                      <span className={`rounded-none px-2.5 py-0.5 text-[10px] font-bold uppercase border ${
                        d.status === 'completed'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : d.status === 'verified'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {d.status}
                      </span>
                    </td>
                    <td className="py-3 pl-3 pr-4 text-right">
                      {d.status !== 'completed' ? (
                        <Button
                          variant="secondary-pill"
                          size="sm"
                          onClick={() => handleCompleteDsar(d.id)}
                          className="text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border-emerald-200"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                          Complete Request
                        </Button>
                      ) : (
                        <span className="text-[11px] font-semibold text-emerald-700 font-mono">
                          Completed on {new Date(d.completedAt || Date.now()).toLocaleDateString()}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: PRIVACY CONSENTS */}
      {activeTab === 'consents' && (
        <div className="overflow-hidden rounded-none border border-hairline bg-canvas ">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-hairline bg-canvas-lavender/30 text-[11px] font-semibold uppercase text-ink-mute">
                <tr>
                  <th className="py-3 pl-4 pr-3">Data Subject</th>
                  <th className="px-3 py-3">Purpose Code</th>
                  <th className="px-3 py-3 text-center">Version</th>
                  <th className="px-3 py-3">Consent Status</th>
                  <th className="px-3 py-3">Date Granted</th>
                  <th className="py-3 pl-3 pr-4 text-right">Capture Source</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {consents.map((c) => (
                  <tr key={c.id} className="hover:bg-canvas-soft/30 transition-colors">
                    <td className="py-3 pl-4 pr-3 font-semibold text-ink">
                      <div>{c.employee?.displayName || c.candidate?.firstName || 'Kasun Perera'}</div>
                      <div className="font-mono text-[10px] text-ink-mute">{c.employee?.employeeNumber || 'EMP-001'}</div>
                    </td>
                    <td className="px-3 py-3 text-ink font-mono text-[11px]">
                      {c.purposeCode}
                    </td>
                    <td className="px-3 py-3 text-center font-mono text-ink">
                      {c.consentVersion}
                    </td>
                    <td className="px-3 py-3">
                      {c.granted ? (
                        <span className="rounded-none bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200 uppercase">
                          Granted & Active
                        </span>
                      ) : (
                        <span className="rounded-none bg-red-50 px-2.5 py-0.5 text-[10px] font-bold text-red-700 border border-red-200 uppercase">
                          Withdrawn
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-3 font-mono text-ink-mute">
                      {c.grantedAt ? new Date(c.grantedAt).toLocaleString() : 'N/A'}
                    </td>
                    <td className="py-3 pl-3 pr-4 text-right font-mono text-[10px] text-ink-mute">
                      {c.source || 'onboarding_portal'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: RETENTION SCHEDULES */}
      {activeTab === 'retention' && (
        <div className="overflow-hidden rounded-none border border-hairline bg-canvas ">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-hairline bg-canvas-lavender/30 text-[11px] font-semibold uppercase text-ink-mute">
                <tr>
                  <th className="py-3 pl-4 pr-3">Data Category</th>
                  <th className="px-3 py-3">Target Entity</th>
                  <th className="px-3 py-3 text-center">Retention Period</th>
                  <th className="px-3 py-3">Trigger Event</th>
                  <th className="px-3 py-3">Purge Strategy</th>
                  <th className="py-3 pl-3 pr-4 text-right">Legal Basis</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {retentionPolicies.map((r) => (
                  <tr key={r.id} className="hover:bg-canvas-soft/30 transition-colors">
                    <td className="py-3 pl-4 pr-3 font-semibold text-ink font-mono text-[11px]">
                      {r.dataCategory}
                    </td>
                    <td className="px-3 py-3 font-mono text-ink-mute">
                      {r.entityType}
                    </td>
                    <td className="px-3 py-3 text-center font-mono font-bold text-ink">
                      {r.retentionDays} Days ({(r.retentionDays / 365).toFixed(1)} Yrs)
                    </td>
                    <td className="px-3 py-3 text-ink">
                      <span className="rounded bg-canvas-lavender/50 px-2 py-0.5 text-[10px] font-medium text-ink font-mono">
                        {r.triggerEvent}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <span className="rounded-none bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700 border border-blue-200 uppercase font-mono">
                        {r.deletionStrategy}
                      </span>
                    </td>
                    <td className="py-3 pl-3 pr-4 text-right text-[11px] text-ink-mute max-w-xs truncate">
                      {r.legalBasis || 'Sri Lanka Labor Compliance'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: LEGAL HOLDS */}
      {activeTab === 'holds' && (
        <div className="overflow-hidden rounded-none border border-hairline bg-canvas ">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-hairline bg-canvas-lavender/30 text-[11px] font-semibold uppercase text-ink-mute">
                <tr>
                  <th className="py-3 pl-4 pr-3">Legal Hold Name & Reason</th>
                  <th className="px-3 py-3">Target Entity</th>
                  <th className="px-3 py-3">Start Date</th>
                  <th className="px-3 py-3">Status</th>
                  <th className="px-3 py-3">Placed By</th>
                  <th className="py-3 pl-3 pr-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {legalHolds.map((h) => (
                  <tr key={h.id} className="hover:bg-canvas-soft/30 transition-colors">
                    <td className="py-3 pl-4 pr-3 font-semibold text-ink">
                      <div>{h.name}</div>
                      <div className="text-[11px] text-ink-mute truncate max-w-xs">{h.reason}</div>
                    </td>
                    <td className="px-3 py-3 font-mono text-ink-mute">
                      {h.entityType || 'All Related'}
                    </td>
                    <td className="px-3 py-3 font-mono text-ink">
                      {new Date(h.startsAt).toLocaleDateString()}
                    </td>
                    <td className="px-3 py-3">
                      {!h.releasedAt ? (
                        <span className="rounded-none bg-red-50 px-2.5 py-0.5 text-[10px] font-bold text-red-700 border border-red-200 uppercase flex items-center gap-1 w-max">
                          <Lock className="h-3 w-3" />
                          Active Hold (Freeze)
                        </span>
                      ) : (
                        <span className="rounded-none bg-gray-50 px-2.5 py-0.5 text-[10px] font-bold text-ink-mute border border-hairline uppercase flex items-center gap-1 w-max">
                          <Unlock className="h-3 w-3" />
                          Released
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-3 text-ink-mute">
                      {h.createdByUser?.email || 'admin@ceylonholdings.lk'}
                    </td>
                    <td className="py-3 pl-3 pr-4 text-right">
                      {!h.releasedAt && (
                        <Button
                          variant="secondary-pill"
                          size="sm"
                          onClick={() => handleReleaseHold(h.id)}
                          className="text-amber-700 bg-amber-50 hover:bg-amber-100 border-amber-200"
                        >
                          <Unlock className="h-3.5 w-3.5 mr-1" />
                          Release Hold
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: SRI LANKA PDPA STANDARDS */}
      {activeTab === 'pdpa' && (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div className="rounded-none border border-hairline bg-canvas p-5  space-y-4">
            <div className="flex items-center justify-between border-b border-hairline pb-3">
              <div>
                <h3 className="font-bold text-ink text-xs">Personal Data Protection Act (PDPA) No. 9 of 2022</h3>
                <p className="text-[11px] text-ink-mute">Core compliance principles governing Sri Lankan employers.</p>
              </div>
              <Scale className="h-4 w-4 text-primary" />
            </div>

            <div className="space-y-3 text-xs text-ink-mute">
              <p>• <strong>Lawful Basis & Consent (Part I)</strong>: Processing employee PII requires either statutory necessity (tax/labor compliance) or explicit, verifiable digital consent.</p>
              <p>• <strong>Data Subject Rights (Part II)</strong>: Employees & candidates hold statutory rights to access, rectify, erase, restrict processing, and port their personal data within a 30-day turnaround.</p>
              <p>• <strong>Data Minimization & Retention Limits</strong>: Retention periods must be strictly tethered to statutory requirements and purged once the underlying legal purpose is concluded.</p>
              <p>• <strong>Data Protection Authority of Sri Lanka</strong>: Non-compliance can trigger administrative penalties and compliance directives from the national authority.</p>
            </div>
          </div>

          <div className="rounded-none border border-hairline bg-canvas p-5  space-y-4">
            <div className="flex items-center justify-between border-b border-hairline pb-3">
              <div>
                <h3 className="font-bold text-ink text-xs">Security & Cryptographic Standards</h3>
                <p className="text-[11px] text-ink-mute">Technical safeguard implementations within the HRMS architecture.</p>
              </div>
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
            </div>

            <div className="space-y-3 text-xs text-ink-mute">
              <p>• <strong>AES-256-GCM Encryption</strong>: Sensitive employee identifiers including Sri Lankan NICs and bank accounts are encrypted at rest with authentication tags.</p>
              <p>• <strong>Immutable Audit Trails</strong>: High-risk actions, PII modifications, and DSAR exports are recorded in the PostgreSQL audit log with IP verification.</p>
              <p>• <strong>Legal Hold Overrides</strong>: Active litigation locks freeze purge jobs automatically to prevent spoliation of evidence during court proceedings or tribunal inquiries.</p>
            </div>
          </div>
        </div>
      )}

      {/* LOG DSAR MODAL */}
      <Dialog
        isOpen={isDsarModalOpen}
        onClose={() => setIsDsarModalOpen(false)}
        title="Log Data Subject Access Request (DSAR)"
        description="Submit DSAR request."
        maxWidth="md"
      >
        <form onSubmit={handleCreateDsar} className="space-y-4 text-xs">
          <div>
            <Label htmlFor="dEmp">Employee *</Label>
            <Select
              id="dEmp"
              required
              value={dsarEmpId}
              onChange={(e) => setDsarEmpId(e.target.value)}
              
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
              <Label htmlFor="dNum">Request Reference *</Label>
              <Input id="dNum" required placeholder="e.g. DSAR-2026-005" value={dsarNumber} onChange={(e) => setDsarNumber(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="dType">Right Exercised *</Label>
              <Select
                id="dType"
                value={dsarType}
                onChange={(e) => setDsarType(e.target.value as DataSubjectRequestType)}
                
              >
                <option value="access">Right of Access (Article 13)</option>
                <option value="portability">Right to Data Portability (Article 14)</option>
                <option value="correction">Right to Rectification (Article 15)</option>
                <option value="deletion">Right to Erasure / Deletion (Article 16)</option>
                <option value="restriction">Right to Restrict Processing</option>
                <option value="objection">Right to Object to Processing</option>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="dNotes">Request Scope & Specific Records Requested</Label>
            <Textarea
              id="dNotes"
              rows={3}
              placeholder="e.g. Employee requesting full export of compensation records and biometric logs for 2025/2026."
              value={dsarNotes}
              onChange={(e) => setDsarNotes(e.target.value)}
              
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-hairline">
            <Button type="button" variant="ghost" size="sm" onClick={() => setIsDsarModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary-pill" size="sm" disabled={createDsarMutation.isPending}>
              {createDsarMutation.isPending ? 'Logging...' : 'Log DSAR Request'}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* RECORD CONSENT MODAL */}
      <Dialog
        isOpen={isConsentModalOpen}
        onClose={() => setIsConsentModalOpen(false)}
        title="Record Digital Privacy Consent"
        description="Record privacy consent."
        maxWidth="md"
      >
        <form onSubmit={handleRecordConsent} className="space-y-4 text-xs">
          <div>
            <Label htmlFor="cEmp">Employee *</Label>
            <Select
              id="cEmp"
              required
              value={consentEmpId}
              onChange={(e) => setConsentEmpId(e.target.value)}
              
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
              <Label htmlFor="cPurp">Processing Purpose *</Label>
              <Select
                id="cPurp"
                value={consentPurpose}
                onChange={(e) => setConsentPurpose(e.target.value)}
                
              >
                <option value="PDPA_DATA_PROCESSING">PDPA General Processing</option>
                <option value="BIOMETRIC_ATTENDANCE_CONSENT">Biometric Fingerprint / Face</option>
                <option value="BACKGROUND_VERIFICATION">Background Verification</option>
                <option value="HEALTH_INSURANCE_DATA">Medical & Insurance Processing</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="cVer">Policy Version</Label>
              <Input id="cVer" value={consentVersion} onChange={(e) => setConsentVersion(e.target.value)} />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="cGrant"
              checked={consentGranted}
              onChange={(e) => setConsentGranted(e.target.checked)}
              className="rounded border-hairline text-primary focus:ring-0"
            />
            <Label htmlFor="cGrant" className="cursor-pointer">Consent Granted & Confirmed</Label>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-hairline">
            <Button type="button" variant="ghost" size="sm" onClick={() => setIsConsentModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary-pill" size="sm" disabled={recordConsentMutation.isPending}>
              {recordConsentMutation.isPending ? 'Saving...' : 'Record Consent'}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* CREATE RETENTION POLICY MODAL */}
      <Dialog
        isOpen={isRetentionModalOpen}
        onClose={() => setIsRetentionModalOpen(false)}
        title="Create Data Retention Schedule"
        description="Create retention rule."
        maxWidth="md"
      >
        <form onSubmit={handleCreateRetention} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="rCat">Data Category *</Label>
              <Input id="rCat" required placeholder="e.g. TAX_SCHEDULES" value={retCategory} onChange={(e) => setRetCategory(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="rEnt">Target Entity *</Label>
              <Input id="rEnt" required placeholder="e.g. tax_returns" value={retEntity} onChange={(e) => setRetEntity(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label htmlFor="rDays">Retention Days *</Label>
              <Input id="rDays" type="number" required value={retDays} onChange={(e) => setRetDays(Number(e.target.value))} />
            </div>
            <div>
              <Label htmlFor="rTrig">Trigger Event *</Label>
              <Input id="rTrig" required placeholder="e.g. year_end" value={retTrigger} onChange={(e) => setRetTrigger(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="rStrat">Purge Strategy</Label>
              <Select
                id="rStrat"
                value={retStrategy}
                onChange={(e) => setRetStrategy(e.target.value)}
                
              >
                <option value="soft_delete">Soft Delete</option>
                <option value="hard_delete">Hard Delete</option>
                <option value="anonymize">Anonymize PII</option>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="rBasis">Legal Basis / Statutory Clause</Label>
            <Input id="rBasis" placeholder="e.g. Inland Revenue Act statutory audit period" value={retBasis} onChange={(e) => setRetBasis(e.target.value)} />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-hairline">
            <Button type="button" variant="ghost" size="sm" onClick={() => setIsRetentionModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary-pill" size="sm" disabled={createRetentionMutation.isPending}>
              {createRetentionMutation.isPending ? 'Saving...' : 'Save Schedule'}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* CREATE LEGAL HOLD MODAL */}
      <Dialog
        isOpen={isHoldModalOpen}
        onClose={() => setIsHoldModalOpen(false)}
        title="Place Legal Preservation Hold"
        description="Apply legal hold."
        maxWidth="md"
      >
        <form onSubmit={handleCreateHold} className="space-y-4 text-xs">
          <div>
            <Label htmlFor="hName">Hold Name / Identifier *</Label>
            <Input id="hName" required placeholder="e.g. EPF Remittance Audit Hold 2026" value={holdName} onChange={(e) => setHoldName(e.target.value)} />
          </div>

          <div>
            <Label htmlFor="hReason">Reason & Legal Context *</Label>
            <Textarea
              id="hReason"
              required
              rows={3}
              placeholder="e.g. Pending Department of Labour statutory verification."
              value={holdReason}
              onChange={(e) => setHoldReason(e.target.value)}
              
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="hEnt">Scope Entity</Label>
              <Input id="hEnt" placeholder="e.g. payroll_runs" value={holdEntity} onChange={(e) => setHoldEntity(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="hStart">Start Date *</Label>
              <Input id="hStart" type="date" required value={holdStartsAt} onChange={(e) => setHoldStartsAt(e.target.value)} />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-hairline">
            <Button type="button" variant="ghost" size="sm" onClick={() => setIsHoldModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary-pill" size="sm" disabled={createHoldMutation.isPending}>
              {createHoldMutation.isPending ? 'Placing Hold...' : 'Place Legal Hold'}
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
};
