import { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { Dialog } from '../../../components/ui/dialog';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Select } from '../../../components/ui/select';
import { validateWithZod } from '../../../lib/formik-zod-adapter';
import { departmentSchema, DepartmentFormValues } from '../schemas/organization.schema';
import { Department, LegalEntity, Branch } from '../types/organization';
import { useCreateDepartment, useUpdateDepartment } from '../api/organization-api';
import { AlertCircle } from 'lucide-react';

export interface DepartmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  legalEntities: LegalEntity[];
  branches: Branch[];
  departmentToEdit?: Department | null;
  defaultLegalEntityId?: string;
}

export function DepartmentModal({
  isOpen,
  onClose,
  legalEntities,
  branches,
  departmentToEdit,
  defaultLegalEntityId,
}: DepartmentModalProps) {
  const [serverError, setServerError] = useState<string | null>(null);
  const createMutation = useCreateDepartment();
  const updateMutation = useUpdateDepartment();

  const isEditing = !!departmentToEdit;

  const initialValues: DepartmentFormValues = {
    legalEntityId: departmentToEdit?.legalEntityId || defaultLegalEntityId || legalEntities[0]?.id || '',
    branchId: departmentToEdit?.branchId || undefined,
    parentDepartmentId: departmentToEdit?.parentDepartmentId || undefined,
    code: departmentToEdit?.code || '',
    name: departmentToEdit?.name || '',
    description: departmentToEdit?.description || '',
    active: departmentToEdit?.active ?? true,
  };

  const handleSubmit = async (values: DepartmentFormValues, { setSubmitting }: { setSubmitting: (s: boolean) => void }) => {
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

      if (isEditing && departmentToEdit) {
        await updateMutation.mutateAsync({ id: departmentToEdit.id, payload: cleaned });
      } else {
        await createMutation.mutateAsync(cleaned as DepartmentFormValues);
      }
      onClose();
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to save department';
      setServerError(Array.isArray(msg) ? msg.join(' • ') : msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Department' : 'Add Department'}
      description="Configure organizational division, department code, and reporting branch."
      maxWidth="md"
    >
      {serverError && (
        <div className="mb-4 flex items-center gap-2 rounded-none bg-[#dc2626]/10 border border-[#dc2626]/30 p-3 text-xs text-[#dc2626]">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{serverError}</span>
        </div>
      )}

      <Formik
        initialValues={initialValues}
        validate={validateWithZod(departmentSchema)}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ isSubmitting, errors, touched, values, setFieldValue }) => (
          <Form className="space-y-4 text-xs">
            {/* Legal Entity Select */}
            <div>
              <Label className="mb-1 block font-semibold">Legal Entity *</Label>
              <Select
                value={values.legalEntityId}
                onChange={(e) => setFieldValue('legalEntityId', e.target.value)}
                disabled={isEditing}
                className="w-full"
              >
                {legalEntities.map((le) => (
                  <option key={le.id} value={le.id}>
                    {le.displayName} ({le.code})
                  </option>
                ))}
              </Select>
            </div>

            {/* Branch (Optional) */}
            <div>
              <Label className="mb-1 block font-semibold">Branch (Optional)</Label>
              <Select
                value={values.branchId || ''}
                onChange={(e) => setFieldValue('branchId', e.target.value || undefined)}
                className="w-full"
              >
                <option value="">All Branches / Global</option>
                {branches
                  .filter((b) => !values.legalEntityId || b.legalEntityId === values.legalEntityId)
                  .map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.code})
                    </option>
                  ))}
              </Select>
            </div>

            {/* Department Code & Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label className="mb-1 block font-semibold">Department Code *</Label>
                <Field
                  name="code"
                  as={Input}
                  placeholder="e.g. DEP-ENG"
                  disabled={isEditing}
                  hasError={touched.code && !!errors.code}
                />
                <ErrorMessage name="code" component="p" className="mt-1 text-xs text-[#dc2626] font-medium" />
              </div>

              <div>
                <Label className="mb-1 block font-semibold">Department Name *</Label>
                <Field
                  name="name"
                  as={Input}
                  placeholder="e.g. Software Engineering"
                  hasError={touched.name && !!errors.name}
                />
                <ErrorMessage name="name" component="p" className="mt-1 text-xs text-[#dc2626] font-medium" />
              </div>
            </div>

            {/* Description */}
            <div>
              <Label className="mb-1 block font-semibold">Description</Label>
              <Field
                name="description"
                as={Input}
                placeholder="Optional description of responsibilities..."
              />
            </div>

            {/* Active Switch */}
            <div className="flex items-center gap-2 pt-2">
              <Field
                type="checkbox"
                name="active"
                id="active"
                className="h-4 w-4 rounded-none border-hairline text-primary focus:ring-0 cursor-pointer"
              />
              <Label htmlFor="active" className="cursor-pointer font-semibold">Active Department</Label>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-4 border-t border-hairline">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary-pill"
                size="sm"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : isEditing ? 'Update Department' : 'Create Department'}
              </Button>
            </div>
          </Form>
        )}
      </Formik>
    </Dialog>
  );
}
