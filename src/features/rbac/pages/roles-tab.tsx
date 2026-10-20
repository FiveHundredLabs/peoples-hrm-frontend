import { useState } from 'react';
import { useRoles, usePermissions } from '../../auth/api/auth-api';
import { Role, Permission, RolePermission } from '../../auth/types/auth';
import { RoleModal } from '../components/role-modal';
import { Button } from '../../../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { LoadingState } from '../../../components/shared/loading-state';
import { Plus, KeyRound } from 'lucide-react';

export function RolesTab() {
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);

  const { data: roles = [], isLoading: isRolesLoading } = useRoles();
  const { data: permissions = [], isLoading: isPermsLoading } = usePermissions();

  const isLoading = isRolesLoading || isPermsLoading;

  return (
    <div className="space-y-6">
      {/* Control Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-ink">Role Catalog & Privilege Sets</h3>
          <p className="text-xs text-ink-mute">
            Configure role definitions, sensitivity levels, and granted permissions.
          </p>
        </div>

        <Button
          variant="primary-pill"
          size="sm"
          onClick={() => setIsRoleModalOpen(true)}
          className="inline-flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          <span>Create Role</span>
        </Button>
      </div>

      {/* Role Grid */}
      {isLoading ? (
        <LoadingState message="Loading roles and permissions..." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {roles.map((role: Role) => (
            <Card key={role.id} className="border border-hairline hover: transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-mono text-xs font-bold text-primary">{role.code}</div>
                    <CardTitle className="text-base font-bold text-ink mt-0.5">{role.name}</CardTitle>
                  </div>
                  {role.isSystemRole ? (
                    <Badge variant="secondary">System Role</Badge>
                  ) : (
                    <Badge variant="outline">Custom</Badge>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                {role.description && (
                  <p className="text-xs text-ink-mute line-clamp-2">{role.description}</p>
                )}

                <div className="pt-2 border-t border-hairline">
                  <div className="flex items-center justify-between text-xs font-bold text-ink uppercase tracking-wider mb-2">
                    <span className="inline-flex items-center gap-1.5">
                      <KeyRound className="h-3.5 w-3.5 text-primary" />
                      <span>Permissions</span>
                    </span>
                    <span className="text-ink-mute font-normal">
                      {role.rolePermissions?.length || 0} granted
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
                    {role.code === 'SUPER_ADMIN' ? (
                      <span className="rounded bg-accent/20 px-2 py-0.5 text-xs font-semibold text-primary">
                        ⭐ Full System Authorization (*:*)
                      </span>
                    ) : role.rolePermissions && role.rolePermissions.length > 0 ? (
                      role.rolePermissions.map((rp: RolePermission) => (
                        <span
                          key={rp.id}
                          className="rounded bg-canvas-soft px-1.5 py-0.5 text-[11px] font-mono text-primary"
                        >
                          {rp.permission?.code || 'perm'}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-ink-mute">No permissions assigned</span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <RoleModal
        isOpen={isRoleModalOpen}
        onClose={() => setIsRoleModalOpen(false)}
        permissions={permissions as Permission[]}
      />
    </div>
  );
}
