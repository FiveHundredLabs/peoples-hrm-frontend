import { Formik, Form, Field, ErrorMessage } from 'formik';
import { Dialog } from '../../../components/ui/dialog';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Select } from '../../../components/ui/select';
import { validateWithZod } from '../../../lib/formik-zod-adapter';
import { workLocationSchema, WorkLocationFormValues } from '../schemas/organization.schema';
import { LegalEntity, Branch } from '../types/organization';
import { useCreateWorkLocation } from '../api/organization-api';

export interface WorkLocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  legalEntities: LegalEntity[];
  branches: Branch[];
  defaultLegalEntityId?: string;
}

export function WorkLocationModal({
  isOpen,
  onClose,
  legalEntities,
  branches,
  defaultLegalEntityId,
}: WorkLocationModalProps) {
  const createMutation = useCreateWorkLocation();

  const initialValues: WorkLocationFormValues = {
    legalEntityId: defaultLegalEntityId || legalEntities[0]?.id || '',
    branchId: branches[0]?.id || undefined,
    code: '',
    name: '',
    locationType: 'Office',
    addressLine1: '',
    city: '',
    district: '',
    province: '',
    postalCode: '',
    geofenceRadiusM: 100,
    timezone: 'Asia/Colombo',
    active: true,
  };

  const handleSubmit = async (values: WorkLocationFormValues) => {
    await createMutation.mutateAsync(values);
    onClose();
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Add Work Location"
      description="Add work location."
      maxWidth="lg"
    >
      <Formik
        initialValues={initialValues}
        validate={validateWithZod(workLocationSchema)}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting, errors, touched }) => (
          <Form className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Legal Entity */}
              <div>
                <Label className="mb-1 block">Legal Entity *</Label>
                <Field
                  as={Select}
                  name="legalEntityId"
                  hasError={touched.legalEntityId && !!errors.legalEntityId}
                >
                  {legalEntities.map((le) => (
                    <option key={le.id} value={le.id}>
                      {le.displayName}
                    </option>
                  ))}
                </Field>
              </div>

              {/* Branch */}
              <div>
                <Label className="mb-1 block">Branch (Optional)</Label>
                <Field
                  as={Select}
                  name="branchId"
                >
                  <option value="">None</option>
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </Field>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Code */}
              <div>
                <Label className="mb-1 block">Location Code *</Label>
                <Field
                  name="code"
                  as={Input}
                  placeholder="e.g. LOC-HQ-01"
                  hasError={touched.code && !!errors.code}
                />
                <ErrorMessage name="code" component="p" className="mt-1 text-xs text-accent-tomato font-medium" />
              </div>

              {/* Name */}
              <div className="md:col-span-2">
                <Label className="mb-1 block">Location Name *</Label>
                <Field
                  name="name"
                  as={Input}
                  placeholder="e.g. HQ 4th Floor Tech Hub"
                  hasError={touched.name && !!errors.name}
                />
                <ErrorMessage name="name" component="p" className="mt-1 text-xs text-accent-tomato font-medium" />
              </div>
            </div>

            {/* Geofence and Type */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-hairline">
              <div>
                <Label className="mb-1 block">Location Type</Label>
                <Field name="locationType" as={Input} placeholder="e.g. Office, Warehouse, Factory" />
              </div>

              <div>
                <Label className="mb-1 block">Geofence Radius (Meters)</Label>
                <Field name="geofenceRadiusM" as={Input} type="number" placeholder="100" />
              </div>
            </div>

            {/* Address */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="mb-1 block">City</Label>
                <Field name="city" as={Input} placeholder="e.g. Colombo" />
              </div>
              <div>
                <Label className="mb-1 block">District</Label>
                <Field name="district" as={Input} placeholder="e.g. Colombo" />
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-hairline">
              <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" isLoading={isSubmitting}>
                Create Work Location
              </Button>
            </div>
          </Form>
        )}
      </Formik>
    </Dialog>
  );
}
