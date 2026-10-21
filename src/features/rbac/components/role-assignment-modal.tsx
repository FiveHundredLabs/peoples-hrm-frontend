import { Formik, Form, Field, ErrorMessage } from 'formik';
import { Dialog } from '../../../components/ui/dialog';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Select } from '../../../components/ui/select';
import { validateWithZod } from '../../../lib/formik-zod-adapter';
import { assignUserRoleSchema, AssignUserRoleFormValues } from '../../auth/schemas/auth.schema';
import { Role, User } from '../../auth/types/auth';
import { useAssignUserRole } from '../../auth/data/auth-data';

export interface RoleAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  roles: Role[];
}

export function RoleAssignmentModal({
  isOpen,
  onClose,
  user,
  roles,
}: RoleAssignmentModalProps) {
  const assignMutation = useAssignUserRole();

  if (!user) return null;

  const initialValues: AssignUserRoleFormValues = {
    userId: user.id,
    roleId: roles[0]?.id || '',
    scopeType: 'organization',
    effectiveFrom: new Date().toISOString().split('T')[0],
    effectiveTo: '',
    reason: '',
  };

  const handleSubmit = async (values: AssignUserRoleFormValues) => {
    await assignMutation.mutateAsync(values);
    onClose();
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Assign Role & Scope"
      description={`Grant an operational role to ${user.email} with scoped authorization boundaries.`}
      maxWidth="md"
    >
      <Formik
        initialValues={initialValues}
        validate={validateWithZod(assignUserRoleSchema)}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting, errors, touched }) => (
          <Form className="space-y-4">
            {/* Role Selection */}
            <div>
              <Label className="mb-1 block">Role *</Label>
              <Field
                as={Select}
                name="roleId"
                hasError={touched.roleId && !!errors.roleId}
              >
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} ({r.code})
                  </option>
                ))}
              </Field>
              <ErrorMessage name="roleId" component="p" className="mt-1 text-xs text-accent-tomato font-medium" />
            </div>

            {/* Scope Type */}
            <div>
              <Label className="mb-1 block">Scope Authority *</Label>
              <Field
                as={Select}
                name="scopeType"
              >
                <option value="organization">Entire Organization</option>
                <option value="legal_entity">Legal Entity</option>
                <option value="branch">Branch</option>
                <option value="department">Department</option>
                <option value="team">Team</option>
                <option value="self">Self (Personal Profile)</option>
              </Field>
            </div>

            {/* Effective Start & End */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="mb-1 block">Effective From *</Label>
                <Field
                  name="effectiveFrom"
                  as={Input}
                  type="date"
                  hasError={touched.effectiveFrom && !!errors.effectiveFrom}
                />
              </div>

              <div>
                <Label className="mb-1 block">Effective Until (Optional)</Label>
                <Field
                  name="effectiveTo"
                  as={Input}
                  type="date"
                />
              </div>
            </div>

            {/* Reason */}
            <div>
              <Label className="mb-1 block">Assignment Reason / Memo</Label>
              <Field
                name="reason"
                as={Input}
                placeholder="e.g. Appointed as Regional Operations Head"
              />
            </div>

            {/* Actions */}
            <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-hairline">
              <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" isLoading={isSubmitting}>
                Confirm Role Assignment
              </Button>
            </div>
          </Form>
        )}
      </Formik>
    </Dialog>
  );
}
