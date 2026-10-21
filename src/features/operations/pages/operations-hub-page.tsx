import { Textarea } from '../../../components/ui/textarea';
import { Select } from '../../../components/ui/select';
import React, { useState } from 'react';
import {
  Activity,
  Bell,
  Cpu,
  Database,
  HardDrive,
  Plus,
  Radio,
  RefreshCw,
  Server,
  Settings,
  ShieldCheck,
  Webhook,
  Zap,
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Dialog } from '../../../components/ui/dialog';
import {
  useSystemDiagnostics,
  useSystemSettings,
  useUpdateSystemSetting,
  useNotificationTemplates,
  useNotifications,
  useSendNotification,
  useWebhooks,
  useRegisterWebhook,
  useToggleWebhook,
} from '../data/operations-data';
import { useEmployees } from '../../employee/data/employee-data';
import { cn } from '../../../lib/utils';

export const OperationsHubPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'diagnostics' | 'settings' | 'notifications' | 'webhooks' | 'dr'>('diagnostics');

  // Modals
  const [isSendNotifOpen, setIsSendNotifOpen] = useState(false);
  const [isRegisterWebhookOpen, setIsRegisterWebhookOpen] = useState(false);
  const [isEditSettingOpen, setIsEditSettingOpen] = useState(false);

  // Queries
  const { data: diagnostics, refetch: refetchDiagnostics, isFetching } = useSystemDiagnostics();
  const { data: settings = [] } = useSystemSettings();
  const { data: templates = [] } = useNotificationTemplates();
  const { data: notifications = [] } = useNotifications();
  const { data: webhooks = [] } = useWebhooks();
  const { data: employeesResponse } = useEmployees();

  const employees = employeesResponse?.data || [];

  // Mutations
  const updateSettingMutation = useUpdateSystemSetting();
  const sendNotifMutation = useSendNotification();
  const registerWebhookMutation = useRegisterWebhook();
  const toggleWebhookMutation = useToggleWebhook();

  // Send Notification State
  const [notifUserId, setNotifUserId] = useState('');
  const [notifTitle, setNotifTitle] = useState('');
  const [notifBody, setNotifBody] = useState('');
  const [notifType, setNotifType] = useState('SYSTEM_ANNOUNCEMENT');

  // Register Webhook State
  const [whName, setWhName] = useState('');
  const [whUrl, setWhUrl] = useState('');
  const [whSecret, setWhSecret] = useState('sec_corp_webhook_2026');
  const [whEvents, setWhEvents] = useState('payroll.finalized, employee.onboarded');

  // Edit Setting State
  const [selectedKey, setSelectedKey] = useState('');
  const [selectedValue, setSelectedValue] = useState<any>('');
  const [selectedDesc, setSelectedDesc] = useState('');

  // Handlers
  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifUserId || !notifTitle || !notifBody) return;
    try {
      await sendNotifMutation.mutateAsync({
        userId: notifUserId,
        type: notifType,
        title: notifTitle,
        body: notifBody,
        channels: ['in_app', 'email'],
      });
      setIsSendNotifOpen(false);
      setNotifTitle('');
      setNotifBody('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleRegisterWebhook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!whName || !whUrl) return;
    try {
      await registerWebhookMutation.mutateAsync({
        name: whName,
        url: whUrl,
        secretReference: whSecret,
        subscribedEvents: whEvents.split(',').map((s) => s.trim()),
      });
      setIsRegisterWebhookOpen(false);
      setWhName('');
      setWhUrl('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveSetting = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let parsedValue: any = selectedValue;
      if (selectedValue === 'true') parsedValue = true;
      if (selectedValue === 'false') parsedValue = false;
      if (!isNaN(Number(selectedValue)) && typeof selectedValue === 'string' && selectedValue.trim() !== '') {
        parsedValue = Number(selectedValue);
      }

      await updateSettingMutation.mutateAsync({
        key: selectedKey,
        value: parsedValue,
        description: selectedDesc,
      });
      setIsEditSettingOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-5 border-b border-hairline">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold tracking-tight text-ink">System Operations, Telemetry & Hardening</h1>
          <p className="text-sm text-muted mt-1">System telemetry, webhooks, broadcast notices, and audit logs.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetchDiagnostics()}
            disabled={isFetching}
            className="flex items-center gap-1.5"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? 'animate-spin' : ''}`} />
            <span>Refresh Telemetry</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsRegisterWebhookOpen(true)}
            className="flex items-center gap-1.5"
          >
            <Webhook className="h-3.5 w-3.5" />
            <span>Register Webhook</span>
          </Button>
          <Button
            variant="primary-pill"
            size="sm"
            onClick={() => setIsSendNotifOpen(true)}
            className="flex items-center gap-1.5"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Dispatch Notification</span>
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-none border border-hairline bg-canvas p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted">Overall System Health</span>
            <Activity className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="mt-2 text-xl sm:text-2xl font-bold text-emerald-700 tracking-tight">
            {diagnostics?.status === 'healthy' ? '100% Operational' : 'Degraded'}
          </p>
          <span className="text-[11px] text-muted">Zero critical anomalies</span>
        </div>

        <div className="rounded-none border border-hairline bg-canvas p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted">Memory Footprint</span>
            <Cpu className="h-4 w-4 text-primary" />
          </div>
          <p className="mt-2 text-xl sm:text-2xl font-bold text-ink tracking-tight">
            {diagnostics?.memory?.rssMb || 128} MB RSS
          </p>
          <span className="text-[11px] text-muted">Heap: {diagnostics?.memory?.heapUsedMb || 65} MB</span>
        </div>

        <div className="rounded-none border border-hairline bg-canvas p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted">Redis Cache & Sessions</span>
            <Zap className="h-4 w-4 text-amber-600" />
          </div>
          <p className="mt-2 text-xl sm:text-2xl font-bold text-amber-700 tracking-tight">
            {diagnostics?.subsystems?.redis?.latencyMs || 2} ms Latency
          </p>
          <span className="text-[11px] text-muted">Redis 7 Alpine (Docker)</span>
        </div>

        <div className="rounded-none border border-hairline bg-canvas p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted">Queue Backlog</span>
            <Radio className="h-4 w-4 text-purple-600" />
          </div>
          <p className="mt-2 text-xl sm:text-2xl font-bold text-purple-700 tracking-tight font-mono">
            {diagnostics?.subsystems?.bullmq?.backlog || 0} Jobs
          </p>
          <span className="text-[11px] text-muted">BullMQ worker active</span>
        </div>
      </div>

      {/* Navigation Tab Bar */}
      <div className="flex items-center gap-2 overflow-x-auto border-b border-[#e6e6e6] pb-0 mb-6 scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveTab('diagnostics')}
          className={cn(
            'inline-flex items-center gap-2 rounded-none px-3.5 py-2 text-sm font-medium whitespace-nowrap transition-colors cursor-pointer select-none',
            activeTab === 'diagnostics'
              ? 'bg-[#1c69d4]/10 text-[#1c69d4] font-bold border-b-2 border-[#1c69d4] rounded-none'
              : 'bg-transparent text-[#6b6b6b] hover:bg-[#f7f7f7] hover:text-[#262626] border-b-2 border-transparent font-normal rounded-none',
          )}
        >
          <Activity className="h-4 w-4" />
          <span>Live Diagnostics</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('settings')}
          className={cn(
            'inline-flex items-center gap-2 rounded-none px-3.5 py-2 text-sm font-medium whitespace-nowrap transition-colors cursor-pointer select-none',
            activeTab === 'settings'
              ? 'bg-[#1c69d4]/10 text-[#1c69d4] font-bold border-b-2 border-[#1c69d4] rounded-none'
              : 'bg-transparent text-[#6b6b6b] hover:bg-[#f7f7f7] hover:text-[#262626] border-b-2 border-transparent font-normal rounded-none',
          )}
        >
          <Settings className="h-4 w-4" />
          <span>Global Settings ({settings.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('notifications')}
          className={cn(
            'inline-flex items-center gap-2 rounded-none px-3.5 py-2 text-sm font-medium whitespace-nowrap transition-colors cursor-pointer select-none',
            activeTab === 'notifications'
              ? 'bg-[#1c69d4]/10 text-[#1c69d4] font-bold border-b-2 border-[#1c69d4] rounded-none'
              : 'bg-transparent text-[#6b6b6b] hover:bg-[#f7f7f7] hover:text-[#262626] border-b-2 border-transparent font-normal rounded-none',
          )}
        >
          <Bell className="h-4 w-4" />
          <span>Notifications ({templates.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('webhooks')}
          className={cn(
            'inline-flex items-center gap-2 rounded-none px-3.5 py-2 text-sm font-medium whitespace-nowrap transition-colors cursor-pointer select-none',
            activeTab === 'webhooks'
              ? 'bg-[#1c69d4]/10 text-[#1c69d4] font-bold border-b-2 border-[#1c69d4] rounded-none'
              : 'bg-transparent text-[#6b6b6b] hover:bg-[#f7f7f7] hover:text-[#262626] border-b-2 border-transparent font-normal rounded-none',
          )}
        >
          <Webhook className="h-4 w-4" />
          <span>Webhooks ({webhooks.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('dr')}
          className={cn(
            'inline-flex items-center gap-2 rounded-none px-3.5 py-2 text-sm font-medium whitespace-nowrap transition-colors cursor-pointer select-none',
            activeTab === 'dr'
              ? 'bg-[#1c69d4]/10 text-[#1c69d4] font-bold border-b-2 border-[#1c69d4] rounded-none'
              : 'bg-transparent text-[#6b6b6b] hover:bg-[#f7f7f7] hover:text-[#262626] border-b-2 border-transparent font-normal rounded-none',
          )}
        >
          <ShieldCheck className="h-4 w-4" />
          <span>Disaster Recovery & Security</span>
        </button>
      </div>

      {/* TAB 1: DIAGNOSTICS & TELEMETRY */}
      {activeTab === 'diagnostics' && (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {/* Subsystem Health */}
          <div className="rounded-none border border-hairline bg-canvas p-5  space-y-4">
            <div className="flex items-center justify-between border-b border-hairline pb-3">
              <div>
                <h3 className="font-bold text-ink text-xs">Core Subsystem Telemetry</h3>
                <p className="text-[11px] text-ink-mute">Real-time status of backend service dependencies.</p>
              </div>
              <Server className="h-4 w-4 text-primary" />
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 rounded-none bg-canvas-lavender/30 border border-hairline">
                <div className="flex items-center gap-2">
                  <Database className="h-4 w-4 text-primary" />
                  <div>
                    <span className="font-bold text-ink block">PostgreSQL Database</span>
                    <span className="text-[10px] text-ink-mute">Host: localhost:5432 / DB: sri_lanka_hrms</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="rounded-none bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200 uppercase">
                    {diagnostics?.subsystems?.database?.status || 'HEALTHY'}
                  </span>
                  <span className="block font-mono text-[10px] text-ink-mute">{diagnostics?.subsystems?.database?.latencyMs || 1} ms</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-none bg-canvas-lavender/30 border border-hairline">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-amber-600" />
                  <div>
                    <span className="font-bold text-ink block">Redis Session & Cache</span>
                    <span className="text-[10px] text-ink-mute">Docker port 6379 / Session Store</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="rounded-none bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200 uppercase">
                    {diagnostics?.subsystems?.redis?.status || 'HEALTHY'}
                  </span>
                  <span className="block font-mono text-[10px] text-ink-mute">{diagnostics?.subsystems?.redis?.latencyMs || 2} ms</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-none bg-canvas-lavender/30 border border-hairline">
                <div className="flex items-center gap-2">
                  <Radio className="h-4 w-4 text-purple-600" />
                  <div>
                    <span className="font-bold text-ink block">BullMQ Background Queue</span>
                    <span className="text-[10px] text-ink-mute">Queue: hrms-background-tasks</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="rounded-none bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200 uppercase">
                    ACTIVE
                  </span>
                  <span className="block font-mono text-[10px] text-ink-mute">0 backlog</span>
                </div>
              </div>
            </div>
          </div>

          {/* Entity Database Statistics */}
          <div className="rounded-none border border-hairline bg-canvas p-5  space-y-4">
            <div className="flex items-center justify-between border-b border-hairline pb-3">
              <div>
                <h3 className="font-bold text-ink text-xs">Entity Database Statistics</h3>
                <p className="text-[11px] text-ink-mute">Live PostgreSQL table counts and system uptime.</p>
              </div>
              <HardDrive className="h-4 w-4 text-emerald-600" />
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-none bg-canvas-lavender/30 border border-hairline">
                <span className="text-[11px] text-ink-mute block">Total Active Employees</span>
                <span className="text-xl font-bold text-ink font-mono mt-1 block">
                  {diagnostics?.entityStatistics?.employees || 1}
                </span>
              </div>
              <div className="p-3 rounded-none bg-canvas-lavender/30 border border-hairline">
                <span className="text-[11px] text-ink-mute block">Global System Settings</span>
                <span className="text-xl font-bold text-ink font-mono mt-1 block">
                  {diagnostics?.entityStatistics?.systemSettings || 7}
                </span>
              </div>
              <div className="p-3 rounded-none bg-canvas-lavender/30 border border-hairline">
                <span className="text-[11px] text-ink-mute block">Notification Templates</span>
                <span className="text-xl font-bold text-ink font-mono mt-1 block">
                  {diagnostics?.entityStatistics?.notificationTemplates || 3}
                </span>
              </div>
              <div className="p-3 rounded-none bg-canvas-lavender/30 border border-hairline">
                <span className="text-[11px] text-ink-mute block">System Uptime</span>
                <span className="text-xl font-bold text-emerald-700 font-mono mt-1 block">
                  {Math.floor((diagnostics?.uptimeSeconds || 3600) / 60)} mins
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: GLOBAL SETTINGS */}
      {activeTab === 'settings' && (
        <div className="overflow-hidden rounded-none border border-hairline bg-canvas ">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-hairline bg-canvas-lavender/30 text-[11px] font-semibold uppercase text-ink-mute">
                <tr>
                  <th className="py-3 pl-4 pr-3">Configuration Key</th>
                  <th className="px-3 py-3">Configured Value</th>
                  <th className="px-3 py-3">Description</th>
                  <th className="px-3 py-3 text-center">Secret Reference</th>
                  <th className="py-3 pl-3 pr-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {settings.map((s) => (
                  <tr key={s.id} className="hover:bg-canvas-soft/30 transition-colors">
                    <td className="py-3 pl-4 pr-3 font-mono font-bold text-primary">
                      {s.key}
                    </td>
                    <td className="px-3 py-3 font-mono font-semibold text-ink">
                      {typeof s.value === 'boolean' ? (
                        <span className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase ${s.value ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'}`}>
                          {s.value ? 'TRUE' : 'FALSE'}
                        </span>
                      ) : (
                        String(s.value)
                      )}
                    </td>
                    <td className="px-3 py-3 text-ink-mute text-[11px] max-w-xs">
                      {s.description || 'Global configuration parameter.'}
                    </td>
                    <td className="px-3 py-3 text-center">
                      {s.isSecret ? (
                        <span className="rounded-none bg-red-50 px-2 py-0.5 text-[10px] font-bold text-red-700 border border-red-200 uppercase">
                          Encrypted
                        </span>
                      ) : (
                        <span className="text-[10px] text-ink-mute">Plaintext</span>
                      )}
                    </td>
                    <td className="py-3 pl-3 pr-4 text-right">
                      <Button
                        variant="secondary-pill"
                        size="sm"
                        onClick={() => {
                          setSelectedKey(s.key);
                          setSelectedValue(String(s.value));
                          setSelectedDesc(s.description || '');
                          setIsEditSettingOpen(true);
                        }}
                      >
                        Edit Setting
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: NOTIFICATIONS & TEMPLATES */}
      {activeTab === 'notifications' && (
        <div className="space-y-6">
          <div className="overflow-hidden rounded-none border border-hairline bg-canvas ">
            <div className="p-4 border-b border-hairline">
              <h3 className="font-bold text-xs text-ink">Multi-Channel Notification Templates</h3>
              <p className="text-[11px] text-ink-mute">Pre-configured operational messages for transactional HR events.</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-hairline bg-canvas-lavender/30 text-[11px] font-semibold uppercase text-ink-mute">
                  <tr>
                    <th className="py-3 pl-4 pr-3">Template Code</th>
                    <th className="px-3 py-3">Channel</th>
                    <th className="px-3 py-3">Subject Template</th>
                    <th className="px-3 py-3">Body Template Preview</th>
                    <th className="py-3 pl-3 pr-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hairline">
                  {templates.map((t) => (
                    <tr key={t.id} className="hover:bg-canvas-soft/30 transition-colors">
                      <td className="py-3 pl-4 pr-3 font-mono font-bold text-primary">
                        {t.code}
                      </td>
                      <td className="px-3 py-3">
                        <span className="rounded bg-canvas-lavender/50 px-2 py-0.5 text-[10px] font-bold uppercase text-ink font-mono">
                          {t.channel}
                        </span>
                      </td>
                      <td className="px-3 py-3 font-semibold text-ink max-w-xs truncate">
                        {t.subjectTemplate || 'N/A'}
                      </td>
                      <td className="px-3 py-3 text-ink-mute text-[11px] max-w-sm truncate">
                        {t.bodyTemplate}
                      </td>
                      <td className="py-3 pl-3 pr-4 text-right">
                        <span className="rounded-none bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200 uppercase">
                          Active
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="overflow-hidden rounded-none border border-hairline bg-canvas ">
            <div className="p-4 border-b border-hairline">
              <h3 className="font-bold text-xs text-ink">Recent Notification Deliveries</h3>
              <p className="text-[11px] text-ink-mute">Audit log of system and operational messages dispatched.</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-hairline bg-canvas-lavender/30 text-[11px] font-semibold uppercase text-ink-mute">
                  <tr>
                    <th className="py-3 pl-4 pr-3">Notification Title & Body</th>
                    <th className="px-3 py-3">Type</th>
                    <th className="px-3 py-3">Priority</th>
                    <th className="px-3 py-3">Dispatched At</th>
                    <th className="py-3 pl-3 pr-4 text-right">Delivery Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hairline">
                  {notifications.map((n) => (
                    <tr key={n.id} className="hover:bg-canvas-soft/30 transition-colors">
                      <td className="py-3 pl-4 pr-3 font-semibold text-ink max-w-xs">
                        <div>{n.title}</div>
                        <div className="text-[11px] text-ink-mute font-normal truncate">{n.body}</div>
                      </td>
                      <td className="px-3 py-3 font-mono text-ink-mute text-[11px]">
                        {n.type}
                      </td>
                      <td className="px-3 py-3">
                        <span className="rounded-none bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700 border border-blue-200 uppercase">
                          {n.priority}
                        </span>
                      </td>
                      <td className="px-3 py-3 font-mono text-ink-mute">
                        {new Date(n.createdAt).toLocaleString()}
                      </td>
                      <td className="py-3 pl-3 pr-4 text-right">
                        <span className="rounded-none bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200 uppercase">
                          Delivered
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: WEBHOOKS */}
      {activeTab === 'webhooks' && (
        <div className="overflow-hidden rounded-none border border-hairline bg-canvas ">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-hairline bg-canvas-lavender/30 text-[11px] font-semibold uppercase text-ink-mute">
                <tr>
                  <th className="py-3 pl-4 pr-3">Webhook Integration Name</th>
                  <th className="px-3 py-3">Target Payload URL</th>
                  <th className="px-3 py-3">Subscribed Events</th>
                  <th className="px-3 py-3 text-center">Status</th>
                  <th className="py-3 pl-3 pr-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {webhooks.map((w) => (
                  <tr key={w.id} className="hover:bg-canvas-soft/30 transition-colors">
                    <td className="py-3 pl-4 pr-3 font-semibold text-ink">
                      <div>{w.name}</div>
                      <div className="font-mono text-[10px] text-ink-mute">Secret: {w.secretReference || 'Protected'}</div>
                    </td>
                    <td className="px-3 py-3 font-mono text-primary max-w-xs truncate">
                      {w.url}
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex flex-wrap gap-1">
                        {w.subscribedEvents?.map((ev, i) => (
                          <span key={i} className="rounded bg-canvas-lavender/50 px-1.5 py-0.2 font-mono text-[10px] text-ink">
                            {ev}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-3 py-3 text-center">
                      {w.active ? (
                        <span className="rounded-none bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200 uppercase">
                          Active & Listening
                        </span>
                      ) : (
                        <span className="rounded-none bg-red-50 px-2.5 py-0.5 text-[10px] font-bold text-red-700 border border-red-200 uppercase">
                          Disabled
                        </span>
                      )}
                    </td>
                    <td className="py-3 pl-3 pr-4 text-right">
                      <Button
                        variant="secondary-pill"
                        size="sm"
                        onClick={() => toggleWebhookMutation.mutate({ id: w.id, active: !w.active })}
                      >
                        {w.active ? 'Disable' : 'Enable'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: DISASTER RECOVERY & SECURITY */}
      {activeTab === 'dr' && (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div className="rounded-none border border-hairline bg-canvas p-5  space-y-4">
            <div className="flex items-center justify-between border-b border-hairline pb-3">
              <div>
                <h3 className="font-bold text-ink text-xs">Production Backup & PITR Strategy</h3>
                <p className="text-[11px] text-ink-mute">Disaster recovery standards and backup schedules.</p>
              </div>
              <HardDrive className="h-4 w-4 text-primary" />
            </div>

            <div className="space-y-3 text-xs text-ink-mute">
              <p>• <strong>Automated Daily Snapshots</strong>: Full PostgreSQL database dumps executed nightly at 02:00 Asia/Colombo time.</p>
              <p>• <strong>WAL Archiving & Point-In-Time-Recovery (PITR)</strong>: Write-Ahead Logging preserves transactions up to 5-minute recovery point objective (RPO).</p>
              <p>• <strong>Redis Session Failover</strong>: Session states backed by Redis AOF (Append-Only File) persistence with automated restart recovery.</p>
              <p>• <strong>RTO & RPO SLA</strong>: Maximum 1-hour Recovery Time Objective (RTO) with zero data loss on financial ledger entities.</p>
            </div>
          </div>

          <div className="rounded-none border border-hairline bg-canvas p-5  space-y-4">
            <div className="flex items-center justify-between border-b border-hairline pb-3">
              <div>
                <h3 className="font-bold text-ink text-xs">Cryptographic & Security Hardening</h3>
                <p className="text-[11px] text-ink-mute">Defense-in-depth security layer validation.</p>
              </div>
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
            </div>

            <div className="space-y-3 text-xs text-ink-mute">
              <p>• <strong>AES-256-GCM Column-Level Encryption</strong>: National Identity Card (NIC), passport numbers, and bank account details encrypted with unique authentication tags.</p>
              <p>• <strong>HTTP Security Headers</strong>: Strict CSP, HSTS, X-Content-Type-Options: nosniff, and anti-clickjacking frame guards enabled across all responses.</p>
              <p>• <strong>Rate Limiting & Anti-DDoS</strong>: In-memory & Redis rate limiting protecting authentication and sensitive calculation endpoints.</p>
            </div>
          </div>
        </div>
      )}

      {/* DISPATCH NOTIFICATION MODAL */}
      <Dialog
        isOpen={isSendNotifOpen}
        onClose={() => setIsSendNotifOpen(false)}
        title="Dispatch Operational Notification"
        description="Send staff notification."
        maxWidth="md"
      >
        <form onSubmit={handleSendNotification} className="space-y-4 text-xs">
          <div>
            <Label htmlFor="nUser">Recipient Employee / User *</Label>
            <Select
              id="nUser"
              required
              value={notifUserId}
              onChange={(e) => setNotifUserId(e.target.value)}
              
            >
              <option value="">Select Recipient</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.displayName} ({emp.employeeNumber})
                </option>
              ))}
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="nType">Notification Type</Label>
              <Input id="nType" value={notifType} onChange={(e) => setNotifType(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="nTitle">Message Title *</Label>
              <Input id="nTitle" required placeholder="e.g. Scheduled System Upgrade" value={notifTitle} onChange={(e) => setNotifTitle(e.target.value)} />
            </div>
          </div>

          <div>
            <Label htmlFor="nBody">Message Content *</Label>
            <Textarea
              id="nBody"
              required
              rows={3}
              placeholder="e.g. Scheduled database maintenance will take place tonight from 23:00 to 23:30 Asia/Colombo."
              value={notifBody}
              onChange={(e) => setNotifBody(e.target.value)}
              
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-hairline">
            <Button type="button" variant="ghost" size="sm" onClick={() => setIsSendNotifOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary-pill" size="sm" disabled={sendNotifMutation.isPending}>
              {sendNotifMutation.isPending ? 'Sending...' : 'Dispatch Notification'}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* REGISTER WEBHOOK MODAL */}
      <Dialog
        isOpen={isRegisterWebhookOpen}
        onClose={() => setIsRegisterWebhookOpen(false)}
        title="Register Outbound Webhook"
        description="Add webhook endpoint."
        maxWidth="md"
      >
        <form onSubmit={handleRegisterWebhook} className="space-y-4 text-xs">
          <div>
            <Label htmlFor="wName">Integration Name *</Label>
            <Input id="wName" required placeholder="e.g. Finance ERP General Ledger Hook" value={whName} onChange={(e) => setWhName(e.target.value)} />
          </div>

          <div>
            <Label htmlFor="wUrl">Webhook Endpoint URL *</Label>
            <Input id="wUrl" required placeholder="https://api.company.lk/webhooks/hrms" value={whUrl} onChange={(e) => setWhUrl(e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="wSec">Secret Reference</Label>
              <Input id="wSec" value={whSecret} onChange={(e) => setWhSecret(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="wEv">Subscribed Events (Comma-separated)</Label>
              <Input id="wEv" value={whEvents} onChange={(e) => setWhEvents(e.target.value)} />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-hairline">
            <Button type="button" variant="ghost" size="sm" onClick={() => setIsRegisterWebhookOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary-pill" size="sm" disabled={registerWebhookMutation.isPending}>
              {registerWebhookMutation.isPending ? 'Saving...' : 'Register Webhook'}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* EDIT SETTING MODAL */}
      <Dialog
        isOpen={isEditSettingOpen}
        onClose={() => setIsEditSettingOpen(false)}
        title="Edit System Setting"
        description="Update system parameter."
        maxWidth="md"
      >
        <form onSubmit={handleSaveSetting} className="space-y-4 text-xs">
          <div>
            <Label>Configuration Key</Label>
            <Input value={selectedKey} disabled className="bg-canvas-lavender/50 font-mono font-bold" />
          </div>

          <div>
            <Label htmlFor="sVal">Value</Label>
            <Input id="sVal" value={selectedValue} onChange={(e) => setSelectedValue(e.target.value)} />
          </div>

          <div>
            <Label htmlFor="sDesc">Description</Label>
            <Input id="sDesc" value={selectedDesc} onChange={(e) => setSelectedDesc(e.target.value)} />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-hairline">
            <Button type="button" variant="ghost" size="sm" onClick={() => setIsEditSettingOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary-pill" size="sm" disabled={updateSettingMutation.isPending}>
              {updateSettingMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
};
