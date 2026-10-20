import { Employee } from '../../employee/types/employee';

export type LeaveRequestStatus =
  | 'draft'
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'cancelled'
  | 'withdrawn';

export type DayPart = 'full_day' | 'first_half' | 'second_half';

export interface LeaveType {
  id: string;
  code: string;
  name: string;
  category: string;
  paid: boolean;
  statutory: boolean;
  allowHalfDay: boolean;
  allowHourly: boolean;
  active: boolean;
}

export interface LeaveEntitlement {
  id: string;
  employeeId: string;
  leaveTypeId: string;
  leaveYear: number;
  openingBalance: number;
  allocated: number;
  accrued: number;
  carriedForward: number;
  consumed: number;
  reserved: number;
  encashed: number;
  expired: number;
  adjusted: number;
  currentBalance: number;
  calculatedAt: string;
  employee?: Employee;
  leaveType?: LeaveType;
}

export interface LeaveRequestDay {
  id: string;
  leaveRequestId: string;
  leaveDate: string;
  quantity: number;
  dayPart: DayPart;
  paid: boolean;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  leaveTypeId: string;
  startsAt: string;
  endsAt: string;
  requestedQuantity: number;
  reason?: string | null;
  status: LeaveRequestStatus;
  requestedAt?: string | null;
  cancelledAt?: string | null;
  createdAt: string;
  employee?: Employee;
  leaveType?: LeaveType;
  days?: LeaveRequestDay[];
}

export interface LeaveBalanceLedger {
  id: string;
  employeeId: string;
  leaveTypeId: string;
  entitlementId?: string | null;
  entryType: string;
  quantity: number;
  balanceAfter: number;
  effectiveDate: string;
  description?: string | null;
  createdAt: string;
  employee?: Employee;
  leaveType?: LeaveType;
}
