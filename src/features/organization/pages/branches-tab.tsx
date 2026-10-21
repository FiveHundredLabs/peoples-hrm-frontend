import {
  SelectRoot as Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import { useState } from 'react';
import { useBranches, useLegalEntities } from '../data/organization-data';
import { Branch } from '../types/organization';
import { BranchModal } from '../components/branch-modal';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table';
import { StatusBadge } from '../../../components/shared/status-badge';
import { EmptyState } from '../../../components/shared/empty-state';
import { LoadingState } from '../../../components/shared/loading-state';
import { Plus, Search, MapPin, Edit2, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useDeleteBranch } from '../data/organization-data';
import { DeleteConfirmDialog } from '../../../components/shared/delete-confirm-dialog';

export function BranchesTab() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [selectedEntityId, setSelectedEntityId] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [branchToDelete, setBranchToDelete] = useState<Branch | null>(null);
  const deleteMutation = useDeleteBranch();

  const { data: legalEntitiesRes } = useLegalEntities({ pageSize: 100 });
  const legalEntities = legalEntitiesRes?.data || [];

  const { data: response, isLoading, isError } = useBranches({
    page,
    pageSize: 10,
    search: search || undefined,
    legalEntityId: selectedEntityId || undefined,
  });

  const branches = response?.data || [];
  const meta = response?.meta;

  const handleOpenAdd = () => {
    setSelectedBranch(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (branch: Branch) => {
    setSelectedBranch(branch);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedBranch(null);
  };

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
              placeholder="Search branches..."
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
          onClick={handleOpenAdd}
          className="w-full sm:w-auto inline-flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          <span>Add Branch</span>
        </Button>
      </div>

      {/* Table Content */}
      {isLoading ? (
        <LoadingState message="Loading branches..." />
      ) : isError ? (
        <div className="rounded-none border border-semantic-error/30 bg-semantic-error/5 p-6 text-center text-sm text-semantic-error">
          Failed to load branches.
        </div>
      ) : branches.length === 0 ? (
        <EmptyState
          title="No Branches Found"
          description={search || selectedEntityId ? 'No branches match the selected filters.' : 'Add your first branch office or operational site.'}
          actionLabel="Add Branch"
          onAction={handleOpenAdd}
          icon={MapPin}
        />
      ) : (
        <div className="space-y-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Branch Name</TableHead>
                <TableHead>Legal Entity</TableHead>
                <TableHead>Location / City</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {branches.map((branch) => (
                <TableRow key={branch.id}>
                  <TableCell className="font-mono font-bold text-primary">{branch.code}</TableCell>
                  <TableCell>
                    <div className="font-semibold text-ink">{branch.name}</div>
                    {branch.branchType && <span className="text-xs text-ink-mute">{branch.branchType}</span>}
                  </TableCell>
                  <TableCell className="text-sm text-ink">{branch.legalEntity?.displayName || '—'}</TableCell>
                  <TableCell className="text-sm text-ink-mute">
                    {branch.city ? `${branch.city}, ${branch.district || ''}` : branch.addressLine1 || '—'}
                  </TableCell>
                  <TableCell className="text-xs text-ink-mute">
                    {branch.phone && <div>{branch.phone}</div>}
                    {branch.email && <div>{branch.email}</div>}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={branch.active ? 'active' : 'inactive'} />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="inline-flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenEdit(branch)}
                        className="inline-flex items-center gap-1.5 text-xs text-ink-mute hover:text-ink h-7"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                        <span>Edit</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setBranchToDelete(branch)}
                        className="inline-flex items-center text-xs text-[#dc2626] hover:bg-[#dc2626]/10 h-7 w-7 p-0"
                        title="Delete Branch"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination */}
          {meta && meta.totalPages > 1 && (
            <div className="flex items-center justify-between px-2 pt-2">
              <span className="text-xs text-ink-mute">
                Showing Page {meta.page} of {meta.totalPages} ({meta.total} total branches)
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

      {branchToDelete && (
        <DeleteConfirmDialog
          isOpen={!!branchToDelete}
          onClose={() => setBranchToDelete(null)}
          onConfirm={async () => {
            if (branchToDelete) {
              await deleteMutation.mutateAsync(branchToDelete.id);
              setBranchToDelete(null);
            }
          }}
          title={`Delete Branch "${branchToDelete.name}"?`}
          description="Are you sure you want to soft-delete this branch location?"
          confirmLabel="Delete Branch"
          isLoading={deleteMutation.isPending}
        />
      )}

      <BranchModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        legalEntities={legalEntities}
        branchToEdit={selectedBranch}
        defaultLegalEntityId={selectedEntityId}
      />
    </div>
  );
}
