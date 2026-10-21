import { useState } from 'react';
import { useUsers, useRoles, useRevokeUserRole } from '../../auth/data/auth-data';
import { User, UserRoleAssignment } from '../../auth/types/auth';
import { UserModal } from '../components/user-modal';
import { RoleAssignmentModal } from '../components/role-assignment-modal';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table';
import { StatusBadge } from '../../../components/shared/status-badge';
import { EmptyState } from '../../../components/shared/empty-state';
import { LoadingState } from '../../../components/shared/loading-state';
import { Search, Users, ShieldCheck, UserPlus, Trash2 } from 'lucide-react';

export function UsersTab() {
  const [search, setSearch] = useState('');
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const { data: rolesRes } = useRoles();
  const roles = rolesRes || [];

  const { data: response, isLoading, isError } = useUsers({
    search: search ? search : undefined,
  });

  const revokeRoleMutation = useRevokeUserRole();

  const users = response?.data || [];

  const handleOpenAssign = (user: User) => {
    setSelectedUser(user);
    setIsAssignModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Control Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-mute" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users by email or username..."
            className="pl-9"
          />
        </div>

        <Button
          variant="primary-pill"
          size="sm"
          onClick={() => setIsUserModalOpen(true)}
          className="w-full sm:w-auto inline-flex items-center gap-2"
        >
          <UserPlus className="h-4 w-4" />
          <span>Create User</span>
        </Button>
      </div>

      {/* Users Table */}
      {isLoading ? (
        <LoadingState message="Loading system users..." />
      ) : isError ? (
        <div className="rounded-none border border-semantic-error/30 bg-semantic-error/5 p-6 text-center text-sm text-semantic-error">
          Failed to load users.
        </div>
      ) : users.length === 0 ? (
        <EmptyState
          title="No Users Found"
          description="Create system accounts to grant employees access to the HRMS portal."
          actionLabel="Create User"
          onAction={() => setIsUserModalOpen(true)}
          icon={Users}
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email / Username</TableHead>
              <TableHead>Account Status</TableHead>
              <TableHead>Assigned Roles & Scopes</TableHead>
              <TableHead>Locale / Timezone</TableHead>
              <TableHead>Last Login</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user: User) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="font-semibold text-ink">{user.email}</div>
                  {user.username && <span className="text-xs text-ink-mute">@{user.username}</span>}
                </TableCell>
                <TableCell>
                  <StatusBadge status={user.status} />
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1.5 items-center">
                    {user.roleAssignments && user.roleAssignments.length > 0 ? (
                      user.roleAssignments.map((ra: UserRoleAssignment) => (
                        <span
                          key={ra.id}
                          className="inline-flex items-center gap-1 rounded-none bg-canvas-soft px-2 py-0.5 text-xs font-semibold text-primary"
                        >
                          <span>{ra.role?.name || ra.role?.code || 'Role'}</span>
                          <span className="text-[10px] text-ink-mute font-normal">({ra.scopeType})</span>
                          {ra.role?.code !== 'SUPER_ADMIN' && (
                            <button
                              type="button"
                              onClick={() => revokeRoleMutation.mutate(ra.id)}
                              className="text-ink-mute hover:text-semantic-error ml-0.5 cursor-pointer"
                              title="Revoke Role"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          )}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-ink-mute">No roles assigned</span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-xs text-ink-mute">
                  {user.locale} · {user.timezone}
                </TableCell>
                <TableCell className="text-xs text-ink-mute">
                  {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : 'Never'}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOpenAssign(user)}
                    className="inline-flex items-center gap-1.5 text-xs text-primary hover:text-primary font-semibold"
                  >
                    <ShieldCheck className="h-3.5 w-3.5" />
                    <span>Assign Role</span>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <UserModal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        roles={roles}
      />

      <RoleAssignmentModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        user={selectedUser}
        roles={roles}
      />
    </div>
  );
}

