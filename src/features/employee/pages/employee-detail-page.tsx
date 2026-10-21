import React, { useState, useEffect } from 'react';
import { getMockFileUrl } from '../../../mocks/store';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  Shield,
  Briefcase,
  CreditCard,
  FileText,
  Calendar,
  AlertCircle,
  RefreshCw,
  Camera,
  UploadCloud,
  Download,
  Eye,
  Plus,
  FileCheck,
  Edit2,
  Trash2,
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Select } from '../../../components/ui/select';
import { Textarea } from '../../../components/ui/textarea';
import {
  useEmployee,
  useUpdateEmployeeStatus,
  useEmployeeDocuments,
  useUploadFile,
  useUploadEmployeePhoto,
  useDeleteEmployee,
  useDeleteDocument,
  useDeleteBankAccount,
} from '../data/employee-data';
import { useMovements } from '../../lifecycle/data/lifecycle-data';
import { EmploymentStatus, EmployeeDocument, EmployeeBankAccount } from '../types/employee';
import { cn } from '../../../lib/utils';
import { ImageCropperModal } from '../../../components/shared/image-cropper-modal';
import { DocumentUploadModal } from '../components/document-upload-modal';
import { EmployeeEditDialog } from '../components/employee-edit-dialog';
import { DocumentEditModal } from '../components/document-edit-modal';
import { BankAccountEditModal } from '../components/bank-account-edit-modal';
import { DeleteConfirmDialog } from '../../../components/shared/delete-confirm-dialog';

export const EmployeeDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'employment' | 'statutory' | 'documents' | 'lifecycle'>('overview');
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<EmploymentStatus>('confirmed');
  const [statusReason, setStatusReason] = useState('');

  // Modals state
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [deleteEmployeeOpen, setDeleteEmployeeOpen] = useState(false);
  const [cropperOpen, setCropperOpen] = useState(false);
  const [docUploadOpen, setDocUploadOpen] = useState(false);
  const [photoUploading, setPhotoUploading] = useState(false);

  // Selected sub-entities for edit/delete
  const [selectedDocForEdit, setSelectedDocForEdit] = useState<EmployeeDocument | null>(null);
  const [selectedDocForDelete, setSelectedDocForDelete] = useState<EmployeeDocument | null>(null);
  const [selectedAccountForEdit, setSelectedAccountForEdit] = useState<EmployeeBankAccount | null>(null);
  const [selectedAccountForDelete, setSelectedAccountForDelete] = useState<EmployeeBankAccount | null>(null);

  const { data: employee, isLoading, isError, refetch } = useEmployee(id);
  const { data: employeeMovements } = useMovements({ employeeId: id });
  const { data: employeeDocs, refetch: refetchDocs } = useEmployeeDocuments(id);

  const [imgError, setImgError] = useState(false);
  const [photoVersion, setPhotoVersion] = useState(Date.now());
  const updateStatusMutation = useUpdateEmployeeStatus();
  const uploadFileMutation = useUploadFile();
  const uploadPhotoMutation = useUploadEmployeePhoto();
  const deleteEmployeeMutation = useDeleteEmployee();
  const deleteDocMutation = useDeleteDocument();
  const deleteBankMutation = useDeleteBankAccount();

  const profileFileId = employee?.profileFileId || (employee as any)?.profileFile?.id;

  useEffect(() => {
    setImgError(false);
  }, [profileFileId, photoVersion]);

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="h-8 w-8 animate-spin border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (isError || !employee) {
    return (
      <div className="border border-hairline bg-canvas p-8 text-center">
        <AlertCircle className="mx-auto h-8 w-8 text-[#dc2626]" />
        <h2 className="mt-2 text-lg font-bold text-ink">Employee Not Found</h2>
        <p className="mt-1 text-xs text-ink-mute">The employee dossier could not be retrieved.</p>
        <Link to="/employees" className="mt-4 inline-block">
          <Button variant="outline" size="sm">
            Back to Directory
          </Button>
        </Link>
      </div>
    );
  }

  const primaryAssignment = employee.assignments?.find((a) => a.assignmentType === 'primary') || employee.assignments?.[0];
  const primaryRecord = employee.employmentRecords?.[0];
  const statutoryProfile = employee.statutoryProfiles?.[0];

  const handleStatusChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    try {
      await updateStatusMutation.mutateAsync({
        employeeId: id,
        data: {
          newStatus,
          effectiveDate: new Date().toISOString().split('T')[0],
          reason: statusReason || undefined,
        },
      });
      setStatusDialogOpen(false);
      refetch();
    } catch (err) {
      console.error('Failed to transition status', err);
    }
  };

  const handleCropComplete = async (croppedFile: File) => {
    if (!id) return;
    setPhotoUploading(true);
    try {
      const uploaded = await uploadFileMutation.mutateAsync(croppedFile);
      await uploadPhotoMutation.mutateAsync({ employeeId: id, fileId: uploaded.id });
      setImgError(false);
      setPhotoVersion(Date.now());
      setCropperOpen(false);
      await refetch();
    } catch (err) {
      console.error('Failed to upload & crop profile photo', err);
    } finally {
      setPhotoUploading(false);
    }
  };

  const handleDeleteEmployee = async () => {
    if (!id) return;
    try {
      await deleteEmployeeMutation.mutateAsync(id);
      navigate('/employees');
    } catch (err) {
      console.error('Failed to delete employee profile', err);
    }
  };

  const handleDeleteDoc = async () => {
    if (!id || !selectedDocForDelete) return;
    try {
      await deleteDocMutation.mutateAsync({
        employeeId: id,
        documentId: selectedDocForDelete.id,
      });
      setSelectedDocForDelete(null);
      refetchDocs();
    } catch (err) {
      console.error('Failed to delete document', err);
    }
  };

  const handleDeleteBank = async () => {
    if (!id || !selectedAccountForDelete) return;
    try {
      await deleteBankMutation.mutateAsync({
        employeeId: id,
        accountId: selectedAccountForDelete.id,
      });
      setSelectedAccountForDelete(null);
      refetch();
    } catch (err) {
      console.error('Failed to delete bank account', err);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <span className="bg-[#10b981]/10 px-2.5 py-0.5 text-xs font-semibold text-[#059669] border border-[#10b981]/20 uppercase">Confirmed / Active</span>;
      case 'probation':
        return <span className="bg-[#f59e0b]/10 px-2.5 py-0.5 text-xs font-semibold text-[#d97706] border border-[#f59e0b]/20 uppercase">On Probation</span>;
      case 'terminated':
      case 'retired':
        return <span className="bg-[#6b6b6b]/10 px-2.5 py-0.5 text-xs font-semibold text-[#374151] border border-[#d1d5db] uppercase">Terminated</span>;
      default:
        return <span className="bg-[#1c69d4]/10 px-2.5 py-0.5 text-xs font-semibold text-[#1c69d4] border border-[#1c69d4]/20 uppercase">{status}</span>;
    }
  };

  const getDocTypeBadge = (type: string) => {
    switch (type) {
      case 'nic_scan':
        return <span className="bg-[#1c69d4]/10 text-[#1c69d4] border border-[#1c69d4]/20 px-2 py-0.5 text-[10px] font-bold uppercase">NIC Card</span>;
      case 'passport':
        return <span className="bg-[#8b5cf6]/10 text-[#7c3aed] border border-[#8b5cf6]/20 px-2 py-0.5 text-[10px] font-bold uppercase">Passport</span>;
      case 'employment_contract':
        return <span className="bg-[#10b981]/10 text-[#059669] border border-[#10b981]/20 px-2 py-0.5 text-[10px] font-bold uppercase">Contract</span>;
      case 'educational_certificate':
        return <span className="bg-[#f59e0b]/10 text-[#d97706] border border-[#f59e0b]/20 px-2 py-0.5 text-[10px] font-bold uppercase">Degree / Certificate</span>;
      default:
        return <span className="bg-[#6b6b6b]/10 text-[#374151] border border-[#d1d5db] px-2 py-0.5 text-[10px] font-bold uppercase">{type.replace('_', ' ')}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2">
        <Link to="/employees" className="flex items-center gap-1.5 text-xs font-medium text-ink-mute hover:text-[#1c69d4] transition-colors">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Employee Directory</span>
        </Link>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setEditProfileOpen(true)}
            className="flex items-center gap-1.5 text-xs"
          >
            <Edit2 className="h-3.5 w-3.5 text-primary" />
            <span>Edit Profile</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setStatusDialogOpen(true)}
            className="flex items-center gap-1.5 text-xs"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Change Status</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setDeleteEmployeeOpen(true)}
            className="flex items-center gap-1.5 text-xs text-[#dc2626] border-[#dc2626]/30 hover:bg-[#dc2626]/5"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Archive Employee</span>
          </Button>
        </div>
      </div>

      {/* Header Profile Dossier Card */}
      <div className="border border-hairline bg-canvas p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            {/* Interactive Photo Avatar */}
            <div className="relative group h-16 w-16 shrink-0 overflow-hidden bg-[#1c69d4] border border-[#e6e6e6]">
              {profileFileId && !imgError ? (
                <img
                  src={getMockFileUrl(profileFileId)}
                  alt={employee.displayName}
                  className="h-full w-full object-cover"
                  onError={() => setImgError(true)}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xl font-bold text-white">
                  {employee.displayName.substring(0, 2).toUpperCase()}
                </div>
              )}

              {/* Hover Overlay Button to change/crop photo */}
              <button
                type="button"
                onClick={() => setCropperOpen(true)}
                className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white text-[10px] font-medium"
                title="Change & Crop Profile Photo"
              >
                <Camera className="h-4 w-4 mb-0.5" />
                <span>Edit</span>
              </button>
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl font-bold tracking-tight text-ink">{employee.displayName}</h1>
                {getStatusBadge(employee.lifecycleStatus)}
              </div>
              <p className="text-sm font-medium text-ink-mute mt-0.5">
                {primaryAssignment?.title || 'Staff Member'} • {primaryAssignment?.department?.name || 'General Department'}
              </p>
              <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-ink-mute">
                <span className="font-mono font-medium text-ink">ID: {employee.employeeNumber}</span>
                {employee.personalDetails?.nationalIdLast4 && (
                  <span className="flex items-center gap-1">
                    <Shield className="h-3.5 w-3.5 text-[#1c69d4]" />
                    NIC: ••••••{employee.personalDetails.nationalIdLast4}
                  </span>
                )}
                {employee.hireDate && (
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" /> Joined {employee.hireDate}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setCropperOpen(true)}
              className="text-xs flex items-center gap-1.5"
            >
              <Camera className="h-3.5 w-3.5 text-[#1c69d4]" />
              <span>Update Photo</span>
            </Button>
          </div>
        </div>

        {/* Dossier Navigation Tab Bar */}
        <div className="mt-6 flex items-center gap-2 overflow-x-auto border-t border-hairline pt-4 scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={cn(
              'inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium whitespace-nowrap transition-colors cursor-pointer select-none',
              activeTab === 'overview'
                ? 'bg-[#1c69d4]/10 text-[#1c69d4] font-bold border-b-2 border-[#1c69d4]'
                : 'bg-transparent text-[#6b6b6b] hover:bg-[#f7f7f7] hover:text-[#262626] border-b-2 border-transparent font-normal',
            )}
          >
            <User className="h-4 w-4" />
            <span>Profile Overview</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('employment')}
            className={cn(
              'inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium whitespace-nowrap transition-colors cursor-pointer select-none',
              activeTab === 'employment'
                ? 'bg-[#1c69d4]/10 text-[#1c69d4] font-bold border-b-2 border-[#1c69d4]'
                : 'bg-transparent text-[#6b6b6b] hover:bg-[#f7f7f7] hover:text-[#262626] border-b-2 border-transparent font-normal',
            )}
          >
            <Briefcase className="h-4 w-4" />
            <span>Employment & Position</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('statutory')}
            className={cn(
              'inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium whitespace-nowrap transition-colors cursor-pointer select-none',
              activeTab === 'statutory'
                ? 'bg-[#1c69d4]/10 text-[#1c69d4] font-bold border-b-2 border-[#1c69d4]'
                : 'bg-transparent text-[#6b6b6b] hover:bg-[#f7f7f7] hover:text-[#262626] border-b-2 border-transparent font-normal',
            )}
          >
            <CreditCard className="h-4 w-4" />
            <span>Banking & Statutory</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('documents')}
            className={cn(
              'inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium whitespace-nowrap transition-colors cursor-pointer select-none',
              activeTab === 'documents'
                ? 'bg-[#1c69d4]/10 text-[#1c69d4] font-bold border-b-2 border-[#1c69d4]'
                : 'bg-transparent text-[#6b6b6b] hover:bg-[#f7f7f7] hover:text-[#262626] border-b-2 border-transparent font-normal',
            )}
          >
            <FileText className="h-4 w-4" />
            <span>Documents ({employeeDocs?.length || 0})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('lifecycle')}
            className={cn(
              'inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium whitespace-nowrap transition-colors cursor-pointer select-none',
              activeTab === 'lifecycle'
                ? 'bg-[#1c69d4]/10 text-[#1c69d4] font-bold border-b-2 border-[#1c69d4]'
                : 'bg-transparent text-[#6b6b6b] hover:bg-[#f7f7f7] hover:text-[#262626] border-b-2 border-transparent font-normal',
            )}
          >
            <RefreshCw className="h-4 w-4" />
            <span>Lifecycle & Career</span>
          </button>
        </div>
      </div>

      {/* Tab Panels */}

      {/* 1. Overview Tab */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border border-hairline bg-canvas p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-hairline pb-2">
              <h3 className="text-sm font-bold text-ink flex items-center gap-1.5">
                <User className="h-4 w-4 text-[#1c69d4]" />
                Personal Information
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditProfileOpen(true)}
                className="h-7 text-xs text-primary font-medium"
              >
                <Edit2 className="h-3 w-3 mr-1" /> Edit
              </Button>
            </div>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-xs">
              <div>
                <dt className="text-ink-mute">First Name</dt>
                <dd className="font-semibold text-ink mt-0.5">{employee.firstName}</dd>
              </div>
              <div>
                <dt className="text-ink-mute">Last Name</dt>
                <dd className="font-semibold text-ink mt-0.5">{employee.lastName || '-'}</dd>
              </div>
              <div>
                <dt className="text-ink-mute">Date of Birth</dt>
                <dd className="font-semibold text-ink mt-0.5">{employee.personalDetails?.dateOfBirth || '-'}</dd>
              </div>
              <div>
                <dt className="text-ink-mute">Gender</dt>
                <dd className="font-semibold text-ink mt-0.5 capitalize">{employee.personalDetails?.gender || '-'}</dd>
              </div>
              <div>
                <dt className="text-ink-mute">Marital Status</dt>
                <dd className="font-semibold text-ink mt-0.5 capitalize">{employee.personalDetails?.maritalStatus || '-'}</dd>
              </div>
              <div>
                <dt className="text-ink-mute">Blood Group</dt>
                <dd className="font-semibold text-ink mt-0.5">{employee.personalDetails?.bloodGroup || '-'}</dd>
              </div>
            </dl>
          </div>

          <div className="border border-hairline bg-canvas p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-hairline pb-2">
              <h3 className="text-sm font-bold text-ink flex items-center gap-1.5">
                <Shield className="h-4 w-4 text-[#1c69d4]" />
                Contact & Residential Details
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditProfileOpen(true)}
                className="h-7 text-xs text-primary font-medium"
              >
                <Edit2 className="h-3 w-3 mr-1" /> Edit
              </Button>
            </div>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-xs">
              <div>
                <dt className="text-ink-mute">Company Email</dt>
                <dd className="font-semibold text-ink mt-0.5 truncate">{employee.companyEmail || '-'}</dd>
              </div>
              <div>
                <dt className="text-ink-mute">Personal Email</dt>
                <dd className="font-semibold text-ink mt-0.5 truncate">{employee.personalEmail || '-'}</dd>
              </div>
              <div>
                <dt className="text-ink-mute">Work Phone</dt>
                <dd className="font-semibold text-ink mt-0.5">{employee.companyPhone || '-'}</dd>
              </div>
              <div>
                <dt className="text-ink-mute">Personal Phone</dt>
                <dd className="font-semibold text-ink mt-0.5">{employee.personalPhone || '-'}</dd>
              </div>
              <div className="col-span-2">
                <dt className="text-ink-mute">Residential Address</dt>
                <dd className="font-semibold text-ink mt-0.5">
                  {employee.addresses?.[0]
                    ? `${employee.addresses[0].line1}, ${employee.addresses[0].city || ''}, ${employee.addresses[0].postalCode || ''}`
                    : 'No address registered'}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      )}

      {/* 2. Employment Tab */}
      {activeTab === 'employment' && (
        <div className="border border-hairline bg-canvas p-5 space-y-4">
          <h3 className="text-sm font-bold text-ink border-b border-hairline pb-2 flex items-center gap-1.5">
            <Briefcase className="h-4 w-4 text-[#1c69d4]" />
            Job Assignments & Position Architecture
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="border border-hairline p-4 bg-[#fafafa]">
              <span className="text-[10px] uppercase font-bold text-ink-mute">Position</span>
              <p className="text-sm font-bold text-ink mt-1">{primaryAssignment?.title || 'Staff Member'}</p>
              <p className="text-xs text-ink-mute mt-0.5">{primaryAssignment?.position?.titleOverride || 'Standard operational role'}</p>
            </div>
            <div className="border border-hairline p-4 bg-[#fafafa]">
              <span className="text-[10px] uppercase font-bold text-ink-mute">Department</span>
              <p className="text-sm font-bold text-ink mt-1">{primaryAssignment?.department?.name || 'General Department'}</p>
              <p className="text-xs text-ink-mute mt-0.5">Code: {primaryAssignment?.department?.code || 'N/A'}</p>
            </div>
            <div className="border border-hairline p-4 bg-[#fafafa]">
              <span className="text-[10px] uppercase font-bold text-ink-mute">Employment Type</span>
              <p className="text-sm font-bold text-ink mt-1 capitalize">{primaryRecord?.employmentType || 'Permanent'}</p>
              <p className="text-xs text-ink-mute mt-0.5">Status: {primaryRecord?.status || 'Active'}</p>
            </div>
          </div>
        </div>
      )}

      {/* 3. Statutory Tab */}
      {activeTab === 'statutory' && (
        <div className="border border-hairline bg-canvas p-5 space-y-4">
          <h3 className="text-sm font-bold text-ink border-b border-hairline pb-2 flex items-center gap-1.5">
            <CreditCard className="h-4 w-4 text-[#1c69d4]" />
            Sri Lanka EPF / ETF Statutory & Bank Accounts
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="border border-hairline p-4 space-y-2">
              <span className="text-[11px] font-bold text-ink uppercase">EPF / ETF Statutory Identifiers</span>
              <dl className="grid grid-cols-2 gap-2 mt-2">
                <div>
                  <dt className="text-ink-mute">EPF Member Number</dt>
                  <dd className="font-mono font-bold text-ink mt-0.5">{statutoryProfile?.epfMemberNumber || 'Pending'}</dd>
                </div>
                <div>
                  <dt className="text-ink-mute">ETF Reference</dt>
                  <dd className="font-mono font-bold text-ink mt-0.5">{statutoryProfile?.etfMemberReference || 'Pending'}</dd>
                </div>
              </dl>
            </div>
            <div className="border border-hairline p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-ink uppercase">Bank Remittance Accounts</span>
              </div>
              {employee.bankAccounts && employee.bankAccounts.length > 0 ? (
                <div className="space-y-3">
                  {employee.bankAccounts.map((acc) => (
                    <div key={acc.id} className="border border-hairline bg-[#fafafa] p-3 flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-ink text-xs">{acc.bankName}</p>
                          {acc.isPrimary && (
                            <span className="bg-[#10b981]/10 text-[#059669] border border-[#10b981]/20 px-1.5 py-0.2 text-[9px] font-bold uppercase">
                              Primary
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-ink-mute mt-0.5">
                          {acc.branchName ? `Branch: ${acc.branchName} • ` : ''}
                          Account: {acc.accountNumberLast4 ? `•••• ${acc.accountNumberLast4}` : 'Active'} ({acc.accountHolderName})
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedAccountForEdit(acc)}
                          className="h-7 w-7 p-0 text-ink-mute hover:text-ink"
                          title="Edit Bank Account"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedAccountForDelete(acc)}
                          className="h-7 w-7 p-0 text-[#dc2626] hover:bg-[#dc2626]/10"
                          title="Remove Bank Account"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-ink-mute mt-2">No bank accounts linked yet.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 4. Documents & Compliance Tab */}
      {activeTab === 'documents' && (
        <div className="space-y-4">
          {/* Header Action Bar */}
          <div className="border border-hairline bg-canvas p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-ink flex items-center gap-2">
                <FileCheck className="h-4 w-4 text-[#1c69d4]" />
                Employee Document Archive & Compliance Records
              </h3>
              <p className="text-xs text-ink-mute mt-0.5">
                NIC scans, passport pages, contracts, and educational certificates securely stored.
              </p>
            </div>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => setDocUploadOpen(true)}
              className="text-xs font-bold shrink-0 flex items-center gap-1.5"
            >
              <Plus className="h-4 w-4" /> Upload Document
            </Button>
          </div>

          {/* Document List */}
          {employeeDocs && employeeDocs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {employeeDocs.map((doc) => {
                const latestVersion = doc.versions?.[0];
                const file = latestVersion?.file;
                const fileId = file?.id || latestVersion?.fileId;

                return (
                  <div key={doc.id} className="border border-hairline bg-white p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-xs text-ink">{doc.title}</h4>
                          {getDocTypeBadge(doc.documentType)}
                        </div>
                        {file && (
                          <p className="text-[11px] text-ink-mute mt-1 font-mono">
                            {file.originalName} • {file.sizeBytes ? `${(Number(file.sizeBytes) / 1024).toFixed(1)} KB` : ''}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedDocForEdit(doc)}
                          className="h-7 w-7 p-0 text-ink-mute hover:text-ink"
                          title="Edit Document Info"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedDocForDelete(doc)}
                          className="h-7 w-7 p-0 text-[#dc2626] hover:bg-[#dc2626]/10"
                          title="Delete Document"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>

                    {doc.expiresOn && (
                      <div className="text-[11px] text-ink-mute">
                        Expires on: <span className="font-semibold text-ink">{doc.expiresOn}</span>
                      </div>
                    )}

                    {latestVersion?.notes && (
                      <p className="text-[11px] text-ink-mute bg-[#fafafa] p-2 border border-[#e6e6e6]">
                        {latestVersion.notes}
                      </p>
                    )}

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-hairline">
                      {fileId && (
                        <>
                          <a
                            href={getMockFileUrl(fileId)}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-xs px-2.5 py-1 border border-[#e6e6e6] bg-[#fafafa] text-ink hover:bg-[#f0f0f0] transition-colors"
                          >
                            <Eye className="h-3.5 w-3.5 text-[#1c69d4]" /> View
                          </a>
                          <a
                            href={getMockFileUrl(fileId)}
                            download
                            className="inline-flex items-center gap-1 text-xs px-2.5 py-1 border border-[#e6e6e6] bg-[#fafafa] text-ink hover:bg-[#f0f0f0] transition-colors"
                          >
                            <Download className="h-3.5 w-3.5 text-[#059669]" /> Download
                          </a>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="border border-dashed border-[#d1d5db] bg-white p-8 text-center space-y-3">
              <div className="flex h-12 w-12 mx-auto items-center justify-center bg-[#1c69d4]/10 text-[#1c69d4]">
                <UploadCloud className="h-6 w-6" />
              </div>
              <h4 className="text-sm font-bold text-ink">No Documents Attached Yet</h4>
              <p className="text-xs text-ink-mute max-w-sm mx-auto">
                Upload NIC scans, employee contracts, resume, and educational credentials directly to the storage provider.
              </p>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={() => setDocUploadOpen(true)}
                className="text-xs font-bold"
              >
                <Plus className="h-3.5 w-3.5 mr-1" /> Upload First Document
              </Button>
            </div>
          )}
        </div>
      )}

      {/* 5. Lifecycle Movements Tab */}
      {activeTab === 'lifecycle' && (
        <div className="space-y-4">
          <div className="border border-hairline bg-canvas p-5 space-y-4">
            <h3 className="text-sm font-bold text-ink border-b border-hairline pb-2 flex items-center gap-1.5">
              <Briefcase className="h-4 w-4 text-[#1c69d4]" />
              Career Movements & Promotions
            </h3>
            {employeeMovements?.data && employeeMovements.data.length > 0 ? (
              <div className="space-y-2">
                {employeeMovements.data.map((m) => (
                  <div key={m.id} className="flex items-center justify-between border border-hairline bg-canvas-soft/40 p-3 text-xs">
                    <div>
                      <span className="font-semibold text-ink capitalize">{m.movementType.replace('_', ' ')}</span>
                      <p className="text-[11px] text-ink-mute mt-0.5">{m.reason || 'Status milestone updated'}</p>
                    </div>
                    <span className="font-mono text-ink-mute text-[11px]">{m.requestedEffectiveDate || (m as any).effectiveDate || ''}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-ink-mute">No career movements recorded yet.</p>
            )}
          </div>
        </div>
      )}

      {/* Status Transition Dialog */}
      {statusDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-canvas p-6 border border-hairline shadow-lg space-y-4 z-10 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-2 border-b border-hairline pb-3">
              <RefreshCw className="h-4 w-4 text-[#1c69d4]" />
              <h3 className="text-base font-bold text-ink">Change Employee Lifecycle Status</h3>
            </div>

            <form onSubmit={handleStatusChange} className="space-y-4 text-xs">
              <div>
                <label className="mb-1 block font-semibold">Select New Status *</label>
                <Select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as EmploymentStatus)}
                  className="w-full"
                >
                  <option value="confirmed">Confirmed / Permanent Staff</option>
                  <option value="probation">Probationary Period</option>
                  <option value="notice_period">Serving Notice Period</option>
                  <option value="terminated">Employment Terminated</option>
                  <option value="resigned">Resigned / Relieved</option>
                  <option value="retired">Retired from Service</option>
                  <option value="suspended">Under Suspension</option>
                  <option value="on_leave">Extended Leave / Inactive</option>
                </Select>
              </div>

              <div>
                <label className="mb-1 block font-semibold">Status Justification & Reason</label>
                <Textarea
                  value={statusReason}
                  onChange={(e) => setStatusReason(e.target.value)}
                  placeholder="e.g. Completed probation review with department head..."
                  className="text-xs"
                  rows={3}
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-hairline">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setStatusDialogOpen(false)}
                  disabled={updateStatusMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary-pill"
                  size="sm"
                  disabled={updateStatusMutation.isPending}
                >
                  {updateStatusMutation.isPending ? 'Updating...' : 'Confirm Status Update'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Profile Dialog */}
      {editProfileOpen && (
        <EmployeeEditDialog
          isOpen={editProfileOpen}
          onClose={() => setEditProfileOpen(false)}
          employee={employee}
          onSuccess={() => refetch()}
        />
      )}

      {/* Delete Employee Confirmation Dialog */}
      {deleteEmployeeOpen && (
        <DeleteConfirmDialog
          isOpen={deleteEmployeeOpen}
          onClose={() => setDeleteEmployeeOpen(false)}
          onConfirm={handleDeleteEmployee}
          title={`Archive & Soft-Delete Employee ${employee.displayName}?`}
          description="Are you sure you want to delete this employee profile? Their employment records, statutory filings, and document associations will be safely soft-deleted from the directory."
          confirmLabel="Archive Employee"
          isLoading={deleteEmployeeMutation.isPending}
        />
      )}

      {/* Edit Document Modal */}
      {selectedDocForEdit && (
        <DocumentEditModal
          isOpen={!!selectedDocForEdit}
          onClose={() => setSelectedDocForEdit(null)}
          employeeId={employee.id}
          document={selectedDocForEdit}
          onSuccess={() => refetchDocs()}
        />
      )}

      {/* Delete Document Confirmation Dialog */}
      {selectedDocForDelete && (
        <DeleteConfirmDialog
          isOpen={!!selectedDocForDelete}
          onClose={() => setSelectedDocForDelete(null)}
          onConfirm={handleDeleteDoc}
          title={`Delete Document "${selectedDocForDelete.title}"?`}
          description="Are you sure you want to delete this document? The uploaded file will be permanently removed from storage."
          confirmLabel="Delete Document"
          isLoading={deleteDocMutation.isPending}
        />
      )}

      {/* Edit Bank Account Modal */}
      {selectedAccountForEdit && (
        <BankAccountEditModal
          isOpen={!!selectedAccountForEdit}
          onClose={() => setSelectedAccountForEdit(null)}
          employeeId={employee.id}
          account={selectedAccountForEdit}
          onSuccess={() => refetch()}
        />
      )}

      {/* Delete Bank Account Confirmation Dialog */}
      {selectedAccountForDelete && (
        <DeleteConfirmDialog
          isOpen={!!selectedAccountForDelete}
          onClose={() => setSelectedAccountForDelete(null)}
          onConfirm={handleDeleteBank}
          title={`Remove Bank Account "${selectedAccountForDelete.bankName}"?`}
          description="Are you sure you want to remove this remittance bank account from the employee profile?"
          confirmLabel="Remove Account"
          isLoading={deleteBankMutation.isPending}
        />
      )}

      {/* Image Cropper Modal */}
      <ImageCropperModal
        isOpen={cropperOpen}
        onClose={() => setCropperOpen(false)}
        onCropComplete={handleCropComplete}
        title="Crop Profile Photo"
        aspectRatio={1}
        isLoading={photoUploading}
      />

      {/* Document Upload Modal */}
      <DocumentUploadModal
        isOpen={docUploadOpen}
        onClose={() => setDocUploadOpen(false)}
        employeeId={employee.id}
        onSuccess={() => refetchDocs()}
      />
    </div>
  );
};
