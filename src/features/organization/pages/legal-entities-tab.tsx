import { useState } from 'react';
import { useLegalEntities } from '../data/organization-data';
import { LegalEntity } from '../types/organization';
import { LegalEntityModal } from '../components/legal-entity-modal';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table';
import { StatusBadge } from '../../../components/shared/status-badge';
import { EmptyState } from '../../../components/shared/empty-state';
import { LoadingState } from '../../../components/shared/loading-state';
import { Plus, Search, Building2, Edit2, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useDeleteLegalEntity } from '../data/organization-data';
import { DeleteConfirmDialog } from '../../../components/shared/delete-confirm-dialog';

export function LegalEntitiesTab() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState<LegalEntity | null>(null);
  const [entityToDelete, setEntityToDelete] = useState<LegalEntity | null>(null);
  const deleteMutation = useDeleteLegalEntity();

  const { data: response, isLoading, isError } = useLegalEntities({
    page,
    pageSize: 10,
    search: search ? search : undefined,
  });

  const legalEntities = response?.data || [];
  const meta = response?.meta;

  const handleOpenAdd = () => {
    setSelectedEntity(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (entity: LegalEntity) => {
    setSelectedEntity(entity);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Control Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-mute" />
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by code or name..."
            className="pl-9"
          />
        </div>

        <Button
          variant="primary-pill"
          size="sm"
          onClick={handleOpenAdd}
          className="w-full sm:w-auto inline-flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          <span>Add Legal Entity</span>
        </Button>
      </div>

      {/* Content Table / States */}
      {isLoading ? (
        <LoadingState message="Loading legal entities..." />
      ) : isError ? (
        <div className="rounded-none border border-semantic-error/30 bg-semantic-error/5 p-6 text-center text-sm text-semantic-error">
          Failed to load legal entities. Please check backend connection.
        </div>
      ) : legalEntities.length === 0 ? (
        <EmptyState
          title="No Legal Entities Found"
          description={search ? 'No entities matched your search criteria.' : 'Create your primary business entity to get started.'}
          actionLabel="Add Legal Entity"
          onAction={handleOpenAdd}
          icon={Building2}
        />
      ) : (
        <div className="space-y-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Display Name</TableHead>
                <TableHead>Registered Legal Name</TableHead>
                <TableHead>Reg. / TIN</TableHead>
                <TableHead>EPF / ETF No.</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {legalEntities.map((entity) => (
                <TableRow key={entity.id}>
                  <TableCell className="font-mono font-bold text-primary">{entity.code}</TableCell>
                  <TableCell className="font-semibold text-ink">{entity.displayName}</TableCell>
                  <TableCell className="text-sm text-ink-mute">{entity.legalName}</TableCell>
                  <TableCell className="text-xs text-ink-mute">
                    {entity.registrationNumber ? `Reg: ${entity.registrationNumber}` : '—'}
                    {entity.taxIdentificationNumber && <div className="text-[11px]">TIN: {entity.taxIdentificationNumber}</div>}
                  </TableCell>
                  <TableCell className="text-xs text-ink-mute">
                    {entity.epfEmployerNumber ? `EPF: ${entity.epfEmployerNumber}` : '—'}
                    {entity.etfEmployerNumber && <div className="text-[11px]">ETF: {entity.etfEmployerNumber}</div>}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={entity.active ? 'active' : 'inactive'} />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="inline-flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenEdit(entity)}
                        className="inline-flex items-center gap-1.5 text-xs text-ink-mute hover:text-ink h-7"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                        <span>Edit</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEntityToDelete(entity)}
                        className="inline-flex items-center text-xs text-[#dc2626] hover:bg-[#dc2626]/10 h-7 w-7 p-0"
                        title="Delete Legal Entity"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination Bar */}
          {meta && meta.totalPages > 1 && (
            <div className="flex items-center justify-between px-2 pt-2">
              <span className="text-xs text-ink-mute">
                Showing Page {meta.page} of {meta.totalPages} ({meta.total} total entities)
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

      {/* Modal Form */}
      {entityToDelete && (
        <DeleteConfirmDialog
          isOpen={!!entityToDelete}
          onClose={() => setEntityToDelete(null)}
          onConfirm={async () => {
            if (entityToDelete) {
              await deleteMutation.mutateAsync(entityToDelete.id);
              setEntityToDelete(null);
            }
          }}
          title={`Delete Legal Entity "${entityToDelete.displayName}"?`}
          description="Are you sure you want to soft-delete this legal entity? Its configuration and records will be preserved in audit history."
          confirmLabel="Delete Entity"
          isLoading={deleteMutation.isPending}
        />
      )}

      <LegalEntityModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        entityToEdit={selectedEntity}
      />
    </div>
  );
}
