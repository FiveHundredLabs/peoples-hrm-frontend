import {
  SelectRoot as Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import { useState } from 'react';
import { useDepartments, useLegalEntities, useBranches } from '../api/organization-api';
import { Department } from '../types/organization';
import { DepartmentModal } from '../components/department-modal';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table';
import { StatusBadge } from '../../../components/shared/status-badge';
import { EmptyState } from '../../../components/shared/empty-state';
import { LoadingState } from '../../../components/shared/loading-state';
import { Plus, Search, Layers, Edit2, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useDeleteDepartment } from '../api/organization-api';
import { DeleteConfirmDialog } from '../../../components/shared/delete-confirm-dialog';

export function DepartmentsTab() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [selectedEntityId, setSelectedEntityId] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDept, setSelectedDept] = useState<Department | null>(null);
  const [deptToDelete, setDeptToDelete] = useState<Department | null>(null);
  const deleteMutation = useDeleteDepartment();

  const { data: legalEntitiesRes } = useLegalEntities({ pageSize: 100 });
  const legalEntities = legalEntitiesRes?.data || [];

  const { data: branchesRes } = useBranches({ pageSize: 100 });
  const branches = branchesRes?.data || [];

  const { data: response, isLoading, isError } = useDepartments({
    page,
    pageSize: 10,
    legalEntityId: selectedEntityId || undefined,
    search: search ? search : undefined,
  });

  const departments = response?.data || [];
  const meta = response?.meta;

  const handleOpenAdd = () => {
    setSelectedDept(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (dept: Department) => {
    setSelectedDept(dept);
    setIsModalOpen(true);
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
              placeholder="Search departments..."
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
          <span>Add Department</span>
        </Button>
      </div>

      {/* Table Content */}
      {isLoading ? (
        <LoadingState message="Loading departments..." />
      ) : isError ? (
        <div className="rounded-none border border-semantic-error/30 bg-semantic-error/5 p-6 text-center text-sm text-semantic-error">
          Failed to load departments.
        </div>
      ) : departments.length === 0 ? (
        <EmptyState
          title="No Departments Found"
          description={search ? 'No departments match your search.' : 'Create departments to structure your team hierarchy.'}
          actionLabel="Add Department"
          onAction={handleOpenAdd}
          icon={Layers}
        />
      ) : (
        <div className="space-y-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Department Name</TableHead>
                <TableHead>Legal Entity</TableHead>
                <TableHead>Branch</TableHead>
                <TableHead>Teams Count</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {departments.map((dept) => (
                <TableRow key={dept.id}>
                  <TableCell className="font-mono font-bold text-primary">{dept.code}</TableCell>
                  <TableCell>
                    <div className="font-semibold text-ink">{dept.name}</div>
                    {dept.description && <span className="text-xs text-ink-mute line-clamp-1">{dept.description}</span>}
                  </TableCell>
                  <TableCell className="text-sm text-ink">{dept.legalEntity?.displayName || '—'}</TableCell>
                  <TableCell className="text-sm text-ink-mute">{dept.branch?.name || 'All Branches'}</TableCell>
                  <TableCell className="text-xs font-semibold text-ink">
                    <span className="rounded-none bg-canvas-soft px-2 py-0.5">
                      {dept.teams?.length || 0} teams
                    </span>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={dept.active ? 'active' : 'inactive'} />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="inline-flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenEdit(dept)}
                        className="inline-flex items-center gap-1.5 text-xs text-ink-mute hover:text-ink h-7"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                        <span>Edit</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeptToDelete(dept)}
                        className="inline-flex items-center text-xs text-[#dc2626] hover:bg-[#dc2626]/10 h-7 w-7 p-0"
                        title="Delete Department"
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
                Showing Page {meta.page} of {meta.totalPages} ({meta.total} total departments)
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

      {deptToDelete && (
        <DeleteConfirmDialog
          isOpen={!!deptToDelete}
          onClose={() => setDeptToDelete(null)}
          onConfirm={async () => {
            if (deptToDelete) {
              await deleteMutation.mutateAsync(deptToDelete.id);
              setDeptToDelete(null);
            }
          }}
          title={`Delete Department "${deptToDelete.name}"?`}
          description="Are you sure you want to soft-delete this department?"
          confirmLabel="Delete Department"
          isLoading={deleteMutation.isPending}
        />
      )}

      <DepartmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        legalEntities={legalEntities}
        branches={branches}
        departmentToEdit={selectedDept}
        defaultLegalEntityId={selectedEntityId}
      />
    </div>
  );
}
