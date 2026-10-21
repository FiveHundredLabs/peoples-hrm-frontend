import { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { Dialog } from '../../../components/ui/dialog';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { validateWithZod } from '../../../lib/formik-zod-adapter';
import { legalEntitySchema, LegalEntityFormValues } from '../schemas/organization.schema';
import { LegalEntity } from '../types/organization';
import { useCreateLegalEntity, useUpdateLegalEntity } from '../data/organization-data';
import { AlertCircle } from 'lucide-react';

export interface LegalEntityModalProps {
  isOpen: boolean;
  onClose: () => void;
  entityToEdit?: LegalEntity | null;
}

export function LegalEntityModal({
  isOpen,
  onClose,
  entityToEdit,
}: LegalEntityModalProps) {
  const [serverError, setServerError] = useState<string | null>(null);
  const createMutation = useCreateLegalEntity();
  const updateMutation = useUpdateLegalEntity();

  const isEditing = !!entityToEdit;

  const initialValues: LegalEntityFormValues = {
    code: entityToEdit?.code || '',
    legalName: entityToEdit?.legalName || '',
    displayName: entityToEdit?.displayName || '',
    registrationNumber: entityToEdit?.registrationNumber || '',
    taxIdentificationNumber: entityToEdit?.taxIdentificationNumber || '',
    epfEmployerNumber: entityToEdit?.epfEmployerNumber || '',
    etfEmployerNumber: entityToEdit?.etfEmployerNumber || '',
    countryCode: entityToEdit?.countryCode || 'LK',
    currency: entityToEdit?.currency || 'LKR',
    timezone: entityToEdit?.timezone || 'Asia/Colombo',
    active: entityToEdit?.active ?? true,
  };

  const handleSubmit = async (values: LegalEntityFormValues, { setSubmitting }: { setSubmitting: (s: boolean) => void }) => {
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

      if (isEditing && entityToEdit) {
        await updateMutation.mutateAsync({ id: entityToEdit.id, payload: cleaned });
      } else {
        await createMutation.mutateAsync(cleaned as LegalEntityFormValues);
      }
      onClose();
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to save legal entity';
      setServerError(Array.isArray(msg) ? msg.join(' • ') : msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Legal Entity' : 'Add Legal Entity'}
      description="Configure registered legal entity, tax registration, and statutory EPF/ETF credentials."
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
        validate={validateWithZod(legalEntitySchema)}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ isSubmitting, errors, touched }) => (
          <Form className="space-y-4 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Code */}
              <div>
                <Label className="mb-1 block font-semibold">Entity Code *</Label>
                <Field
                  name="code"
                  as={Input}
                  placeholder="e.g. LE-001"
                  disabled={isEditing}
                  hasError={touched.code && !!errors.code}
                />
                <ErrorMessage name="code" component="p" className="mt-1 text-xs text-[#dc2626] font-medium" />
              </div>

              {/* Display Name */}
              <div>
                <Label className="mb-1 block font-semibold">Display Name *</Label>
                <Field
                  name="displayName"
                  as={Input}
                  placeholder="e.g. Ceylon Holdings"
                  hasError={touched.displayName && !!errors.displayName}
                />
                <ErrorMessage name="displayName" component="p" className="mt-1 text-xs text-[#dc2626] font-medium" />
              </div>
            </div>

            {/* Legal Registered Name */}
            <div>
              <Label className="mb-1 block font-semibold">Registered Legal Name *</Label>
              <Field
                name="legalName"
                as={Input}
                placeholder="e.g. Ceylon Holdings (Private) Limited"
                hasError={touched.legalName && !!errors.legalName}
              />
              <ErrorMessage name="legalName" component="p" className="mt-1 text-xs text-[#dc2626] font-medium" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Registration Number */}
              <div>
                <Label className="mb-1 block font-semibold">Registration Number (PV No.)</Label>
                <Field
                  name="registrationNumber"
                  as={Input}
                  placeholder="e.g. PV 12345"
                />
              </div>

              {/* Tax Identification Number (TIN) */}
              <div>
                <Label className="mb-1 block font-semibold">Tax Identification Number (TIN)</Label>
                <Field
                  name="taxIdentificationNumber"
                  as={Input}
                  placeholder="e.g. 123456789-7000"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* EPF Employer Number */}
              <div>
                <Label className="mb-1 block font-semibold">EPF Employer Number</Label>
                <Field
                  name="epfEmployerNumber"
                  as={Input}
                  placeholder="e.g. A/12345"
                />
              </div>

              {/* ETF Employer Number */}
              <div>
                <Label className="mb-1 block font-semibold">ETF Employer Number</Label>
                <Field
                  name="etfEmployerNumber"
                  as={Input}
                  placeholder="e.g. ETF/98765"
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
              <Label htmlFor="active" className="cursor-pointer font-semibold">Active Operational Entity</Label>
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
                {isSubmitting ? 'Saving...' : isEditing ? 'Update Legal Entity' : 'Create Legal Entity'}
              </Button>
            </div>
          </Form>
        )}
      </Formik>
    </Dialog>
  );
}
