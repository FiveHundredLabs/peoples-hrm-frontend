import React, { useState } from 'react';
import { useFormik } from 'formik';
import { Dialog } from '../../../components/ui/dialog';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Select } from '../../../components/ui/select';
import { Employee } from '../types/employee';
import { useUpdateEmployee } from '../api/employee-api';
import { User, Mail, Calendar, AlertCircle } from 'lucide-react';

export interface EmployeeEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  employee: Employee;
  onSuccess?: () => void;
}

export const EmployeeEditDialog: React.FC<EmployeeEditDialogProps> = ({
  isOpen,
  onClose,
  employee,
  onSuccess,
}) => {
  const [serverError, setServerError] = useState<string | null>(null);
  const updateMutation = useUpdateEmployee();

  const formik = useFormik({
    initialValues: {
      firstName: employee.firstName || '',
      middleName: employee.middleName || '',
      lastName: employee.lastName || '',
      preferredName: employee.preferredName || '',
      companyEmail: employee.companyEmail || '',
      personalEmail: employee.personalEmail || '',
      companyPhone: employee.companyPhone || '',
      personalPhone: employee.personalPhone || '',
      dateOfBirth: employee.personalDetails?.dateOfBirth || '',
      gender: employee.personalDetails?.gender || '',
      maritalStatus: employee.personalDetails?.maritalStatus || '',
      bloodGroup: employee.personalDetails?.bloodGroup || '',
      preferredLanguage: employee.personalDetails?.preferredLanguage || 'English',
    },
    enableReinitialize: true,
    onSubmit: async (values, { setSubmitting }) => {
      setServerError(null);
      try {
        const cleaned: Record<string, any> = {};
        for (const [k, v] of Object.entries(values)) {
          if (typeof v === 'string') {
            const trimmed = v.trim();
            cleaned[k] = trimmed !== '' ? trimmed : undefined;
          } else {
            cleaned[k] = v;
          }
        }
        await updateMutation.mutateAsync({ id: employee.id, data: cleaned });
        onSuccess?.();
        onClose();
      } catch (err: any) {
        const msg = err?.response?.data?.message || err?.message || 'Failed to update employee details';
        setServerError(Array.isArray(msg) ? msg.join(' • ') : msg);
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      title="Edit Employee Profile"
      description={`Update personal and contact info for ${employee.displayName} (${employee.employeeNumber})`}
      maxWidth="lg"
    >
      <div className="space-y-4">
        {serverError && (
          <div className="flex items-center gap-2 rounded-none bg-[#dc2626]/10 border border-[#dc2626]/30 p-3 text-xs text-[#dc2626]">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{serverError}</span>
          </div>
        )}

        <form onSubmit={formik.handleSubmit} className="space-y-4 text-xs">
          {/* 1. Name & Identity */}
          <div className="space-y-2 border border-hairline p-3 bg-canvas-soft/30">
            <span className="font-semibold text-ink flex items-center gap-1.5 text-xs">
              <User className="h-3.5 w-3.5 text-primary" />
              Employee Names
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={formik.values.firstName}
                  onChange={formik.handleChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  value={formik.values.lastName}
                  onChange={formik.handleChange}
                />
              </div>
              <div>
                <Label htmlFor="middleName">Middle Name</Label>
                <Input
                  id="middleName"
                  name="middleName"
                  value={formik.values.middleName}
                  onChange={formik.handleChange}
                />
              </div>
              <div>
                <Label htmlFor="preferredName">Preferred / Call Name</Label>
                <Input
                  id="preferredName"
                  name="preferredName"
                  value={formik.values.preferredName}
                  onChange={formik.handleChange}
                />
              </div>
            </div>
          </div>

          {/* 2. Contact Channels */}
          <div className="space-y-2 border border-hairline p-3 bg-canvas-soft/30">
            <span className="font-semibold text-ink flex items-center gap-1.5 text-xs">
              <Mail className="h-3.5 w-3.5 text-primary" />
              Contact & Communication
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label htmlFor="companyEmail">Company Email</Label>
                <Input
                  id="companyEmail"
                  name="companyEmail"
                  type="email"
                  value={formik.values.companyEmail}
                  onChange={formik.handleChange}
                />
              </div>
              <div>
                <Label htmlFor="personalEmail">Personal Email</Label>
                <Input
                  id="personalEmail"
                  name="personalEmail"
                  type="email"
                  value={formik.values.personalEmail}
                  onChange={formik.handleChange}
                />
              </div>
              <div>
                <Label htmlFor="companyPhone">Work Phone</Label>
                <Input
                  id="companyPhone"
                  name="companyPhone"
                  value={formik.values.companyPhone}
                  onChange={formik.handleChange}
                />
              </div>
              <div>
                <Label htmlFor="personalPhone">Mobile / Personal Phone</Label>
                <Input
                  id="personalPhone"
                  name="personalPhone"
                  value={formik.values.personalPhone}
                  onChange={formik.handleChange}
                />
              </div>
            </div>
          </div>

          {/* 3. Personal Demographics */}
          <div className="space-y-2 border border-hairline p-3 bg-canvas-soft/30">
            <span className="font-semibold text-ink flex items-center gap-1.5 text-xs">
              <Calendar className="h-3.5 w-3.5 text-primary" />
              Demographics & Personal Details
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Input
                  id="dateOfBirth"
                  name="dateOfBirth"
                  type="date"
                  value={formik.values.dateOfBirth}
                  onChange={formik.handleChange}
                />
              </div>
              <div>
                <Label htmlFor="gender">Gender</Label>
                <Select
                  id="gender"
                  name="gender"
                  value={formik.values.gender}
                  onChange={formik.handleChange}
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </Select>
              </div>
              <div>
                <Label htmlFor="maritalStatus">Marital Status</Label>
                <Select
                  id="maritalStatus"
                  name="maritalStatus"
                  value={formik.values.maritalStatus}
                  onChange={formik.handleChange}
                >
                  <option value="">Select Status</option>
                  <option value="single">Single</option>
                  <option value="married">Married</option>
                  <option value="divorced">Divorced</option>
                  <option value="widowed">Widowed</option>
                </Select>
              </div>
              <div>
                <Label htmlFor="bloodGroup">Blood Group</Label>
                <Select
                  id="bloodGroup"
                  name="bloodGroup"
                  value={formik.values.bloodGroup}
                  onChange={formik.handleChange}
                >
                  <option value="">Select Blood Group</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                </Select>
              </div>
              <div>
                <Label htmlFor="preferredLanguage">Language</Label>
                <Input
                  id="preferredLanguage"
                  name="preferredLanguage"
                  value={formik.values.preferredLanguage}
                  onChange={formik.handleChange}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-hairline">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={formik.isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary-pill"
              size="sm"
              disabled={formik.isSubmitting}
            >
              {formik.isSubmitting ? 'Saving Changes...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>
    </Dialog>
  );
};
