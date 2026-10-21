import { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { Dialog } from '../../../components/ui/dialog';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Select } from '../../../components/ui/select';
import { validateWithZod } from '../../../lib/formik-zod-adapter';
import { branchSchema, BranchFormValues } from '../schemas/organization.schema';
import { Branch, LegalEntity } from '../types/organization';
import { useCreateBranch, useUpdateBranch } from '../data/organization-data';
import { AlertCircle } from 'lucide-react';

export interface BranchModalProps {
  isOpen: boolean;
  onClose: () => void;
  legalEntities: LegalEntity[];
  branchToEdit?: Branch | null;
  defaultLegalEntityId?: string;
}

export function BranchModal({
  isOpen,
  onClose,
  legalEntities,
  branchToEdit,
  defaultLegalEntityId,
}: BranchModalProps) {
  const [serverError, setServerError] = useState<string | null>(null);
  const createMutation = useCreateBranch();
  const updateMutation = useUpdateBranch();

  const isEditing = !!branchToEdit;

  const initialValues: BranchFormValues = {
    legalEntityId: branchToEdit?.legalEntityId || defaultLegalEntityId || legalEntities[0]?.id || '',
    parentBranchId: branchToEdit?.parentBranchId || undefined,
    code: branchToEdit?.code || '',
    name: branchToEdit?.name || '',
    branchType: branchToEdit?.branchType || 'Headquarters',
    phone: branchToEdit?.phone || '',
    email: branchToEdit?.email || '',
    addressLine1: branchToEdit?.addressLine1 || '',
    city: branchToEdit?.city || '',
    district: branchToEdit?.district || '',
    province: branchToEdit?.province || '',
    postalCode: branchToEdit?.postalCode || '',
    active: branchToEdit?.active ?? true,
  };

  const handleSubmit = async (values: BranchFormValues, { setSubmitting }: { setSubmitting: (s: boolean) => void }) => {
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

      if (isEditing && branchToEdit) {
        await updateMutation.mutateAsync({ id: branchToEdit.id, payload: cleaned });
      } else {
        await createMutation.mutateAsync(cleaned as BranchFormValues);
      }
      onClose();
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to save branch';
      setServerError(Array.isArray(msg) ? msg.join(' • ') : msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Branch' : 'Add Branch'}
      description="Configure branch location, contact numbers, and address details."
      maxWidth="lg"
    >
      {serverError && (
        <div className="mb-4 flex items-center gap-2 rounded-none bg-[#dc2626]/10 border border-[#dc2626]/30 p-3 text-xs text-[#dc2626]">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{serverError}</span>
        </div>
      )}

      <Formik
        initialValues={initialValues}
        validate={validateWithZod(branchSchema)}
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

            {/* Code & Name */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <Label className="mb-1 block font-semibold">Branch Code *</Label>
                <Field
                  name="code"
                  as={Input}
                  placeholder="e.g. BR-COL-01"
                  disabled={isEditing}
                  hasError={touched.code && !!errors.code}
                />
                <ErrorMessage name="code" component="p" className="mt-1 text-xs text-[#dc2626] font-medium" />
              </div>

              <div className="md:col-span-2">
                <Label className="mb-1 block font-semibold">Branch Name *</Label>
                <Field
                  name="name"
                  as={Input}
                  placeholder="e.g. Colombo Head Office"
                  hasError={touched.name && !!errors.name}
                />
                <ErrorMessage name="name" component="p" className="mt-1 text-xs text-[#dc2626] font-medium" />
              </div>
            </div>

            {/* Contact Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label className="mb-1 block font-semibold">Phone Number</Label>
                <Field
                  name="phone"
                  as={Input}
                  placeholder="e.g. +94 11 2345678"
                />
              </div>

              <div>
                <Label className="mb-1 block font-semibold">Branch Email</Label>
                <Field
                  name="email"
                  as={Input}
                  type="email"
                  placeholder="e.g. colombo@ceylonholdings.lk"
                />
              </div>
            </div>

            {/* Address */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label className="mb-1 block font-semibold">Address Line 1</Label>
                <Field
                  name="addressLine1"
                  as={Input}
                  placeholder="e.g. 100 Galle Road"
                />
              </div>

              <div>
                <Label className="mb-1 block font-semibold">City / Town</Label>
                <Field
                  name="city"
                  as={Input}
                  placeholder="e.g. Colombo"
                />
              </div>
            </div>

            {/* Active Switch */}
            <div className="flex items-center gap-2 pt-2">
              <Field
                type="checkbox"
                name="active"
                id="active"
                className="h-4 w-4 rounded-none border-hairline text-primary focus:ring-0 cursor-pointer"
              />
              <Label htmlFor="active" className="cursor-pointer font-semibold">Active Operational Branch</Label>
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
                {isSubmitting ? 'Saving...' : isEditing ? 'Update Branch' : 'Create Branch'}
              </Button>
            </div>
          </Form>
        )}
      </Formik>
    </Dialog>
  );
}
