export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  status: 'invited' | 'active' | 'locked' | 'disabled';
  roles: string[];
  permissions: string[];
  employeeId?: string;
  legalEntityId?: string;
}

export interface AuthSession {
  user: User | null;
  isAuthenticated: boolean;
  accessToken?: string;
}
