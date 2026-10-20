import { ZodType, ZodError } from 'zod';
import { FormikErrors } from 'formik';

/**
 * Adapter that connects Zod schemas to Formik validate function.
 * Converts Zod issues to Formik nested error objects without requiring Yup.
 */
export function validateWithZod<T extends Record<string, unknown>>(
  schema: ZodType<T>,
): (values: T) => FormikErrors<T> | undefined {
  return (values: T): FormikErrors<T> | undefined => {
    const result = schema.safeParse(values);
    if (result.success) {
      return undefined;
    }

    const errors: FormikErrors<T> = {};
    const zodError = result.error as ZodError;

    for (const issue of zodError.issues) {
      const path = issue.path;
      if (path.length === 0) continue;

      let current: Record<string, unknown> = errors as Record<string, unknown>;
      for (let i = 0; i < path.length; i++) {
        const key = String(path[i]);
        if (i === path.length - 1) {
          current[key] = issue.message;
        } else {
          if (!current[key] || typeof current[key] !== 'object') {
            current[key] = {};
          }
          current = current[key] as Record<string, unknown>;
        }
      }
    }

    return errors;
  };
}
