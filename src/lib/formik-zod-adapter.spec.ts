import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import { validateWithZod } from './formik-zod-adapter';

describe('validateWithZod', () => {
  const schema = z.object({
    email: z.string().email('Invalid email address'),
    age: z.number().min(18, 'Must be at least 18'),
  });

  const validator = validateWithZod(schema);

  it('returns undefined when validation passes', () => {
    const errors = validator({ email: 'user@example.com', age: 25 });
    expect(errors).toBeUndefined();
  });

  it('returns field errors when validation fails', () => {
    const errors = validator({ email: 'invalid-email', age: 15 });
    expect(errors).toBeDefined();
    expect(errors?.email).toBe('Invalid email address');
    expect(errors?.age).toBe('Must be at least 18');
  });
});
