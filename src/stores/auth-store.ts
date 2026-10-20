import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserSummary, ScopeSummary } from '../features/auth/types/auth';

interface AuthState {
  user: UserSummary | null;
  isAuthenticated: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  roles: string[];
  permissions: string[];
  scopes: ScopeSummary[];
  setAuth: (payload: {
    user: UserSummary;
    accessToken: string;
    refreshToken: string;
    roles: string[];
    permissions: string[];
    scopes: ScopeSummary[];
  }) => void;
  setTokens: (payload: { accessToken: string; refreshToken: string }) => void;
  clearAuth: () => void;
  hasPermission: (perm: string) => boolean;
  hasRole: (role: string) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      accessToken: null,
      refreshToken: null,
      roles: [],
      permissions: [],
      scopes: [],

      setAuth: ({ user, accessToken, refreshToken, roles, permissions, scopes }) =>
        set({
          user,
          isAuthenticated: true,
          accessToken,
          refreshToken,
          roles,
          permissions,
          scopes,
        }),

      setTokens: ({ accessToken, refreshToken }) =>
        set({
          accessToken,
          refreshToken,
          isAuthenticated: true,
        }),

      clearAuth: () =>
        set({
          user: null,
          isAuthenticated: false,
          accessToken: null,
          refreshToken: null,
          roles: [],
          permissions: [],
          scopes: [],
        }),

      hasPermission: (perm: string) => {
        const { roles, permissions } = get();
        if (roles.includes('SUPER_ADMIN') || roles.includes('SYSTEM_ADMIN')) {
          return true;
        }
        return permissions.includes(perm);
      },

      hasRole: (role: string) => {
        return get().roles.includes(role);
      },
    }),
    {
      name: 'sri-lanka-hrms-auth',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        roles: state.roles,
        permissions: state.permissions,
        scopes: state.scopes,
      }),
    },
  ),
);
