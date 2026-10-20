import { Badge } from '../ui/badge';

export interface StatusBadgeProps {
  status: 'active' | 'inactive' | 'pending' | 'approved' | 'rejected' | 'draft' | 'locked' | string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const normalized = status.toLowerCase();

  switch (normalized) {
    case 'active':
    case 'approved':
    case 'completed':
      return <Badge variant="success">{status}</Badge>;
    case 'inactive':
    case 'rejected':
    case 'locked':
    case 'disabled':
      return <Badge variant="destructive">{status}</Badge>;
    case 'pending':
    case 'probation':
    case 'draft':
      return <Badge variant="secondary">{status}</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}
