import { useActiveSessions, useRevokeSession } from '../../auth/api/auth-api';
import { UserSession } from '../../auth/types/auth';
import { Button } from '../../../components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table';
import { EmptyState } from '../../../components/shared/empty-state';
import { LoadingState } from '../../../components/shared/loading-state';
import { ShieldAlert, Laptop, Globe, Ban } from 'lucide-react';

export function SessionsTab() {
  const { data: sessions = [], isLoading, isError } = useActiveSessions();
  const revokeMutation = useRevokeSession();

  const handleRevoke = (sessionId: string) => {
    revokeMutation.mutate(sessionId);
  };

  return (
    <div className="space-y-6">
      {/* Control Bar */}
      <div>
        <h3 className="text-base font-bold text-ink">Active Sessions & Security Governance</h3>
        <p className="text-xs text-ink-mute">
          Audit live user sessions, client device fingerprints, and revoke compromised logins.
        </p>
      </div>

      {/* Sessions Table */}
      {isLoading ? (
        <LoadingState message="Auditing active sessions..." />
      ) : isError ? (
        <div className="rounded-none border border-semantic-error/30 bg-semantic-error/5 p-6 text-center text-sm text-semantic-error">
          Failed to load active sessions.
        </div>
      ) : sessions.length === 0 ? (
        <EmptyState
          title="No Active Sessions"
          description="There are currently no active authenticated user sessions."
          icon={ShieldAlert}
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User Account</TableHead>
              <TableHead>IP Address</TableHead>
              <TableHead>Client & Device</TableHead>
              <TableHead>Logged In Since</TableHead>
              <TableHead>Session Expiry</TableHead>
              <TableHead className="text-right">Revocation</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sessions.map((session: UserSession) => (
              <TableRow key={session.id}>
                <TableCell>
                  <div className="font-semibold text-ink">{session.user?.email || session.userId}</div>
                </TableCell>
                <TableCell className="font-mono text-xs text-ink">
                  <div className="inline-flex items-center gap-1.5">
                    <Globe className="h-3.5 w-3.5 text-ink-mute" />
                    <span>{session.ipAddress || '127.0.0.1'}</span>
                  </div>
                </TableCell>
                <TableCell className="text-xs text-ink-mute max-w-xs truncate">
                  <div className="inline-flex items-center gap-1.5">
                    <Laptop className="h-3.5 w-3.5 text-ink-mute" />
                    <span className="truncate">{session.userAgent || 'Web Browser'}</span>
                  </div>
                </TableCell>
                <TableCell className="text-xs text-ink-mute">
                  {new Date(session.createdAt).toLocaleString()}
                </TableCell>
                <TableCell className="text-xs text-ink-mute">
                  {new Date(session.expiresAt).toLocaleString()}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRevoke(session.id)}
                    isLoading={revokeMutation.isPending}
                    className="inline-flex items-center gap-1.5 text-xs text-semantic-error hover:bg-semantic-error/10 hover:text-semantic-error font-semibold"
                  >
                    <Ban className="h-3.5 w-3.5" />
                    <span>Revoke Session</span>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
