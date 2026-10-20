import { Formik, Form, Field, ErrorMessage } from 'formik';
import { Dialog } from '../../../components/ui/dialog';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Select } from '../../../components/ui/select';
import { validateWithZod } from '../../../lib/formik-zod-adapter';
import { createUserSchema, CreateUserFormValues } from '../../auth/schemas/auth.schema';
import { Role } from '../../auth/types/auth';
import { useCreateUser } from '../../auth/api/auth-api';

export interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  roles: Role[];
}

export function UserModal({ isOpen, onClose, roles }: UserModalProps) {
  const createMutation = useCreateUser();

  const initialValues: CreateUserFormValues = {
    email: '',
    username: '',
    password: '',
    roleId: roles[0]?.id || '',
    scopeType: 'organization',
    locale: 'en-LK',
    timezone: 'Asia/Colombo',
  };

  const handleSubmit = async (values: CreateUserFormValues) => {
    await createMutation.mutateAsync(values);
    onClose();
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Create User Account"
      description="Create user credentials."
      maxWidth="md"
    >
      <Formik
        initialValues={initialValues}
        validate={validateWithZod(createUserSchema)}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting, errors, touched }) => (
          <Form className="space-y-4">
            {/* Email */}
            <div>
              <Label className="mb-1 block">Work Email *</Label>
              <Field
                name="email"
                as={Input}
                type="email"
                placeholder="e.g. employee@company.lk"
                hasError={touched.email && !!errors.email}
              />
              <ErrorMessage name="email" component="p" className="mt-1 text-xs text-accent-tomato font-medium" />
            </div>

            {/* Username & Initial Password */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="mb-1 block">Username (Optional)</Label>
                <Field
                  name="username"
                  as={Input}
                  placeholder="e.g. jdoe"
                />
              </div>

              <div>
                <Label className="mb-1 block">Initial Password *</Label>
                <Field
                  name="password"
                  as={Input}
                  type="password"
                  placeholder="Minimum 8 characters"
                  hasError={touched.password && !!errors.password}
                />
                <ErrorMessage name="password" component="p" className="mt-1 text-xs text-accent-tomato font-medium" />
              </div>
            </div>

            {/* Role & Scope */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-hairline">
              <div>
                <Label className="mb-1 block">Assigned Role</Label>
                <Field
                  as={Select}
                  name="roleId"
                >
                  <option value="">No Role (Restricted)</option>
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} ({r.code})
                    </option>
                  ))}
                </Field>
              </div>

              <div>
                <Label className="mb-1 block">Access Scope</Label>
                <Field
                  as={Select}
                  name="scopeType"
                >
                  <option value="organization">Entire Organization</option>
                  <option value="legal_entity">Legal Entity Only</option>
                  <option value="branch">Assigned Branch Only</option>
                  <option value="department">Assigned Department Only</option>
                  <option value="team">Assigned Team Only</option>
                  <option value="self">Self (Employee Portal)</option>
                </Field>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-hairline">
              <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" isLoading={isSubmitting}>
                Create User
              </Button>
            </div>
          </Form>
        )}
      </Formik>
    </Dialog>
  );
}
