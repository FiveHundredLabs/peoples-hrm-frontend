import { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { Dialog } from '../../../components/ui/dialog';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { validateWithZod } from '../../../lib/formik-zod-adapter';
import { createRoleSchema, CreateRoleFormValues } from '../../auth/schemas/auth.schema';
import { Permission } from '../../auth/types/auth';
import { useCreateRole, useAssignPermissions } from '../../auth/data/auth-data';

export interface RoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  permissions: Permission[];
}

export function RoleModal({ isOpen, onClose, permissions }: RoleModalProps) {
  const createMutation = useCreateRole();
  const [selectedPerms, setSelectedPerms] = useState<string[]>([]);
  const assignPermissionsMutation = useAssignPermissions('');

  const initialValues: CreateRoleFormValues = {
    code: '',
    name: '',
    description: '',
    sensitivity: 'normal',
    active: true,
  };

  const handleTogglePerm = (permId: string) => {
    setSelectedPerms((prev) =>
      prev.includes(permId) ? prev.filter((id) => id !== permId) : [...prev, permId],
    );
  };

  const handleSubmit = async (values: CreateRoleFormValues) => {
    const role = await createMutation.mutateAsync(values);
    if (selectedPerms.length > 0 && role?.id) {
      await assignPermissionsMutation.mutateAsync(selectedPerms);
    }
    onClose();
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Create Custom Role"
      description="Create custom role."
      maxWidth="lg"
    >
      <Formik
        initialValues={initialValues}
        validate={validateWithZod(createRoleSchema)}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting, errors, touched }) => (
          <Form className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Code */}
              <div>
                <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-1">
                  Role Code *
                </label>
                <Field
                  name="code"
                  as={Input}
                  placeholder="e.g. PAYROLL_OFFICER"
                  hasError={touched.code && !!errors.code}
                />
                <ErrorMessage name="code" component="p" className="mt-1 text-xs text-semantic-error font-medium" />
              </div>

              {/* Name */}
              <div>
                <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-1">
                  Role Name *
                </label>
                <Field
                  name="name"
                  as={Input}
                  placeholder="e.g. Payroll Operations Officer"
                  hasError={touched.name && !!errors.name}
                />
                <ErrorMessage name="name" component="p" className="mt-1 text-xs text-semantic-error font-medium" />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-1">
                Description
              </label>
              <Field
                name="description"
                as={Input}
                placeholder="Explain the scope and purpose of this role..."
              />
            </div>

            {/* Permissions Matrix */}
            <div className="pt-2 border-t border-hairline">
              <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-2">
                Granted System Permissions ({selectedPerms.length} selected)
              </label>
              <div className="max-h-48 overflow-y-auto rounded-none border border-hairline bg-canvas-cream/50 p-3 space-y-2">
                {permissions.length === 0 ? (
                  <p className="text-xs text-ink-mute">No permissions loaded.</p>
                ) : (
                  permissions.map((p) => (
                    <label
                      key={p.id}
                      className="flex items-center justify-between p-2 rounded-none bg-canvas hover:bg-canvas-soft cursor-pointer transition-colors border border-hairline/50 text-xs"
                    >
                      <div>
                        <div className="font-mono font-bold text-primary">{p.code}</div>
                        <div className="text-ink-mute text-[11px]">{p.description || p.action}</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={selectedPerms.includes(p.id)}
                        onChange={() => handleTogglePerm(p.id)}
                        className="rounded text-primary h-4 w-4"
                      />
                    </label>
                  ))
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-hairline">
              <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" variant="primary-pill" isLoading={isSubmitting}>
                Create Role
              </Button>
            </div>
          </Form>
        )}
      </Formik>
    </Dialog>
  );
}
