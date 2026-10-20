import { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { Dialog } from '../../../components/ui/dialog';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Select } from '../../../components/ui/select';
import { validateWithZod } from '../../../lib/formik-zod-adapter';
import { positionSchema, PositionFormValues } from '../schemas/organization.schema';
import { Position, LegalEntity, Department } from '../types/organization';
import { useCreatePosition, useUpdatePosition } from '../api/organization-api';
import { AlertCircle } from 'lucide-react';

export interface PositionModalProps {
  isOpen: boolean;
  onClose: () => void;
  legalEntities: LegalEntity[];
  departments: Department[];
  positionToEdit?: Position | null;
  defaultLegalEntityId?: string;
}

export function PositionModal({
  isOpen,
  onClose,
  legalEntities,
  departments,
  positionToEdit,
  defaultLegalEntityId,
}: PositionModalProps) {
  const [serverError, setServerError] = useState<string | null>(null);
  const createMutation = useCreatePosition();
  const updateMutation = useUpdatePosition();

  const isEditing = !!positionToEdit;

  const initialValues: PositionFormValues = {
    legalEntityId: positionToEdit?.legalEntityId || defaultLegalEntityId || legalEntities[0]?.id || '',
    departmentId: positionToEdit?.departmentId || departments[0]?.id || undefined,
    jobId: positionToEdit?.jobId || undefined,
    code: positionToEdit?.code || '',
    titleOverride: positionToEdit?.titleOverride || '',
    headcountLimit: positionToEdit?.headcountLimit || 1,
    fte: positionToEdit?.fte ? Number(positionToEdit.fte) : 1.0,
    effectiveFrom: positionToEdit?.effectiveFrom ? positionToEdit.effectiveFrom.split('T')[0] : new Date().toISOString().split('T')[0],
    active: positionToEdit?.active ?? true,
  };

  const handleSubmit = async (values: PositionFormValues, { setSubmitting }: { setSubmitting: (s: boolean) => void }) => {
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

      if (isEditing && positionToEdit) {
        await updateMutation.mutateAsync({ id: positionToEdit.id, payload: cleaned });
      } else {
        await createMutation.mutateAsync(cleaned as PositionFormValues);
      }
      onClose();
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to save position';
      setServerError(Array.isArray(msg) ? msg.join(' • ') : msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Job Position' : 'Add Job Position'}
      description="Define job titles, reporting hierarchy, and approved headcount limits."
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
        validate={validateWithZod(positionSchema)}
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

            {/* Department Select */}
            <div>
              <Label className="mb-1 block font-semibold">Department *</Label>
              <Select
                value={values.departmentId || ''}
                onChange={(e) => setFieldValue('departmentId', e.target.value || undefined)}
                className="w-full"
              >
                {departments
                  .filter((d) => !values.legalEntityId || d.legalEntityId === values.legalEntityId)
                  .map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.code})
                    </option>
                  ))}
              </Select>
            </div>

            {/* Position Code & Title */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label className="mb-1 block font-semibold">Position Code *</Label>
                <Field
                  name="code"
                  as={Input}
                  placeholder="e.g. POS-ENG-001"
                  disabled={isEditing}
                  hasError={touched.code && !!errors.code}
                />
                <ErrorMessage name="code" component="p" className="mt-1 text-xs text-[#dc2626] font-medium" />
              </div>

              <div>
                <Label className="mb-1 block font-semibold">Position Title *</Label>
                <Field
                  name="titleOverride"
                  as={Input}
                  placeholder="e.g. Lead Cloud Architect"
                  hasError={touched.titleOverride && !!errors.titleOverride}
                />
                <ErrorMessage name="titleOverride" component="p" className="mt-1 text-xs text-[#dc2626] font-medium" />
              </div>
            </div>

            {/* Headcount & Effective From */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label className="mb-1 block font-semibold">Headcount Limit</Label>
                <Field
                  name="headcountLimit"
                  as={Input}
                  type="number"
                  min="1"
                />
              </div>

              <div>
                <Label className="mb-1 block font-semibold">Effective From</Label>
                <Field
                  name="effectiveFrom"
                  as={Input}
                  type="date"
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
              <Label htmlFor="active" className="cursor-pointer font-semibold">Active Position</Label>
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
                {isSubmitting ? 'Saving...' : isEditing ? 'Update Position' : 'Create Position'}
              </Button>
            </div>
          </Form>
        )}
      </Formik>
    </Dialog>
  );
}
