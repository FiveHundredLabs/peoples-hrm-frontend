import { useState } from 'react';
import { useWorkLocations, useLegalEntities, useBranches } from '../api/organization-api';
import { WorkLocationModal } from '../components/work-location-modal';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table';
import { StatusBadge } from '../../../components/shared/status-badge';
import { EmptyState } from '../../../components/shared/empty-state';
import { LoadingState } from '../../../components/shared/loading-state';
import { Plus, Search, Navigation } from 'lucide-react';

export function WorkLocationsTab() {
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: legalEntitiesRes } = useLegalEntities({ pageSize: 100 });
  const legalEntities = legalEntitiesRes?.data || [];

  const { data: branchesRes } = useBranches({ pageSize: 100 });
  const branches = branchesRes?.data || [];

  const { data: response, isLoading, isError } = useWorkLocations({
    search: search ? search : undefined,
  });

  const locations = response?.data || [];

  return (
    <div className="space-y-6">
      {/* Control Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-mute" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search locations..."
            className="pl-9"
          />
        </div>

        <Button
          variant="primary-pill"
          size="sm"
          onClick={() => setIsModalOpen(true)}
          className="w-full sm:w-auto inline-flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          <span>Add Location</span>
        </Button>
      </div>

      {/* Table Content */}
      {isLoading ? (
        <LoadingState message="Loading work locations..." />
      ) : isError ? (
        <div className="rounded-none border border-semantic-error/30 bg-semantic-error/5 p-6 text-center text-sm text-semantic-error">
          Failed to load work locations.
        </div>
      ) : locations.length === 0 ? (
        <EmptyState
          title="No Work Locations Defined"
          description="Add physical office, warehouse, or factory locations for attendance geo-tagging."
          actionLabel="Add Location"
          onAction={() => setIsModalOpen(true)}
          icon={Navigation}
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Location Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>City / District</TableHead>
              <TableHead>Geofence Radius</TableHead>
              <TableHead>Timezone</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {locations.map((loc) => (
              <TableRow key={loc.id}>
                <TableCell className="font-mono font-bold text-primary">{loc.code}</TableCell>
                <TableCell className="font-semibold text-ink">{loc.name}</TableCell>
                <TableCell className="text-xs text-ink-mute">{loc.locationType || 'Office'}</TableCell>
                <TableCell className="text-sm text-ink-mute">
                  {loc.city ? `${loc.city}, ${loc.district || ''}` : loc.addressLine1 || '—'}
                </TableCell>
                <TableCell className="text-xs font-mono text-ink">
                  {loc.geofenceRadiusM ? `${loc.geofenceRadiusM} meters` : 'Not set'}
                </TableCell>
                <TableCell className="text-xs text-ink-mute">{loc.timezone}</TableCell>
                <TableCell>
                  <StatusBadge status={loc.active ? 'active' : 'inactive'} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <WorkLocationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        legalEntities={legalEntities}
        branches={branches}
      />
    </div>
  );
}
