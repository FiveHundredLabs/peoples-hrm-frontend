import { Textarea } from '../../../components/ui/textarea';
import { Select } from '../../../components/ui/select';
import React, { useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  Clock,
  HelpCircle,
  LifeBuoy,
  MessageSquare,
  Plus,
  Send,
  ShieldAlert,
  ShieldCheck,
  User,
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Dialog } from '../../../components/ui/dialog';
import {
  useHelpdeskTickets,
  useCreateHelpdeskTicket,
  useUpdateTicketStatus,
  useAddHelpdeskMessage,
} from '../api/helpdesk-api';
import { useEmployees } from '../../employee/api/employee-api';
import { cn } from '../../../lib/utils';
import { HelpdeskTicket } from '../types/helpdesk';

export const HelpdeskHubPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'tickets' | 'thread' | 'knowledge' | 'sla'>('tickets');

  // Modals & Selection
  const [isCreateTicketOpen, setIsCreateTicketOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<HelpdeskTicket | null>(null);

  // Queries
  const { data: tickets = [] } = useHelpdeskTickets();
  const { data: employeesResponse } = useEmployees();

  const employees = employeesResponse?.data || [];

  // Mutations
  const createTicketMutation = useCreateHelpdeskTicket();
  const updateStatusMutation = useUpdateTicketStatus();
  const addMessageMutation = useAddHelpdeskMessage();

  // Create Ticket State
  const [ticketEmpId, setTicketEmpId] = useState('');
  const [ticketNumber, setTicketNumber] = useState('');
  const [ticketCategory, setTicketCategory] = useState('Payroll & Statutory');
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketDesc, setTicketDesc] = useState('');
  const [ticketPriority, setTicketPriority] = useState('normal');

  // Message State
  const [messageBody, setMessageBody] = useState('');
  const [isInternalNote, setIsInternalNote] = useState(false);

  // Handlers
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

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !messageBody.trim()) return;
    try {
      await addMessageMutation.mutateAsync({
        ticketId: selectedTicket.id,
        body: messageBody,
        internalNote: isInternalNote,
      });
      setMessageBody('');
      setIsInternalNote(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!selectedTicket) return;
    try {
      await updateStatusMutation.mutateAsync({
        id: selectedTicket.id,
        status: newStatus,
      });
    } catch (err) {
      console.error(err);
    }
  };

  // Metrics
  const totalInquiries = tickets.length;
  const inProgressTickets = tickets.filter((t) => t.status === 'in_progress' || t.status === 'open').length;
  const resolvedTickets = tickets.filter((t) => t.status === 'resolved' || t.status === 'closed').length;

  const currentTicket = tickets.find((t) => t.id === selectedTicket?.id) || tickets[0] || null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-5 border-b border-hairline">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold tracking-tight text-ink">Employee Helpdesk & Support Center</h1>
          <p className="text-sm text-muted mt-1">Employee support tickets, HR service requests, and inquiry triage.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <Button
            variant="primary-pill"
            size="sm"
            onClick={() => setIsCreateTicketOpen(true)}
            className="flex items-center gap-1.5"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Raise Support Ticket</span>
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-none border border-hairline bg-canvas p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted">Total Support Inquiries</span>
            <LifeBuoy className="h-4 w-4 text-primary" />
          </div>
          <p className="mt-2 text-xl sm:text-2xl font-bold text-ink tracking-tight">
            {totalInquiries || 2} Tickets
          </p>
          <span className="text-[11px] text-muted">Employee request volume</span>
        </div>

        <div className="rounded-none border border-hairline bg-canvas p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted">In-Progress Queue</span>
            <Clock className="h-4 w-4 text-amber-600" />
          </div>
          <p className="mt-2 text-xl sm:text-2xl font-bold text-amber-700 tracking-tight">
            {inProgressTickets || 1} Active
          </p>
          <span className="text-[11px] text-muted">Pending support action</span>
        </div>

        <div className="rounded-none border border-hairline bg-canvas p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted">Resolved Inquiries</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="mt-2 text-xl sm:text-2xl font-bold text-emerald-700 tracking-tight">
            {resolvedTickets || 1} Resolved
          </p>
          <span className="text-[11px] text-muted">Successfully closed</span>
        </div>

        <div className="rounded-none border border-hairline bg-canvas p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted">SLA Compliance Rate</span>
            <ShieldCheck className="h-4 w-4 text-purple-600" />
          </div>
          <p className="mt-2 text-xl sm:text-2xl font-bold text-purple-700 tracking-tight font-mono">
            98.5%
          </p>
          <span className="text-[11px] text-muted">Under standard turnaround</span>
        </div>
      </div>

      {/* Navigation Tab Bar */}
      <div className="flex items-center gap-2 overflow-x-auto border-b border-[#e6e6e6] pb-0 mb-6 scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveTab('tickets')}
          className={cn(
            'inline-flex items-center gap-2 rounded-none px-3.5 py-2 text-sm font-medium whitespace-nowrap transition-colors cursor-pointer select-none',
            activeTab === 'tickets'
              ? 'bg-[#1c69d4]/10 text-[#1c69d4] font-bold border-b-2 border-[#1c69d4] rounded-none'
              : 'bg-transparent text-[#6b6b6b] hover:bg-[#f7f7f7] hover:text-[#262626] border-b-2 border-transparent font-normal rounded-none',
          )}
        >
          <LifeBuoy className="h-4 w-4" />
          <span>Ticket Queue ({tickets.length})</span>
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveTab('thread');
            if (!selectedTicket && tickets.length > 0) setSelectedTicket(tickets[0]);
          }}
          className={cn(
            'inline-flex items-center gap-2 rounded-none px-3.5 py-2 text-sm font-medium whitespace-nowrap transition-colors cursor-pointer select-none',
            activeTab === 'thread'
              ? 'bg-[#1c69d4]/10 text-[#1c69d4] font-bold border-b-2 border-[#1c69d4] rounded-none'
              : 'bg-transparent text-[#6b6b6b] hover:bg-[#f7f7f7] hover:text-[#262626] border-b-2 border-transparent font-normal rounded-none',
          )}
        >
          <MessageSquare className="h-4 w-4" />
          <span>Conversation Thread</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('knowledge')}
          className={cn(
            'inline-flex items-center gap-2 rounded-none px-3.5 py-2 text-sm font-medium whitespace-nowrap transition-colors cursor-pointer select-none',
            activeTab === 'knowledge'
              ? 'bg-[#1c69d4]/10 text-[#1c69d4] font-bold border-b-2 border-[#1c69d4] rounded-none'
              : 'bg-transparent text-[#6b6b6b] hover:bg-[#f7f7f7] hover:text-[#262626] border-b-2 border-transparent font-normal rounded-none',
          )}
        >
          <BookOpen className="h-4 w-4" />
          <span>Knowledge Base & FAQ</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('sla')}
          className={cn(
            'inline-flex items-center gap-2 rounded-none px-3.5 py-2 text-sm font-medium whitespace-nowrap transition-colors cursor-pointer select-none',
            activeTab === 'sla'
              ? 'bg-[#1c69d4]/10 text-[#1c69d4] font-bold border-b-2 border-[#1c69d4] rounded-none'
              : 'bg-transparent text-[#6b6b6b] hover:bg-[#f7f7f7] hover:text-[#262626] border-b-2 border-transparent font-normal rounded-none',
          )}
        >
          <ShieldAlert className="h-4 w-4" />
          <span>SLA Standards</span>
        </button>
      </div>

      {/* TAB 1: TICKET QUEUE */}
      {activeTab === 'tickets' && (
        <div className="overflow-hidden rounded-none border border-hairline bg-canvas ">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-hairline bg-canvas-lavender/30 text-[11px] font-semibold uppercase text-ink-mute">
                <tr>
                  <th className="py-3 pl-4 pr-3">Ticket & Subject</th>
                  <th className="px-3 py-3">Employee</th>
                  <th className="px-3 py-3">Category</th>
                  <th className="px-3 py-3">Priority</th>
                  <th className="px-3 py-3">SLA Due Date</th>
                  <th className="px-3 py-3">Status</th>
                  <th className="py-3 pl-3 pr-4 text-right">Action</th>
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
                      <div>{t.employee?.displayName || 'Kasun Perera'}</div>
                      <div className="font-mono text-[10px] text-ink-mute">{t.employee?.employeeNumber || 'EMP-001'}</div>
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
                          : t.priority === 'high'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-blue-50 text-blue-700 border-blue-200'
                      }`}>
                        {t.priority}
                      </span>
                    </td>
                    <td className="px-3 py-3 font-mono text-ink-mute">
                      {t.dueAt ? new Date(t.dueAt).toLocaleDateString() : '72 Hours'}
                    </td>
                    <td className="px-3 py-3">
                      <span className={`rounded-none px-2.5 py-0.5 text-[10px] font-bold uppercase border ${
                        t.status === 'resolved' || t.status === 'closed'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : t.status === 'in_progress'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-blue-50 text-blue-700 border-blue-200'
                      }`}>
                        {t.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 pl-3 pr-4 text-right">
                      <Button
                        variant="secondary-pill"
                        size="sm"
                        onClick={() => {
                          setSelectedTicket(t);
                          setActiveTab('thread');
                        }}
                      >
                        View Thread
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: CONVERSATION THREAD */}
      {activeTab === 'thread' && (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          {/* Ticket Selector Sidebar */}
          <div className="rounded-none border border-hairline bg-canvas p-3  space-y-2 lg:col-span-1">
            <h3 className="font-bold text-xs text-ink px-2 py-1">Support Inquiries</h3>
            <div className="space-y-1 max-h-[500px] overflow-y-auto">
              {tickets.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setSelectedTicket(t)}
                  className={`w-full text-left p-3 rounded-none text-xs transition-colors cursor-pointer border ${
                    (selectedTicket?.id || tickets[0]?.id) === t.id
                      ? 'bg-primary/10 border-primary font-semibold text-ink'
                      : 'border-transparent hover:bg-canvas-soft/30 text-ink-mute'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] text-primary">{t.ticketNumber}</span>
                    <span className={`text-[9px] font-bold uppercase px-1.5 py-0.2 rounded ${
                      t.status === 'resolved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {t.status}
                    </span>
                  </div>
                  <div className="font-medium text-ink mt-1 truncate">{t.subject}</div>
                  <div className="text-[10px] text-ink-mute truncate">{t.employee?.displayName || 'Kasun Perera'}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Conversation Viewer & Composer */}
          <div className="rounded-none border border-hairline bg-canvas p-5  space-y-4 lg:col-span-2 flex flex-col justify-between min-h-[500px]">
            {currentTicket ? (
              <div className="space-y-4 flex-1">
                {/* Ticket Header & Status Controls */}
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-hairline pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-primary">{currentTicket.ticketNumber}</span>
                      <span className="rounded bg-canvas-lavender/50 px-2 py-0.5 text-[10px] font-medium text-ink">
                        {currentTicket.category}
                      </span>
                    </div>
                    <h2 className="text-base font-bold text-ink mt-1">{currentTicket.subject}</h2>
                    <p className="text-xs text-ink-mute">
                      Raised by {currentTicket.employee?.displayName || 'Kasun Perera'} on {new Date(currentTicket.createdAt).toLocaleString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {currentTicket.status !== 'resolved' && (
                      <Button
                        variant="secondary-pill"
                        size="sm"
                        onClick={() => handleStatusChange('resolved')}
                        className="text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border-emerald-200"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                        Resolve Ticket
                      </Button>
                    )}
                    {currentTicket.status === 'open' && (
                      <Button
                        variant="secondary-pill"
                        size="sm"
                        onClick={() => handleStatusChange('in_progress')}
                      >
                        Start Progress
                      </Button>
                    )}
                  </div>
                </div>

                {/* Description Card */}
                <div className="rounded-none bg-canvas-lavender/30 p-3 border border-hairline text-xs text-ink">
                  <span className="font-semibold text-ink-mute block mb-1">Inquiry Description:</span>
                  {currentTicket.description}
                </div>

                {/* Message Stream */}
                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-bold text-ink-mute uppercase tracking-wide">Communication History</h4>
                  {currentTicket.messages && currentTicket.messages.length > 0 ? (
                    currentTicket.messages.map((m) => (
                      <div
                        key={m.id}
                        className={`p-3 rounded-none border text-xs space-y-1 ${
                          m.internalNote
                            ? 'bg-amber-50/60 border-amber-200 text-amber-900'
                            : 'bg-canvas border-hairline text-ink'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[11px]">
                          <div className="flex items-center gap-1.5 font-semibold">
                            <User className="h-3.5 w-3.5" />
                            <span>{m.authorUser?.email || 'HR Support Desk'}</span>
                            {m.internalNote && (
                              <span className="rounded bg-amber-200 px-1.5 py-0.2 text-[9px] font-bold text-amber-900 uppercase">
                                Internal Note (HR Only)
                              </span>
                            )}
                          </div>
                          <span className="text-ink-mute font-mono text-[10px]">
                            {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-xs leading-relaxed">{m.body}</p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 text-xs text-ink-mute">
                      No replies logged yet. Use the composer below to respond.
                    </div>
                  )}
                </div>

                {/* Reply Composer */}
                <form onSubmit={handleSendMessage} className="pt-4 border-t border-hairline space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="replyBody">Post Reply / Internal Update</Label>
                    <label className="flex items-center gap-1.5 text-xs text-ink cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isInternalNote}
                        onChange={(e) => setIsInternalNote(e.target.checked)}
                        className="rounded border-hairline text-primary focus:ring-0"
                      />
                      <span>Make Internal Note</span>
                    </label>
                  </div>
                  <Textarea
                    id="replyBody"
                    rows={3}
                    required
                    placeholder={isInternalNote ? 'Write private internal note for HR team...' : 'Reply to employee with advice or status update...'}
                    value={messageBody}
                    onChange={(e) => setMessageBody(e.target.value)}
                    
                  />
                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      variant="primary-pill"
                      size="sm"
                      disabled={addMessageMutation.isPending}
                      className="flex items-center gap-1.5"
                    >
                      <Send className="h-3.5 w-3.5" />
                      {addMessageMutation.isPending ? 'Sending...' : 'Send Reply'}
                    </Button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="text-center py-16 text-xs text-ink-mute">
                Select a ticket from the left panel to inspect conversation thread.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: KNOWLEDGE BASE & FAQS */}
      {activeTab === 'knowledge' && (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div className="rounded-none border border-hairline bg-canvas p-5  space-y-3">
            <div className="flex items-center gap-2 border-b border-hairline pb-2">
              <HelpCircle className="h-4 w-4 text-primary" />
              <h3 className="font-bold text-ink text-xs">How do I request an EPF / ETF Confirmation Letter?</h3>
            </div>
            <p className="text-xs text-ink-mute leading-relaxed">
              Raise a support ticket under <strong>Payroll & Statutory</strong> category. HR will generate a certified letter signed by the Authorized Signatory containing your EPF Member Number, Employer Remittance Code, and last 6 months deduction summary.
            </p>
          </div>

          <div className="rounded-none border border-hairline bg-canvas p-5  space-y-3">
            <div className="flex items-center gap-2 border-b border-hairline pb-2">
              <HelpCircle className="h-4 w-4 text-emerald-600" />
              <h3 className="font-bold text-ink text-xs">What is the procedure for OPD & Medical Reimbursements?</h3>
            </div>
            <p className="text-xs text-ink-mute leading-relaxed">
              Submit the itemized doctor consultation receipt and pharmacy bill through the <strong>Medical & OPD Claims</strong> category within 30 days of treatment. Reimbursement is credited in the next monthly payroll run following insurer approval.
            </p>
          </div>

          <div className="rounded-none border border-hairline bg-canvas p-5  space-y-3">
            <div className="flex items-center gap-2 border-b border-hairline pb-2">
              <HelpCircle className="h-4 w-4 text-purple-600" />
              <h3 className="font-bold text-ink text-xs">How does APIT Tax Exemption Relief Work?</h3>
            </div>
            <p className="text-xs text-ink-mute leading-relaxed">
              Under Sri Lankan tax reform circulars, employees qualify for an statutory tax-free personal relief allowance of LKR 100,000 per month (LKR 1.2M per annum). Excess taxable remuneration is subjected to standard 6%–36% progressive tax brackets.
            </p>
          </div>

          <div className="rounded-none border border-hairline bg-canvas p-5  space-y-3">
            <div className="flex items-center gap-2 border-b border-hairline pb-2">
              <HelpCircle className="h-4 w-4 text-amber-600" />
              <h3 className="font-bold text-ink text-xs">How much Annual Leave can be carried forward?</h3>
            </div>
            <p className="text-xs text-ink-mute leading-relaxed">
              Under the Shop & Office Employees Act No. 19 of 1954, annual leave is earned based on completed service in the prior calendar year. Corporate policy permits up to 7 unused statutory annual days to carry over into Q1 of the following year.
            </p>
          </div>
        </div>
      )}

      {/* TAB 4: SLA STANDARDS */}
      {activeTab === 'sla' && (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div className="rounded-none border border-hairline bg-canvas p-5  space-y-4">
            <div className="flex items-center justify-between border-b border-hairline pb-3">
              <div>
                <h3 className="font-bold text-ink text-xs">Service Level Agreements (SLA) Matrix</h3>
                <p className="text-[11px] text-ink-mute">Standard resolution windows by priority.</p>
              </div>
              <Clock className="h-4 w-4 text-primary" />
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded bg-red-50/50 border border-red-200">
                <span className="font-bold text-red-700 uppercase text-[10px]">Urgent Priority</span>
                <span className="font-mono text-ink font-semibold">24 Hours Target Turnaround</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded bg-amber-50/50 border border-amber-200">
                <span className="font-bold text-amber-700 uppercase text-[10px]">High Priority</span>
                <span className="font-mono text-ink font-semibold">48 Hours Target Turnaround</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded bg-blue-50/50 border border-blue-200">
                <span className="font-bold text-blue-700 uppercase text-[10px]">Normal Priority</span>
                <span className="font-mono text-ink font-semibold">72 Hours Target Turnaround</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded bg-gray-50 border border-hairline">
                <span className="font-bold text-ink-mute uppercase text-[10px]">Low Priority</span>
                <span className="font-mono text-ink font-semibold">5 Business Days</span>
              </div>
            </div>
          </div>

          <div className="rounded-none border border-hairline bg-canvas p-5  space-y-4">
            <div className="flex items-center justify-between border-b border-hairline pb-3">
              <div>
                <h3 className="font-bold text-ink text-xs">Escalation & First-Contact Resolution</h3>
                <p className="text-[11px] text-ink-mute">Quality control guidelines for HR operations.</p>
              </div>
              <ShieldAlert className="h-4 w-4 text-amber-600" />
            </div>

            <div className="space-y-3 text-xs text-ink-mute">
              <p>• <strong>First Contact Resolution (FCR)</strong>: HR aims to resolve 65%+ of routine letter and leave balance questions in the first response.</p>
              <p>• <strong>Automated Escalation</strong>: Any urgent ticket exceeding 24 hours without HR response is highlighted to the Head of HR.</p>
              <p>• <strong>Confidentiality</strong>: Inquiries with sensitive PII or payroll details are restricted to designated HR payroll officers.</p>
            </div>
          </div>
        </div>
      )}

      {/* CREATE SUPPORT TICKET MODAL */}
      <Dialog
        isOpen={isCreateTicketOpen}
        onClose={() => setIsCreateTicketOpen(false)}
        title="Submit Employee Support Ticket"
        description="Raise an inquiry for payroll letters, benefit queries, medical claims, or workplace assistance."
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
                <option value="Leave & Absence">Leave & Absence</option>
                <option value="Medical & OPD Claims">Medical & OPD Claims</option>
                <option value="HR Letters & Verification">HR Letters & Verification</option>
                <option value="IT & Access Provisioning">IT & Access Provisioning</option>
                <option value="General HR Inquiry">General HR Inquiry</option>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <Label htmlFor="tSub">Subject *</Label>
              <Input id="tSub" required placeholder="e.g. Request for EPF B-Card Certified Copy" value={ticketSubject} onChange={(e) => setTicketSubject(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="tPrio">Priority</Label>
              <Select
                id="tPrio"
                value={ticketPriority}
                onChange={(e) => setTicketPriority(e.target.value)}
                
              >
                <option value="low">Low (5 Days)</option>
                <option value="normal">Normal (72h)</option>
                <option value="high">High (48h)</option>
                <option value="urgent">Urgent (24h)</option>
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
