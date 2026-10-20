export type UserStatus = 'invited' | 'active' | 'locked' | 'disabled';
export type SensitivityLevel = 'normal' | 'sensitive' | 'highly_sensitive' | 'privileged';
export type ScopeType = 'self' | 'team' | 'department' | 'branch' | 'legal_entity' | 'organization' | 'custom';

export interface UserSummary {
  id: string;
  email: string;
  username?: string | null;
  employeeId?: string | null;
  status: UserStatus;
  locale: string;
  timezone: string;
}

export interface ScopeSummary {
  roleCode: string;
  scopeType: ScopeType;
  scopeId?: string | null;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: UserSummary;
  roles: string[];
  permissions: string[];
  scopes: ScopeSummary[];
}

export interface Permission {
  id: string;
  code: string;
  resource: string;
  action: string;
  description?: string | null;
  sensitivity: SensitivityLevel;
  requiresMfa: boolean;
  requiresReason: boolean;
}

export interface RolePermission {
  id: string;
  roleId: string;
  permissionId: string;
  effect: string;
  permission?: Permission;
}

export interface Role {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  isSystemRole: boolean;
  sensitivity: SensitivityLevel;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  rolePermissions?: RolePermission[];
}

export interface UserRoleAssignment {
  id: string;
  userId: string;
  roleId: string;
  scopeType: ScopeType;
  scopeId?: string | null;
  effectiveFrom: string;
  effectiveTo?: string | null;
  reason?: string | null;
  role?: Role;
}

export interface User {
  id: string;
  employeeId?: string | null;
  email: string;
  username?: string | null;
  status: UserStatus;
  locale: string;
  timezone: string;
  lastLoginAt?: string | null;
  failedLoginCount: number;
  lockoutUntil?: string | null;
  createdAt: string;
  updatedAt: string;
  roleAssignments?: UserRoleAssignment[];
}

export interface UserSession {
  id: string;
  userId: string;
  ipAddress?: string | null;
  userAgent?: string | null;
  deviceFingerprint?: string | null;
  createdAt: string;
  lastSeenAt: string;
  expiresAt: string;
  revokedAt?: string | null;
  revokeReason?: string | null;
  user?: User;
}
