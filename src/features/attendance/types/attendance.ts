import { Employee } from '../../employee/types/employee';

export type AttendanceDayStatus =
  | 'present'
  | 'absent'
  | 'half_day'
  | 'late'
  | 'on_leave'
  | 'rest_day'
  | 'holiday';

export type DeviceStatus = 'online' | 'offline' | 'tampered' | 'syncing' | 'unknown';

export interface AttendanceDay {
  id: string;
  employeeId: string;
  attendanceDate: string;
  shiftTemplateId?: string | null;
  scheduledStart?: string | null;
  scheduledEnd?: string | null;
  firstIn?: string | null;
  lastOut?: string | null;
  workedMinutes: number;
  paidMinutes: number;
  breakMinutes: number;
  lateMinutes: number;
  earlyDepartureMinutes: number;
  overtimeMinutes: number;
  approvedOvertimeMinutes: number;
  status: AttendanceDayStatus;
  locked: boolean;
  employee?: Employee;
  shiftTemplate?: ShiftTemplate | null;
}

export interface AttendanceDevice {
  id: string;
  connectionId: string;
  externalDeviceId: string;
  serialNumber?: string | null;
  model?: string | null;
  name: string;
  timezone: string;
  status: DeviceStatus;
  attendanceEnabled: boolean;
  lastSeenAt?: string | null;
  lastEventAt?: string | null;
  branch?: { id: string; name: string } | null;
}

export interface ShiftTemplate {
  id: string;
  code: string;
  name: string;
  startTime: string;
  endTime: string;
  graceInMinutes: number;
  graceOutMinutes: number;
  minimumFullDayMinutes?: number | null;
  active: boolean;
}

export interface AttendanceException {
  id: string;
  employeeId?: string | null;
  attendanceDayId?: string | null;
  exceptionType: string;
  severity: string;
  status: string;
  details?: Record<string, any> | null;
  detectedAt: string;
  employee?: Employee | null;
}

export interface AttendanceRegularizationRequest {
  id: string;
  employeeId: string;
  attendanceDayId?: string | null;
  requestedIn?: string | null;
  requestedOut?: string | null;
  reason: string;
  status: string;
  requestedAt: string;
  employee?: Employee;
}
