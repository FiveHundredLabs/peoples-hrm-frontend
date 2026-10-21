import {
  SelectRoot as Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import React, { useState } from 'react';
import { getMockFileUrl } from '../../../mocks/store';
import { Link } from 'react-router-dom';
import {
  Users,
  UserCheck,
  Clock,
  UserX,
  Search,
  Plus,
  Shield,
  Mail,
  Edit2,
  Trash2,
  Eye,
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { useEmployees, useDeleteEmployee } from '../data/employee-data';
import { useDepartments, useLegalEntities } from '../../organization/data/organization-data';
import { EmploymentStatus, Employee } from '../types/employee';
import { EmployeeCreateDialog } from '../components/employee-create-dialog';
import { EmployeeEditDialog } from '../components/employee-edit-dialog';
import { DeleteConfirmDialog } from '../../../components/shared/delete-confirm-dialog';

export const EmployeeListPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<EmploymentStatus | undefined>(undefined);
  const [selectedDepartment, setSelectedDepartment] = useState<string | undefined>(undefined);
  const [selectedLegalEntity, setSelectedLegalEntity] = useState<string | undefined>(undefined);
  const [page, setPage] = useState(1);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedEmployeeForEdit, setSelectedEmployeeForEdit] = useState<Employee | null>(null);
  const [selectedEmployeeForDelete, setSelectedEmployeeForDelete] = useState<Employee | null>(null);

  const { data: employeesData, isLoading, isError, refetch } = useEmployees({
    page,
    limit: 15,
    search: searchTerm || undefined,
    status: selectedStatus,
    departmentId: selectedDepartment || undefined,
    legalEntityId: selectedLegalEntity || undefined,
  });

  const { data: departmentsData } = useDepartments();
  const { data: legalEntitiesData } = useLegalEntities();
  const deleteEmployeeMutation = useDeleteEmployee();

  const departments = departmentsData?.data || [];
  const legalEntities = legalEntitiesData?.data || [];

  const employees = employeesData?.data || [];
  const meta = employeesData?.meta;

  const totalCount = meta?.total || employees.length;
  const activeCount = employees.filter((e) => e.lifecycleStatus === 'confirmed').length;
  const probationCount = employees.filter((e) => e.lifecycleStatus === 'probation').length;
  const terminatedCount = employees.filter((e) => e.lifecycleStatus === 'terminated' || e.lifecycleStatus === 'retired').length;

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-semantic-success/10 text-semantic-success border-semantic-success/20';
      case 'probation':
        return 'bg-semantic-warning/10 text-semantic-warning border-semantic-warning/20';
      case 'terminated':
      case 'retired':
        return 'bg-neutral-gray/10 text-neutral-gray border-neutral-gray/20';
      default:
        return 'bg-primary/10 text-primary border-primary/20';
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  const handleDeleteConfirm = async () => {
    if (!selectedEmployeeForDelete) return;
    try {
      await deleteEmployeeMutation.mutateAsync(selectedEmployeeForDelete.id);
      setSelectedEmployeeForDelete(null);
      refetch();
    } catch (err) {
      console.error('Failed to delete employee', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">
            Employee Directory
          </h1>
          <p className="text-sm text-ink-mute">
            Manage your Sri Lankan workforce, EPF/ETF statutory profiles, and career assignments.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="primary-pill"
            size="sm"
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-1.5"
          >
            <Plus className="h-4 w-4" />
            <span>Onboard Employee</span>
          </Button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="border border-hairline bg-canvas p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-ink-mute">
              Total Workforce
            </span>
            <Users className="h-4 w-4 text-primary" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-ink">{totalCount}</span>
            <span className="text-xs text-ink-mute">Enrolled profiles</span>
          </div>
        </div>

        <div className="border border-hairline bg-canvas p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-ink-mute">
              Confirmed Staff
            </span>
            <UserCheck className="h-4 w-4 text-semantic-success" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-ink">{activeCount}</span>
            <span className="text-xs text-semantic-success">Permanent contracts</span>
          </div>
        </div>

        <div className="border border-hairline bg-canvas p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-ink-mute">
              On Probation
            </span>
            <Clock className="h-4 w-4 text-semantic-warning" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-ink">{probationCount}</span>
            <span className="text-xs text-semantic-warning">Evaluation period</span>
          </div>
        </div>

        <div className="border border-hairline bg-canvas p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-ink-mute">
              Offboarded / Left
            </span>
            <UserX className="h-4 w-4 text-ink-mute" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-ink">{terminatedCount}</span>
            <span className="text-xs text-ink-mute">Past records</span>
          </div>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex flex-col gap-3 rounded-none border border-hairline bg-canvas p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-mute" />
          <Input
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            placeholder="Search by name, employee #, NIC last 4, or email..."
            className="pl-9 text-xs"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Department Filter */}
          <Select
            value={selectedDepartment || 'all'}
            onValueChange={(val) => {
              setSelectedDepartment(val === 'all' ? undefined : val);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-[160px] text-xs">
              <SelectValue placeholder="All Departments" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {departments.map((dept) => (
                <SelectItem key={dept.id} value={dept.id}>
                  {dept.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Legal Entity Filter */}
          <Select
            value={selectedLegalEntity || 'all'}
            onValueChange={(val) => {
              setSelectedLegalEntity(val === 'all' ? undefined : val);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-[160px] text-xs">
              <SelectValue placeholder="All Entities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Legal Entities</SelectItem>
              {legalEntities.map((entity) => (
                <SelectItem key={entity.id} value={entity.id}>
                  {entity.displayName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Status Filter */}
          <Select
            value={selectedStatus || 'all'}
            onValueChange={(val) => {
              setSelectedStatus(val === 'all' ? undefined : (val as EmploymentStatus));
              setPage(1);
            }}
          >
            <SelectTrigger className="w-[140px] text-xs">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="probation">Probation</SelectItem>
              <SelectItem value="internship">Internship</SelectItem>
              <SelectItem value="contract">Contract</SelectItem>
              <SelectItem value="notice_period">Notice Period</SelectItem>
              <SelectItem value="terminated">Terminated</SelectItem>
              <SelectItem value="resigned">Resigned</SelectItem>
              <SelectItem value="retired">Retired</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Employee Data Grid */}
      <div className="border border-hairline bg-canvas">
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-6 w-6 animate-spin border-2 border-primary border-t-transparent" />
          </div>
        ) : isError ? (
          <div className="p-8 text-center text-xs text-semantic-error">
            Failed to load workforce directory. Please try again.
          </div>
        ) : employees.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="mx-auto h-8 w-8 text-ink-mute" />
            <h3 className="mt-2 text-sm font-semibold text-ink">No employees found</h3>
            <p className="mt-1 text-xs text-ink-mute">
              {searchTerm
                ? 'Try adjusting your search filters.'
                : 'Get started by onboarding your first company employee.'}
            </p>
            {!searchTerm && (
              <Button
                variant="primary-pill"
                size="sm"
                onClick={() => setIsCreateOpen(true)}
                className="mt-4"
              >
                Onboard Employee
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-hairline bg-canvas-soft/50 text-[11px] font-medium uppercase tracking-wider text-ink-mute">
                <tr>
                  <th className="py-3 pl-4 pr-3">Employee</th>
                  <th className="px-3 py-3">Employee No</th>
                  <th className="px-3 py-3">Department & Role</th>
                  <th className="px-3 py-3">Sri Lankan NIC</th>
                  <th className="px-3 py-3">Status</th>
                  <th className="px-3 py-3">Hire Date</th>
                  <th className="py-3 pl-3 pr-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {employees.map((emp) => {
                  const primaryAssignment = emp.assignments?.find((a) => a.assignmentType === 'primary') || emp.assignments?.[0];
                  const avatarFileId = emp.profileFileId || (emp as any).profileFile?.id;
                  return (
                    <tr key={emp.id} className="hover:bg-canvas-soft/30 transition-colors">
                      <td className="py-3 pl-4 pr-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-none bg-[#1c69d4]/10 text-xs font-bold text-[#1c69d4] overflow-hidden">
                            {avatarFileId ? (
                              <img
                                src={getMockFileUrl(avatarFileId)}
                                alt={emp.displayName}
                                className="h-full w-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLElement).style.display = 'none';
                                  if ((e.target as HTMLElement).parentElement) {
                                    (e.target as HTMLElement).parentElement!.innerText = getInitials(emp.displayName);
                                  }
                                }}
                              />
                            ) : (
                              getInitials(emp.displayName)
                            )}
                          </div>
                          <div>
                            <Link
                              to={`/employees/${emp.id}`}
                              className="font-semibold text-ink hover:text-primary hover:underline"
                            >
                              {emp.displayName}
                            </Link>
                            <div className="flex items-center gap-1.5 text-[11px] text-ink-mute">
                              {emp.companyEmail && (
                                <span className="flex items-center gap-0.5">
                                  <Mail className="h-3 w-3" /> {emp.companyEmail}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-3 py-3 font-mono text-xs font-medium text-ink">
                        {emp.employeeNumber}
                      </td>

                      <td className="px-3 py-3">
                        <div className="font-medium text-ink">
                          {primaryAssignment?.title || 'Team Member'}
                        </div>
                        <div className="text-[11px] text-ink-mute">
                          {primaryAssignment?.department?.name || 'Unassigned'}
                        </div>
                      </td>

                      <td className="px-3 py-3">
                        {emp.personalDetails?.nationalIdLast4 ? (
                          <span className="inline-flex items-center gap-1 rounded bg-canvas-soft px-1.5 py-0.5 font-mono text-[11px] text-ink">
                            <Shield className="h-3 w-3 text-primary" />
                            ••••••{emp.personalDetails.nationalIdLast4}
                          </span>
                        ) : (
                          <span className="text-ink-mute">—</span>
                        )}
                      </td>

                      <td className="px-3 py-3">
                        <span
                          className={`inline-flex items-center rounded-none border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${getStatusBadgeClass(
                            emp.lifecycleStatus,
                          )}`}
                        >
                          {emp.lifecycleStatus}
                        </span>
                      </td>

                      <td className="px-3 py-3 text-ink-mute">
                        {emp.hireDate || '—'}
                      </td>

                      <td className="py-3 pl-3 pr-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedEmployeeForEdit(emp)}
                            className="h-7 w-7 p-0 text-ink-mute hover:text-ink"
                            title="Edit Employee Profile"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </Button>
                          <Link to={`/employees/${emp.id}`}>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0 text-primary hover:text-primary"
                              title="View Full Dossier"
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedEmployeeForDelete(emp)}
                            className="h-7 w-7 p-0 text-[#dc2626] hover:bg-[#dc2626]/10"
                            title="Archive Employee"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {meta && meta.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-hairline px-4 py-3 text-xs">
            <span className="text-ink-mute">
              Showing Page {meta.page} of {meta.totalPages} ({meta.total} records)
            </span>
            <div className="flex gap-1">
              <Button
                variant="outline-aubergine"
                size="sm"
                disabled={!meta.hasPreviousPage}
                onClick={() => setPage((p) => p - 1)}
                className="h-7 text-xs"
              >
                Previous
              </Button>
              <Button
                variant="outline-aubergine"
                size="sm"
                disabled={!meta.hasNextPage}
                onClick={() => setPage((p) => p + 1)}
                className="h-7 text-xs"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Onboarding Dialog */}
      <EmployeeCreateDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />

      {/* Edit Employee Dialog */}
      {selectedEmployeeForEdit && (
        <EmployeeEditDialog
          isOpen={!!selectedEmployeeForEdit}
          onClose={() => setSelectedEmployeeForEdit(null)}
          employee={selectedEmployeeForEdit}
          onSuccess={() => refetch()}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {selectedEmployeeForDelete && (
        <DeleteConfirmDialog
          isOpen={!!selectedEmployeeForDelete}
          onClose={() => setSelectedEmployeeForDelete(null)}
          onConfirm={handleDeleteConfirm}
          title={`Archive & Soft-Delete Employee ${selectedEmployeeForDelete.displayName}?`}
          description="Are you sure you want to soft-delete this employee? They will be removed from the active workforce directory."
          confirmLabel="Archive Employee"
          isLoading={deleteEmployeeMutation.isPending}
        />
      )}
    </div>
  );
};
