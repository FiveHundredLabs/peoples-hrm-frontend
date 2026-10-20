import {
  SelectRoot as Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import { useState } from 'react';
import { usePositions, useLegalEntities, useDepartments } from '../api/organization-api';
import { Position } from '../types/organization';
import { PositionModal } from '../components/position-modal';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table';
import { StatusBadge } from '../../../components/shared/status-badge';
import { EmptyState } from '../../../components/shared/empty-state';
import { LoadingState } from '../../../components/shared/loading-state';
import { Plus, Search, Briefcase, ChevronLeft, ChevronRight } from 'lucide-react';

export function PositionsTab() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [selectedEntityId, setSelectedEntityId] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [positionToEdit, setPositionToEdit] = useState<Position | null>(null);

  const { data: legalEntitiesRes } = useLegalEntities({ pageSize: 100 });
  const legalEntities = legalEntitiesRes?.data || [];

  const { data: departmentsRes } = useDepartments({ pageSize: 100 });
  const departments = departmentsRes?.data || [];

  const { data: response, isLoading, isError } = usePositions({
    page,
    pageSize: 10,
    legalEntityId: selectedEntityId || undefined,
    search: search ? search : undefined,
  });

  const positions = response?.data || [];
  const meta = response?.meta;

  return (
    <div className="space-y-6">
      {/* Control Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-1 flex-col sm:flex-row items-center gap-3 w-full">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-mute" />
            <Input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search positions or titles..."
              className="pl-9"
            />
          </div>

          {/* Legal Entity Filter */}
          <div className="w-full sm:w-60">
            <Select
              value={selectedEntityId || 'ALL'}
              onValueChange={(val) => {
                setSelectedEntityId(val === 'ALL' ? '' : val);
                setPage(1);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Legal Entities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Legal Entities</SelectItem>
                {legalEntities.map((le) => (
                  <SelectItem key={le.id} value={le.id}>
                    {le.displayName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => { setPositionToEdit(null); setIsModalOpen(true); }}
          className="w-full sm:w-auto inline-flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          <span>Add Position</span>
        </Button>
      </div>

      {/* Table Content */}
      {isLoading ? (
        <LoadingState message="Loading positions..." />
      ) : isError ? (
        <div className="rounded-none border border-semantic-error/30 bg-semantic-error/5 p-6 text-center text-sm text-semantic-error">
          Failed to load positions.
        </div>
      ) : positions.length === 0 ? (
        <EmptyState
          title="No Positions Found"
          description={search ? 'No positions match your search.' : 'Create position templates to assign employees.'}
          actionLabel="Add Position"
          onAction={() => setIsModalOpen(true)}
          icon={Briefcase}
        />
      ) : (
        <div className="space-y-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Position Title</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Headcount & FTE</TableHead>
                <TableHead>Effective Period</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {positions.map((pos) => (
                <TableRow key={pos.id}>
                  <TableCell className="font-mono font-bold text-primary">{pos.code}</TableCell>
                  <TableCell>
                    <div className="font-semibold text-ink">{pos.titleOverride || pos.job?.title || '—'}</div>
                  </TableCell>
                  <TableCell className="text-sm text-ink">{pos.department?.name || 'Corporate'}</TableCell>
                  <TableCell className="text-xs text-ink">
                    <span className="font-bold">{pos.headcountLimit}</span> Headcount · FTE: {pos.fte}
                  </TableCell>
                  <TableCell className="text-xs text-ink-mute">
                    From: {pos.effectiveFrom} {pos.effectiveTo ? `To: ${pos.effectiveTo}` : '(Open-ended)'}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={pos.active ? 'active' : 'inactive'} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination */}
          {meta && meta.totalPages > 1 && (
            <div className="flex items-center justify-between px-2 pt-2">
              <span className="text-xs text-ink-mute">
                Showing Page {meta.page} of {meta.totalPages} ({meta.total} total positions)
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={!meta.hasPreviousPage}
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  className="h-8 px-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={!meta.hasNextPage}
                  onClick={() => setPage((p) => p + 1)}
                  className="h-8 px-2"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      <PositionModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setPositionToEdit(null);
        }}
        legalEntities={legalEntities}
        departments={departments}
        positionToEdit={positionToEdit}
        defaultLegalEntityId={selectedEntityId || legalEntities[0]?.id}
      />
    </div>
  );
}