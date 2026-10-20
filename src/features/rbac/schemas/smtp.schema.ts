import { z } from 'zod';

export const smtpSchema = z.object({
  host: z.string().min(2, 'SMTP host is required (e.g. smtp.gmail.com)'),
  port: z.number().int().min(1, 'Port must be at least 1').max(65535, 'Invalid port'),
  secure: z.boolean().default(false),
  username: z.string().optional(),
  password: z.string().optional(),
  fromName: z.string().min(2, 'Sender name is required'),
  fromEmail: z.string().email('Please enter a valid sender email address'),
  requireAuth: z.boolean().default(true),
  enabled: z.boolean().default(true),
});

export type SmtpFormValues = z.infer<typeof smtpSchema>;
