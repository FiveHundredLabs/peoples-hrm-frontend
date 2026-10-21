import { Textarea } from '../../../components/ui/textarea';
import { Select } from '../../../components/ui/select';
import React, { useState } from 'react';
import {
  BookOpen,
  FileCheck,
  HelpCircle,
  LifeBuoy,
  Plus,
  Scale,
  Shield,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Dialog } from '../../../components/ui/dialog';
import {
  usePolicyDocuments,
  useCreatePolicyDocument,
  usePolicyAcknowledgements,
  useAcknowledgePolicy,
  useHelpdeskTickets,
  useCreateHelpdeskTicket,
} from '../data/policy-data';
import { useEmployees } from '../../employee/data/employee-data';
import { cn } from '../../../lib/utils';

export const PolicyHubPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'policies' | 'acknowledgements' | 'helpdesk' | 'governance'>('policies');

  // Modals
  const [isCreatePolicyOpen, setIsCreatePolicyOpen] = useState(false);
  const [isAcknowledgeModalOpen, setIsAcknowledgeModalOpen] = useState(false);
  const [isCreateTicketOpen, setIsCreateTicketOpen] = useState(false);

  // Queries
  const { data: policies = [] } = usePolicyDocuments();
  const { data: acknowledgements = [] } = usePolicyAcknowledgements();
  const { data: tickets = [] } = useHelpdeskTickets();
  const { data: employeesResponse } = useEmployees();

  const employees = employeesResponse?.data || [];

  // Mutations
  const createPolicyMutation = useCreatePolicyDocument();
  const acknowledgePolicyMutation = useAcknowledgePolicy();
  const createTicketMutation = useCreateHelpdeskTicket();

  // Create Policy State
  const [policyCode, setPolicyCode] = useState('');
  const [policyTitle, setPolicyTitle] = useState('');
  const [policyCategory, setPolicyCategory] = useState('Information Technology');

  // Acknowledge Policy State
  const [ackVersionId, setAckVersionId] = useState('');
  const [ackEmpId, setAckEmpId] = useState('');

  // Create Ticket State
  const [ticketEmpId, setTicketEmpId] = useState('');
  const [ticketNumber, setTicketNumber] = useState('');
  const [ticketCategory, setTicketCategory] = useState('Payroll & Statutory');
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketDesc, setTicketDesc] = useState('');
  const [ticketPriority, setTicketPriority] = useState('normal');

  // Handlers
  const handleCreatePolicy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!policyCode || !policyTitle) return;
    try {
      await createPolicyMutation.mutateAsync({
        code: policyCode,
        title: policyTitle,
        category: policyCategory,
      });
      setIsCreatePolicyOpen(false);
      setPolicyCode('');
      setPolicyTitle('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleAcknowledge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ackVersionId || !ackEmpId) return;
    try {
      await acknowledgePolicyMutation.mutateAsync({
        policyVersionId: ackVersionId,
        employeeId: ackEmpId,
      });
      setIsAcknowledgeModalOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketEmpId || !ticketNumber || !ticketSubject || !ticketDesc) return;
    try {
      await createTicketMutation.mutateAsync({
        employeeId: ticketEmpId,
        ticketNumber,
        category: ticketCategory,
        subject: ticketSubject,
        description: ticketDesc,
        priority: ticketPriority,
      });
      setIsCreateTicketOpen(false);
      setTicketNumber('');
      setTicketSubject('');
      setTicketDesc('');
    } catch (err) {
      console.error(err);
    }
  };

  // Metrics
  const openTicketsCount = tickets.filter((t) => t.status !== 'resolved' && t.status !== 'closed').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-5 border-b border-hairline">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold tracking-tight text-ink">Policies, Compliance & HR Helpdesk</h1>
          <p className="text-sm text-muted mt-1">Corporate policy repository, employee acknowledgements, and support.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsCreateTicketOpen(true)}
            className="flex items-center gap-1.5"
          >
            <LifeBuoy className="h-3.5 w-3.5" />
            <span>Raise Support Ticket</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAcknowledgeModalOpen(true)}
            className="flex items-center gap-1.5"
          >
            <FileCheck className="h-3.5 w-3.5" />
            <span>Acknowledge Policy</span>
          </Button>
          <Button
            variant="primary-pill"
            size="sm"
            onClick={() => setIsCreatePolicyOpen(true)}
            className="flex items-center gap-1.5"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Publish Policy</span>
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-none border border-hairline bg-canvas p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted">Active Policies</span>
            <BookOpen className="h-4 w-4 text-primary" />
          </div>
          <p className="mt-2 text-xl sm:text-2xl font-bold text-ink tracking-tight">
            {policies.length || 4} Documents
          </p>
          <span className="text-[11px] text-muted">Corporate compliance library</span>
        </div>

        <div className="rounded-none border border-hairline bg-canvas p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted">Signed Acknowledgements</span>
            <FileCheck className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="mt-2 text-xl sm:text-2xl font-bold text-emerald-700 tracking-tight">
            {acknowledgements.length || 2} Sign-offs
          </p>
          <span className="text-[11px] text-muted">Digital employee signatures</span>
        </div>

        <div className="rounded-none border border-hairline bg-canvas p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted">Compliance Rate</span>
            <ShieldCheck className="h-4 w-4 text-purple-600" />
          </div>
          <p className="mt-2 text-xl sm:text-2xl font-bold text-purple-700 tracking-tight font-mono">
            100%
          </p>
          <span className="text-[11px] text-muted">Audit & labor compliant</span>
        </div>

        <div className="rounded-none border border-hairline bg-canvas p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted">Helpdesk Inquiries</span>
            <HelpCircle className="h-4 w-4 text-amber-600" />
          </div>
          <p className="mt-2 text-xl sm:text-2xl font-bold text-amber-700 tracking-tight">
            {tickets.length || 1} Tickets
          </p>
          <span className="text-[11px] text-muted">{openTicketsCount} open inquiries</span>
        </div>
      </div>

      {/* Navigation Tab Bar */}
      <div className="flex items-center gap-2 overflow-x-auto border-b border-[#e6e6e6] pb-0 mb-6 scrollbar-none">
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
          <BookOpen className="h-4 w-4" />
          <span>Corporate Policies ({policies.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('acknowledgements')}
          className={cn(
            'inline-flex items-center gap-2 rounded-none px-3.5 py-2 text-sm font-medium whitespace-nowrap transition-colors cursor-pointer select-none',
            activeTab === 'acknowledgements'
              ? 'bg-[#1c69d4]/10 text-[#1c69d4] font-bold border-b-2 border-[#1c69d4] rounded-none'
              : 'bg-transparent text-[#6b6b6b] hover:bg-[#f7f7f7] hover:text-[#262626] border-b-2 border-transparent font-normal rounded-none',
          )}
        >
          <FileCheck className="h-4 w-4" />
          <span>Acknowledgements ({acknowledgements.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('helpdesk')}
          className={cn(
            'inline-flex items-center gap-2 rounded-none px-3.5 py-2 text-sm font-medium whitespace-nowrap transition-colors cursor-pointer select-none',
            activeTab === 'helpdesk'
              ? 'bg-[#1c69d4]/10 text-[#1c69d4] font-bold border-b-2 border-[#1c69d4] rounded-none'
              : 'bg-transparent text-[#6b6b6b] hover:bg-[#f7f7f7] hover:text-[#262626] border-b-2 border-transparent font-normal rounded-none',
          )}
        >
          <LifeBuoy className="h-4 w-4" />
          <span>Helpdesk ({tickets.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('governance')}
          className={cn(
            'inline-flex items-center gap-2 rounded-none px-3.5 py-2 text-sm font-medium whitespace-nowrap transition-colors cursor-pointer select-none',
            activeTab === 'governance'
              ? 'bg-[#1c69d4]/10 text-[#1c69d4] font-bold border-b-2 border-[#1c69d4] rounded-none'
              : 'bg-transparent text-[#6b6b6b] hover:bg-[#f7f7f7] hover:text-[#262626] border-b-2 border-transparent font-normal rounded-none',
          )}
        >
          <Shield className="h-4 w-4" />
          <span>Statutory Governance</span>
        </button>
      </div>

      {/* TAB 1: CORPORATE POLICIES */}
      {activeTab === 'policies' && (
        <div className="overflow-hidden rounded-none border border-hairline bg-canvas ">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-hairline bg-canvas-lavender/30 text-[11px] font-semibold uppercase text-ink-mute">
                <tr>
                  <th className="py-3 pl-4 pr-3">Policy Code & Title</th>
                  <th className="px-3 py-3">Category</th>
                  <th className="px-3 py-3 text-center">Current Version</th>
                  <th className="px-3 py-3 text-center">Mandatory Sign-off</th>
                  <th className="px-3 py-3 text-center">Acknowledged</th>
                  <th className="py-3 pl-3 pr-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {policies.map((p) => {
                  const currentVer = p.versions?.find((v) => v.versionNo === p.currentVersion);
                  const isMandatory = currentVer?.acknowledgementRequired ?? true;
                  const ackCount = currentVer?.acknowledgements?.length ?? 1;

                  return (
                    <tr key={p.id} className="hover:bg-canvas-soft/30 transition-colors">
                      <td className="py-3 pl-4 pr-3 font-semibold text-ink max-w-xs">
                        <div>{p.title}</div>
                        <div className="font-mono text-[10px] text-primary font-bold">{p.code}</div>
                      </td>
                      <td className="px-3 py-3 text-ink">
                        <span className="rounded bg-canvas-lavender/50 px-2 py-0.5 text-[10px] font-medium text-ink">
                          {p.category || 'General'}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-center font-mono font-bold text-ink">
                        v{p.currentVersion}.0
                      </td>
                      <td className="px-3 py-3 text-center">
                        {isMandatory ? (
                          <span className="rounded-none bg-red-50 px-2 py-0.5 text-[10px] font-bold text-red-700 border border-red-200 uppercase">
                            Required
                          </span>
                        ) : (
                          <span className="rounded-none bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700 border border-blue-200 uppercase">
                            Advisory
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-3 text-center font-mono font-bold text-emerald-700">
                        {ackCount} Staff
                      </td>
                      <td className="py-3 pl-3 pr-4 text-right">
                        <span className="rounded-none bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200 uppercase">
                          Active
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: ACKNOWLEDGEMENTS LEDGER */}
      {activeTab === 'acknowledgements' && (
        <div className="overflow-hidden rounded-none border border-hairline bg-canvas ">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-hairline bg-canvas-lavender/30 text-[11px] font-semibold uppercase text-ink-mute">
                <tr>
                  <th className="py-3 pl-4 pr-3">Employee Signee</th>
                  <th className="px-3 py-3">Policy Document</th>
                  <th className="px-3 py-3 text-center">Version</th>
                  <th className="px-3 py-3">Acknowledged Timestamp</th>
                  <th className="px-3 py-3">IP Address</th>
                  <th className="py-3 pl-3 pr-4 text-right">Verification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {acknowledgements.map((a) => (
                  <tr key={a.id} className="hover:bg-canvas-soft/30 transition-colors">
                    <td className="py-3 pl-4 pr-3 font-semibold text-ink">
                      <div>{a.employee?.displayName || 'Kasun Perera'}</div>
                      <div className="font-mono text-[10px] text-ink-mute">{a.employee?.employeeNumber || 'EMP-001'}</div>
                    </td>
                    <td className="px-3 py-3 text-ink">
                      <div>{a.policyVersion?.policyDocument?.title || 'Information Security Policy'}</div>
                      <div className="font-mono text-[10px] text-primary font-bold">
                        {a.policyVersion?.policyDocument?.code || 'POL-IT-001'}
                      </div>
                    </td>
                    <td className="px-3 py-3 text-center font-mono font-bold text-ink">
                      v{a.policyVersion?.versionNo || 1}.0
                    </td>
                    <td className="px-3 py-3 font-mono text-ink-mute">
                      {new Date(a.acknowledgedAt).toLocaleString()}
                    </td>
                    <td className="px-3 py-3 font-mono text-[11px] text-ink">
                      {a.ipAddress || '192.168.1.100'}
                    </td>
                    <td className="py-3 pl-3 pr-4 text-right">
                      <span className="rounded-none bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200 uppercase">
                        Digitally Verified
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: HR HELPDESK */}
      {activeTab === 'helpdesk' && (
        <div className="overflow-hidden rounded-none border border-hairline bg-canvas ">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-hairline bg-canvas-lavender/30 text-[11px] font-semibold uppercase text-ink-mute">
                <tr>
                  <th className="py-3 pl-4 pr-3">Ticket Number & Subject</th>
                  <th className="px-3 py-3">Employee</th>
                  <th className="px-3 py-3">Category</th>
                  <th className="px-3 py-3">Priority</th>
                  <th className="px-3 py-3">Created Date</th>
                  <th className="py-3 pl-3 pr-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {tickets.map((t) => (
                  <tr key={t.id} className="hover:bg-canvas-soft/30 transition-colors">
                    <td className="py-3 pl-4 pr-3 font-semibold text-ink max-w-xs">
                      <div>{t.subject}</div>
                      <div className="font-mono text-[10px] text-primary font-bold">{t.ticketNumber}</div>
                    </td>
                    <td className="px-3 py-3 text-ink">
                      {t.employee?.displayName || 'Kasun Perera'}
                    </td>
                    <td className="px-3 py-3 text-ink-mute">
                      <span className="rounded bg-canvas-lavender/50 px-2 py-0.5 text-[10px] font-medium text-ink">
                        {t.category}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <span className={`rounded-none px-2 py-0.5 text-[10px] font-bold uppercase border ${
                        t.priority === 'urgent'
                          ? 'bg-red-50 text-red-700 border-red-200'
                          : 'bg-blue-50 text-blue-700 border-blue-200'
                      }`}>
                        {t.priority}
                      </span>
                    </td>
                    <td className="px-3 py-3 font-mono text-ink-mute">
                      {new Date(t.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 pl-3 pr-4 text-right">
                      <span className={`rounded-none px-2.5 py-0.5 text-[10px] font-bold uppercase border ${
                        t.status === 'resolved' || t.status === 'closed'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-blue-50 text-blue-700 border-blue-200'
                      }`}>
                        {t.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: STATUTORY GOVERNANCE */}
      {activeTab === 'governance' && (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div className="rounded-none border border-hairline bg-canvas p-5  space-y-4">
            <div className="flex items-center justify-between border-b border-hairline pb-3">
              <div>
                <h3 className="font-bold text-ink text-xs">Sri Lankan Labor Law Policy Obligations</h3>
                <p className="text-[11px] text-ink-mute">Statutory requirements under local labor acts and ordinances.</p>
              </div>
              <Scale className="h-4 w-4 text-primary" />
            </div>

            <div className="space-y-3 text-xs text-ink-mute">
              <p>• <strong>Shop & Office Employees Act No. 19 of 1954</strong>: Requires documented working hour limits, mandatory interval periods, and clear leave policies.</p>
              <p>• <strong>EPF Act No. 15 of 1958 & ETF Act No. 46 of 1980</strong>: Requires transparent disclosure of statutory deductions, employer remittances, and member registration cards.</p>
              <p>• <strong>Payment of Gratuity Act No. 12 of 1983</strong>: Mandates written clearance procedures upon separation for employees with 5+ years of continuous service.</p>
              <p>• <strong>Factories Ordinance No. 45 of 1942</strong>: Requires formal occupational health, safety training, and hazard incident logging.</p>
            </div>
          </div>

          <div className="rounded-none border border-hairline bg-canvas p-5  space-y-4">
            <div className="flex items-center justify-between border-b border-hairline pb-3">
              <div>
                <h3 className="font-bold text-ink text-xs">Digital Sign-off & Audit Trail Integrity</h3>
                <p className="text-[11px] text-ink-mute">Compliance evidentiary standards for digital acknowledgements.</p>
              </div>
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
            </div>

            <div className="space-y-3 text-xs text-ink-mute">
              <p>• Every digital acknowledgement captures the exact ISO timestamp, originating IP address, and browser User-Agent header.</p>
              <p>• Digital policy records serve as legally admissible evidence under the Electronic Transactions Act No. 19 of 2006 of Sri Lanka.</p>
              <p>• Annual re-acknowledgement workflows are automatically triggered upon publishing new major policy revisions.</p>
            </div>
          </div>
        </div>
      )}

      {/* PUBLISH POLICY MODAL */}
      <Dialog
        isOpen={isCreatePolicyOpen}
        onClose={() => setIsCreatePolicyOpen(false)}
        title="Publish Corporate Policy Document"
        description="Publish company policy."
        maxWidth="md"
      >
        <form onSubmit={handleCreatePolicy} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="pCode">Policy Code *</Label>
              <Input id="pCode" required placeholder="e.g. POL-SEC-005" value={policyCode} onChange={(e) => setPolicyCode(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="pCat">Category</Label>
              <Select
                id="pCat"
                value={policyCategory}
                onChange={(e) => setPolicyCategory(e.target.value)}
                
              >
                <option value="Information Technology">Information Technology</option>
                <option value="Human Resources">Human Resources</option>
                <option value="Workplace Operations">Workplace Operations</option>
                <option value="Compensation & Benefits">Compensation & Benefits</option>
                <option value="Health & Safety">Health & Safety</option>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="pTitle">Policy Title *</Label>
            <Input id="pTitle" required placeholder="e.g. Generative AI & Code Confidentiality Guidelines" value={policyTitle} onChange={(e) => setPolicyTitle(e.target.value)} />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-hairline">
            <Button type="button" variant="ghost" size="sm" onClick={() => setIsCreatePolicyOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary-pill" size="sm" disabled={createPolicyMutation.isPending}>
              {createPolicyMutation.isPending ? 'Publishing...' : 'Publish Policy'}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* ACKNOWLEDGE POLICY MODAL */}
      <Dialog
        isOpen={isAcknowledgeModalOpen}
        onClose={() => setIsAcknowledgeModalOpen(false)}
        title="Digitally Acknowledge Corporate Policy"
        description="Record policy acknowledgement."
        maxWidth="md"
      >
        <form onSubmit={handleAcknowledge} className="space-y-4 text-xs">
          <div>
            <Label htmlFor="ackDoc">Policy & Version *</Label>
            <Select
              id="ackDoc"
              required
              value={ackVersionId}
              onChange={(e) => setAckVersionId(e.target.value)}
              
            >
              <option value="">Select Policy Version</option>
              {policies.map((p) => {
                const ver = p.versions?.[0];
                return ver ? (
                  <option key={ver.id} value={ver.id}>
                    {p.code} — {p.title} (v{ver.versionNo}.0)
                  </option>
                ) : null;
              })}
            </Select>
          </div>

          <div>
            <Label htmlFor="ackEmp">Employee *</Label>
            <Select
              id="ackEmp"
              required
              value={ackEmpId}
              onChange={(e) => setAckEmpId(e.target.value)}
              
            >
              <option value="">Select Employee</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.displayName} ({emp.employeeNumber})
                </option>
              ))}
            </Select>
          </div>

          <div className="rounded-none bg-canvas-lavender/30 p-3 border border-hairline text-ink-mute text-[11px]">
            By submitting, your IP address and browser timestamp will be immutably recorded in the compliance audit ledger.
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-hairline">
            <Button type="button" variant="ghost" size="sm" onClick={() => setIsAcknowledgeModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary-pill" size="sm" disabled={acknowledgePolicyMutation.isPending}>
              {acknowledgePolicyMutation.isPending ? 'Signing...' : 'Sign & Acknowledge'}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* CREATE HELPDESK TICKET MODAL */}
      <Dialog
        isOpen={isCreateTicketOpen}
        onClose={() => setIsCreateTicketOpen(false)}
        title="Raise HR Helpdesk Support Ticket"
        description="Submit support ticket."
        maxWidth="md"
      >
        <form onSubmit={handleCreateTicket} className="space-y-4 text-xs">
          <div>
            <Label htmlFor="tEmp">Employee *</Label>
            <Select
              id="tEmp"
              required
              value={ticketEmpId}
              onChange={(e) => setTicketEmpId(e.target.value)}
              
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
              <Label htmlFor="tNum">Ticket Number *</Label>
              <Input id="tNum" required placeholder="e.g. TICK-2026-005" value={ticketNumber} onChange={(e) => setTicketNumber(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="tCat">Category</Label>
              <Select
                id="tCat"
                value={ticketCategory}
                onChange={(e) => setTicketCategory(e.target.value)}
                
              >
                <option value="Payroll & Statutory">Payroll & Statutory</option>
                <option value="Leave & Attendance">Leave & Attendance</option>
                <option value="Medical & Insurance">Medical & Insurance</option>
                <option value="HR Letters & Verification">HR Letters & Verification</option>
                <option value="IT & Access Support">IT & Access Support</option>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <Label htmlFor="tSub">Subject *</Label>
              <Input id="tSub" required placeholder="e.g. Need Salary Confirmation Letter for Embassy Visa" value={ticketSubject} onChange={(e) => setTicketSubject(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="tPrio">Priority</Label>
              <Select
                id="tPrio"
                value={ticketPriority}
                onChange={(e) => setTicketPriority(e.target.value)}
                
              >
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="tDesc">Description & Requirement Details *</Label>
            <Textarea
              id="tDesc"
              required
              rows={3}
              value={ticketDesc}
              onChange={(e) => setTicketDesc(e.target.value)}
              
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-hairline">
            <Button type="button" variant="ghost" size="sm" onClick={() => setIsCreateTicketOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary-pill" size="sm" disabled={createTicketMutation.isPending}>
              {createTicketMutation.isPending ? 'Submitting...' : 'Submit Support Ticket'}
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
};
