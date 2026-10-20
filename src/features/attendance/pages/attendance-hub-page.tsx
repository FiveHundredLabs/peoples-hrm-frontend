import { Select } from '../../../components/ui/select';
import React, { useState } from 'react';
import {
  Clock,
  Radio,
  CalendarDays,
  AlertTriangle,
  Plus,
  Play,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { DatePicker } from '../../../components/ui/date-picker';
import { Label } from '../../../components/ui/label';
import { Dialog } from '../../../components/ui/dialog';
import {
  useDailyAttendance,
  useDevices,
  useCreateDevice,
  useShifts,
  useCreateShift,
  useExceptions,
  useIngestBiometricPunch,
} from '../api/attendance-api';
import { useEmployees } from '../../employee/api/employee-api';
import { useBranches } from '../../organization/api/organization-api';
import { AttendanceDayStatus } from '../types/attendance';
import { cn } from '../../../lib/utils';

export const AttendanceHubPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'timesheet' | 'devices' | 'shifts' | 'exceptions'>('timesheet');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedStatus, setSelectedStatus] = useState<AttendanceDayStatus | undefined>(undefined);

  // Modals State
  const [isSimulateOpen, setIsSimulateOpen] = useState(false);
  const [isCreateDeviceOpen, setIsCreateDeviceOpen] = useState(false);
  const [isCreateShiftOpen, setIsCreateShiftOpen] = useState(false);

  // Simulate Punch Form State
  const [simEmpNo, setSimEmpNo] = useState('');
  const [simDirection, setSimDirection] = useState<'in' | 'out'>('in');
  const [simTime, setSimTime] = useState(new Date().toISOString().substring(0, 16));
  const [simSuccessMsg, setSimSuccessMsg] = useState<string | null>(null);

  // Create Device Form State
  const [devExternalId, setDevExternalId] = useState('');
  const [devName, setDevName] = useState('');
  const [devModel, setDevModel] = useState('DS-K1T671MF Face Terminal');
  const [devSerial, setDevSerial] = useState('');
  const [devBranchId, setDevBranchId] = useState('');

  // Create Shift Form State
  const [shiftCode, setShiftCode] = useState('');
  const [shiftName, setShiftName] = useState('');
  const [shiftStartTime, setShiftStartTime] = useState('08:30');
  const [shiftEndTime, setShiftEndTime] = useState('17:00');
  const [shiftGraceIn, setShiftGraceIn] = useState(15);

  // Queries
  const { data: attendanceData, isLoading: timesheetLoading, refetch: refetchAttendance } = useDailyAttendance({
    date: selectedDate || undefined,
    status: selectedStatus,
  });
  const { data: devices = [], isLoading: devicesLoading } = useDevices();
  const { data: shifts = [] } = useShifts();
  const { data: exceptions = [] } = useExceptions();
  const { data: employeesData } = useEmployees({ limit: 100 });
  const { data: branchesData } = useBranches();

  const employees = employeesData?.data || [];
  const branches = branchesData?.data || [];
  const attendanceLogs = attendanceData?.data || [];

  // Mutations
  const ingestPunchMutation = useIngestBiometricPunch();
  const createDeviceMutation = useCreateDevice();
  const createShiftMutation = useCreateShift();

  const handleSimulatePunch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!simEmpNo) return;
    try {
      const res = await ingestPunchMutation.mutateAsync({
        deviceId: 'HIK-HQ-01',
        employeeNo: simEmpNo,
        eventTime: new Date(simTime).toISOString(),
        direction: simDirection,
        verifyMode: 'face',
      });
      setSimSuccessMsg(
        `Punch recorded successfully for ${simEmpNo} (${simDirection.toUpperCase()})! Day status: ${res?.attendanceDay?.status || 'Calculated'}`,
      );
      setTimeout(() => {
        setSimSuccessMsg(null);
        setIsSimulateOpen(false);
        refetchAttendance();
      }, 1500);
    } catch (err: any) {
      console.error('Failed to ingest punch', err);
    }
  };

  const handleCreateDevice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!devExternalId || !devName) return;
    try {
      await createDeviceMutation.mutateAsync({
        externalDeviceId: devExternalId,
        name: devName,
        model: devModel,
        serialNumber: devSerial || undefined,
        branchId: devBranchId || undefined,
      });
      setIsCreateDeviceOpen(false);
      setDevExternalId('');
      setDevName('');
    } catch (err) {
      console.error('Failed to create device', err);
    }
  };

  const handleCreateShift = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shiftCode || !shiftName) return;
    try {
      await createShiftMutation.mutateAsync({
        code: shiftCode,
        name: shiftName,
        startTime: `${shiftStartTime}:00`,
        endTime: `${shiftEndTime}:00`,
        graceInMinutes: shiftGraceIn,
      });
      setIsCreateShiftOpen(false);
      setShiftCode('');
      setShiftName('');
    } catch (err) {
      console.error('Failed to create shift', err);
    }
  };

  const presentCount = attendanceLogs.filter((a) => a.status === 'present').length;
  const lateCount = attendanceLogs.filter((a) => a.lateMinutes > 0 || a.status === 'late').length;
  const onlineDevicesCount = devices.filter((d) => d.status === 'online').length;

  const formatMinutes = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h}h ${m}m`;
  };

  const formatTimeOnly = (isoStr?: string | null) => {
    if (!isoStr) return '—';
    const date = new Date(isoStr);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusBadge = (status: AttendanceDayStatus) => {
    switch (status) {
      case 'present':
        return <span className="rounded-none bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200 uppercase">Present</span>;
      case 'late':
        return <span className="rounded-none bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700 border border-amber-200 uppercase">Late Arrival</span>;
      case 'half_day':
        return <span className="rounded-none bg-purple-50 px-2 py-0.5 text-[10px] font-bold text-purple-700 border border-purple-200 uppercase">Half Day</span>;
      case 'absent':
        return <span className="rounded-none bg-red-50 px-2 py-0.5 text-[10px] font-bold text-red-700 border border-red-200 uppercase">Absent</span>;
      default:
        return <span className="rounded-none bg-canvas-soft px-2 py-0.5 text-[10px] font-bold text-ink uppercase">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-5 border-b border-hairline">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold tracking-tight text-ink">Hikvision Time & Attendance</h1>
          <p className="text-sm text-muted mt-1">Biometric terminal sync, daily shift logs, and attendance reconciliation.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <Button
            variant="primary-pill"
            size="sm"
            onClick={() => setIsSimulateOpen(true)}
            className="flex items-center gap-1.5"
          >
            <Play className="h-3.5 w-3.5" />
            <span>Simulate Biometric Punch</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsCreateDeviceOpen(true)}
            className="flex items-center gap-1.5"
          >
            <Radio className="h-3.5 w-3.5" />
            <span>Add Terminal</span>
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-none border border-hairline bg-canvas p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted">Present Today</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="mt-2 text-xl sm:text-2xl font-bold text-emerald-700 tracking-tight">{presentCount}</p>
          <span className="text-[11px] text-muted">Punched in & verified</span>
        </div>

        <div className="rounded-none border border-hairline bg-canvas p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted">Late Arrivals</span>
            <Clock className="h-4 w-4 text-amber-600" />
          </div>
          <p className="mt-2 text-xl sm:text-2xl font-bold text-amber-700 tracking-tight">{lateCount}</p>
          <span className="text-[11px] text-muted">Past shift grace window</span>
        </div>

        <div className="rounded-none border border-hairline bg-canvas p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted">Biometric Devices</span>
            <Radio className="h-4 w-4 text-primary" />
          </div>
          <p className="mt-2 text-xl sm:text-2xl font-bold text-ink tracking-tight">{onlineDevicesCount} / {devices.length}</p>
          <span className="text-[11px] text-muted">Terminals online</span>
        </div>

        <div className="rounded-none border border-hairline bg-canvas p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted">Open Exceptions</span>
            <AlertTriangle className="h-4 w-4 text-purple-600" />
          </div>
          <p className="mt-2 text-xl sm:text-2xl font-bold text-purple-700 tracking-tight">{exceptions.length}</p>
          <span className="text-[11px] text-muted">Unresolved punch anomalies</span>
        </div>
      </div>

      {/* Navigation Tab Bar */}
      <div className="flex items-center gap-2 overflow-x-auto border-b border-[#e6e6e6] pb-0 mb-6 scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveTab('timesheet')}
          className={cn(
            'inline-flex items-center gap-2 rounded-none px-3.5 py-2 text-sm font-medium whitespace-nowrap transition-colors cursor-pointer select-none',
            activeTab === 'timesheet'
              ? 'bg-[#1c69d4]/10 text-[#1c69d4] font-bold border-b-2 border-[#1c69d4] rounded-none'
              : 'bg-transparent text-[#6b6b6b] hover:bg-[#f7f7f7] hover:text-[#262626] border-b-2 border-transparent font-normal rounded-none',
          )}
        >
          <CalendarDays className="h-4 w-4" />
          <span>Daily Timesheet</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('devices')}
          className={cn(
            'inline-flex items-center gap-2 rounded-none px-3.5 py-2 text-sm font-medium whitespace-nowrap transition-colors cursor-pointer select-none',
            activeTab === 'devices'
              ? 'bg-[#1c69d4]/10 text-[#1c69d4] font-bold border-b-2 border-[#1c69d4] rounded-none'
              : 'bg-transparent text-[#6b6b6b] hover:bg-[#f7f7f7] hover:text-[#262626] border-b-2 border-transparent font-normal rounded-none',
          )}
        >
          <Radio className="h-4 w-4" />
          <span>Biometric Terminals ({devices.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('shifts')}
          className={cn(
            'inline-flex items-center gap-2 rounded-none px-3.5 py-2 text-sm font-medium whitespace-nowrap transition-colors cursor-pointer select-none',
            activeTab === 'shifts'
              ? 'bg-[#1c69d4]/10 text-[#1c69d4] font-bold border-b-2 border-[#1c69d4] rounded-none'
              : 'bg-transparent text-[#6b6b6b] hover:bg-[#f7f7f7] hover:text-[#262626] border-b-2 border-transparent font-normal rounded-none',
          )}
        >
          <Clock className="h-4 w-4" />
          <span>Shift Profiles ({shifts.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('exceptions')}
          className={cn(
            'inline-flex items-center gap-2 rounded-none px-3.5 py-2 text-sm font-medium whitespace-nowrap transition-colors cursor-pointer select-none',
            activeTab === 'exceptions'
              ? 'bg-[#1c69d4]/10 text-[#1c69d4] font-bold border-b-2 border-[#1c69d4] rounded-none'
              : 'bg-transparent text-[#6b6b6b] hover:bg-[#f7f7f7] hover:text-[#262626] border-b-2 border-transparent font-normal rounded-none',
          )}
        >
          <AlertTriangle className="h-4 w-4" />
          <span>Exceptions ({exceptions.length})</span>
        </button>
      </div>

      {/* TAB 1: DAILY TIMESHEET */}
      {activeTab === 'timesheet' && (
        <div className="space-y-4">
          {/* Timesheet Date & Status Filter Bar */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-none border border-hairline bg-canvas p-4 ">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold uppercase tracking-[0.5px] text-[#262626]">Date:</span>
              <div className="w-56">
                <DatePicker
                  value={selectedDate}
                  onChange={(val) => setSelectedDate(val)}
                  className="h-9 text-xs"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {(
                [
                  { label: 'All Statuses', value: undefined },
                  { label: 'Present', value: 'present' },
                  { label: 'Late', value: 'late' },
                  { label: 'Half Day', value: 'half_day' },
                  { label: 'Absent', value: 'absent' },
                ] as const
              ).map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => setSelectedStatus(item.value as any)}
                  className={`rounded-none px-3 py-1 text-xs font-medium transition-colors cursor-pointer ${
                    selectedStatus === item.value
                      ? 'bg-[#1c69d4] text-white font-bold rounded-none'
                      : 'bg-[#f7f7f7] text-[#262626] border border-[#e6e6e6] hover:bg-[#ebebeb]'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Timesheet Grid */}
          <div className="overflow-hidden rounded-none border border-hairline bg-canvas ">
            {timesheetLoading ? (
              <div className="flex h-48 items-center justify-center">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
            ) : attendanceLogs.length === 0 ? (
              <div className="p-12 text-center">
                <Clock className="mx-auto h-8 w-8 text-ink-mute/50" />
                <h3 className="mt-3 text-sm font-semibold text-ink">No attendance punches recorded for {selectedDate}</h3>
                <p className="mt-1 text-xs text-ink-mute">
                  Use "Simulate Biometric Punch" above to transmit test Hikvision check-in events.
                </p>
                <Button
                  variant="primary-pill"
                  size="sm"
                  onClick={() => setIsSimulateOpen(true)}
                  className="mt-4"
                >
                  Simulate First Punch
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-hairline bg-canvas-lavender/30 text-[11px] font-semibold uppercase text-ink-mute">
                    <tr>
                      <th className="py-3 pl-4 pr-3">Employee</th>
                      <th className="px-3 py-3">First In</th>
                      <th className="px-3 py-3">Last Out</th>
                      <th className="px-3 py-3">Worked Hours</th>
                      <th className="px-3 py-3">Late Mins</th>
                      <th className="px-3 py-3">Overtime</th>
                      <th className="px-3 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-hairline">
                    {attendanceLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-canvas-soft/30 transition-colors">
                        <td className="py-3 pl-4 pr-3">
                          <div className="font-semibold text-ink">{log.employee?.displayName || 'Employee'}</div>
                          <span className="font-mono text-[11px] text-ink-mute">{log.employee?.employeeNumber}</span>
                        </td>
                        <td className="px-3 py-3 font-mono font-medium text-ink">
                          {formatTimeOnly(log.firstIn)}
                        </td>
                        <td className="px-3 py-3 font-mono font-medium text-ink">
                          {formatTimeOnly(log.lastOut)}
                        </td>
                        <td className="px-3 py-3 font-medium text-ink">
                          {formatMinutes(log.workedMinutes)}
                        </td>
                        <td className="px-3 py-3">
                          {log.lateMinutes > 0 ? (
                            <span className="font-semibold text-amber-700">+{log.lateMinutes} min</span>
                          ) : (
                            <span className="text-ink-mute">On time</span>
                          )}
                        </td>
                        <td className="px-3 py-3">
                          {log.overtimeMinutes > 0 ? (
                            <span className="font-semibold text-emerald-700">+{formatMinutes(log.overtimeMinutes)}</span>
                          ) : (
                            <span className="text-ink-mute">—</span>
                          )}
                        </td>
                        <td className="px-3 py-3">
                          {getStatusBadge(log.status)}
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

      {/* TAB 2: BIOMETRIC TERMINALS */}
      {activeTab === 'devices' && (
        <div className="overflow-hidden rounded-none border border-hairline bg-canvas ">
          {devicesLoading ? (
            <div className="flex h-48 items-center justify-center">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : devices.length === 0 ? (
            <div className="p-12 text-center">
              <Radio className="mx-auto h-8 w-8 text-ink-mute/50" />
              <h3 className="mt-3 text-sm font-semibold text-ink">No biometric terminals connected</h3>
              <p className="mt-1 text-xs text-ink-mute">
                Register Hikvision face recognition or card reader terminals to stream punches in real-time.
              </p>
              <Button
                variant="primary-pill"
                size="sm"
                onClick={() => setIsCreateDeviceOpen(true)}
                className="mt-4"
              >
                Register First Terminal
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-hairline bg-canvas-lavender/30 text-[11px] font-semibold uppercase text-ink-mute">
                  <tr>
                    <th className="py-3 pl-4 pr-3">Terminal Name</th>
                    <th className="px-3 py-3">Device Code</th>
                    <th className="px-3 py-3">Model</th>
                    <th className="px-3 py-3">Branch Location</th>
                    <th className="px-3 py-3">Status</th>
                    <th className="px-3 py-3">Last Heartbeat</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hairline">
                  {devices.map((d) => (
                    <tr key={d.id} className="hover:bg-canvas-soft/30 transition-colors">
                      <td className="py-3 pl-4 pr-3 font-semibold text-ink">
                        {d.name}
                      </td>
                      <td className="px-3 py-3 font-mono text-xs text-ink">
                        {d.externalDeviceId}
                      </td>
                      <td className="px-3 py-3 text-ink-mute">
                        {d.model || 'Hikvision Terminal'}
                      </td>
                      <td className="px-3 py-3 text-ink-mute">
                        {d.branch?.name || 'Head Office'}
                      </td>
                      <td className="px-3 py-3">
                        <span className="flex items-center gap-1.5 font-semibold text-emerald-700">
                          <span className="h-2 w-2 rounded-none bg-emerald-500 animate-pulse" />
                          ONLINE
                        </span>
                      </td>
                      <td className="px-3 py-3 text-ink-mute">
                        {d.lastSeenAt ? new Date(d.lastSeenAt).toLocaleTimeString() : 'Live'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: SHIFT TEMPLATES */}
      {activeTab === 'shifts' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button
              variant="primary-pill"
              size="sm"
              onClick={() => setIsCreateShiftOpen(true)}
              className="flex items-center gap-1.5"
            >
              <Plus className="h-4 w-4" />
              Create Shift
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {shifts.map((s) => (
              <div key={s.id} className="rounded-none border border-hairline bg-canvas p-4  space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-ink text-sm">{s.name}</span>
                  <span className="font-mono text-xs rounded bg-primary/10 text-primary px-1.5 py-0.5 font-bold">
                    {s.code}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-ink">
                  <Clock className="h-3.5 w-3.5 text-ink-mute" />
                  <span>{s.startTime.substring(0, 5)} — {s.endTime.substring(0, 5)}</span>
                </div>
                <p className="text-[11px] text-ink-mute">Grace Period: {s.graceInMinutes} minutes</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: EXCEPTIONS */}
      {activeTab === 'exceptions' && (
        <div className="overflow-hidden rounded-none border border-hairline bg-canvas ">
          {exceptions.length === 0 ? (
            <div className="p-12 text-center">
              <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-600" />
              <h3 className="mt-3 text-sm font-semibold text-ink">No Attendance Exceptions</h3>
              <p className="mt-1 text-xs text-ink-mute">
                All device biometric events have matched registered employees cleanly.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-hairline">
              {exceptions.map((ex) => (
                <div key={ex.id} className="flex items-center justify-between p-4 text-xs">
                  <div>
                    <h4 className="font-semibold text-ink">{ex.exceptionType}</h4>
                    <span className="text-ink-mute">Detected: {new Date(ex.detectedAt).toLocaleString()}</span>
                  </div>
                  <span className="rounded-none bg-amber-50 px-2 py-0.5 font-bold uppercase text-[10px] text-amber-700 border border-amber-200">
                    {ex.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SIMULATE BIOMETRIC PUNCH DIALOG */}
      <Dialog
        isOpen={isSimulateOpen}
        onClose={() => setIsSimulateOpen(false)}
        title="Simulate Hikvision Biometric Punch"
        description="Trigger a real-time face/biometric event from a Hikvision terminal."
        maxWidth="md"
      >
        <form onSubmit={handleSimulatePunch} className="space-y-4 text-xs">
          {simSuccessMsg && (
            <div className="flex items-center gap-2 rounded-none bg-emerald-50 p-3 text-xs text-emerald-800 font-medium">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>{simSuccessMsg}</span>
            </div>
          )}

          <div>
            <Label htmlFor="simEmpNo">Select Employee *</Label>
            <Select
              id="simEmpNo"
              required
              value={simEmpNo}
              onChange={(e) => setSimEmpNo(e.target.value)}
              
            >
              <option value="">Select Employee</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.employeeNumber}>
                  {emp.displayName} ({emp.employeeNumber})
                </option>
              ))}
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="simDirection">Punch Direction *</Label>
              <Select
                id="simDirection"
                value={simDirection}
                onChange={(e) => setSimDirection(e.target.value as any)}
                
              >
                <option value="in">Check In (Entry)</option>
                <option value="out">Check Out (Exit)</option>
              </Select>
            </div>

            <div>
              <Label htmlFor="simTime">Event Timestamp *</Label>
              <Input
                id="simTime"
                type="datetime-local"
                required
                value={simTime}
                onChange={(e) => setSimTime(e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-hairline">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsSimulateOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary-pill"
              size="sm"
              disabled={ingestPunchMutation.isPending}
            >
              {ingestPunchMutation.isPending ? 'Transmitting...' : 'Transmit Event'}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* CREATE DEVICE DIALOG */}
      <Dialog
        isOpen={isCreateDeviceOpen}
        onClose={() => setIsCreateDeviceOpen(false)}
        title="Register Biometric Device"
        description="Connect a Hikvision or biometric attendance terminal."
        maxWidth="md"
      >
        <form onSubmit={handleCreateDevice} className="space-y-4 text-xs">
          <div>
            <Label htmlFor="devName">Device / Terminal Name *</Label>
            <Input
              id="devName"
              required
              placeholder="e.g. Head Office 1st Floor Entrance"
              value={devName}
              onChange={(e) => setDevName(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="devExternalId">Device Code / IP *</Label>
              <Input
                id="devExternalId"
                required
                placeholder="e.g. HIK-TERM-001"
                value={devExternalId}
                onChange={(e) => setDevExternalId(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="devModel">Model</Label>
              <Input
                id="devModel"
                placeholder="e.g. DS-K1T671MF"
                value={devModel}
                onChange={(e) => setDevModel(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="devSerial">Serial Number</Label>
              <Input
                id="devSerial"
                placeholder="e.g. HIK-9921008"
                value={devSerial}
                onChange={(e) => setDevSerial(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="devBranchId">Branch Location</Label>
              <Select
                id="devBranchId"
                value={devBranchId}
                onChange={(e) => setDevBranchId(e.target.value)}
                
              >
                <option value="">Default Branch</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-hairline">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsCreateDeviceOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary-pill"
              size="sm"
              disabled={createDeviceMutation.isPending}
            >
              {createDeviceMutation.isPending ? 'Saving...' : 'Register Terminal'}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* CREATE SHIFT DIALOG */}
      <Dialog
        isOpen={isCreateShiftOpen}
        onClose={() => setIsCreateShiftOpen(false)}
        title="Create Shift Template"
        description="Configure work hours and grace periods."
        maxWidth="md"
      >
        <form onSubmit={handleCreateShift} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="shiftCode">Shift Code *</Label>
              <Input
                id="shiftCode"
                required
                placeholder="e.g. MORN-01"
                value={shiftCode}
                onChange={(e) => setShiftCode(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="shiftName">Shift Name *</Label>
              <Input
                id="shiftName"
                required
                placeholder="e.g. Morning Shift"
                value={shiftName}
                onChange={(e) => setShiftName(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label htmlFor="shiftStartTime">Start Time *</Label>
              <Input
                id="shiftStartTime"
                type="time"
                required
                value={shiftStartTime}
                onChange={(e) => setShiftStartTime(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="shiftEndTime">End Time *</Label>
              <Input
                id="shiftEndTime"
                type="time"
                required
                value={shiftEndTime}
                onChange={(e) => setShiftEndTime(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="shiftGraceIn">Grace (Mins)</Label>
              <Input
                id="shiftGraceIn"
                type="number"
                value={shiftGraceIn}
                onChange={(e) => setShiftGraceIn(parseInt(e.target.value, 10))}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-hairline">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsCreateShiftOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary-pill"
              size="sm"
              disabled={createShiftMutation.isPending}
            >
              {createShiftMutation.isPending ? 'Saving...' : 'Save Shift'}
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
};
