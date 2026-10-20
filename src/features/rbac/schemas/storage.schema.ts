import { z } from 'zod';

export const storageSchema = z.object({
  provider: z.enum(['local', 's3', 'supabase', 'firebase', 'r2', 'minio']),
  localPath: z.string().default('./uploads'),
  bucketName: z.string().optional(),
  region: z.string().default('ap-south-1'),
  endpoint: z.string().optional(),
  accessKeyId: z.string().optional(),
  secretAccessKey: z.string().optional(),
  forcePathStyle: z.boolean().default(false),
  publicBaseUrl: z.string().optional(),
  firebaseProjectId: z.string().optional(),
  firebaseClientEmail: z.string().optional(),
  firebasePrivateKey: z.string().optional(),
  maxFileSizeMb: z.number().int().min(1, 'Minimum 1 MB').max(500, 'Maximum 500 MB').default(25),
  allowedExtensions: z.array(z.string()).default(['jpg', 'jpeg', 'png', 'webp', 'pdf', 'docx', 'xlsx', 'csv']),
  enabled: z.boolean().default(true),
}).superRefine((data, ctx) => {
  if (data.provider === 'local') {
    if (!data.localPath || data.localPath.trim().length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['localPath'],
        message: 'Local directory path is required (e.g. ./uploads)',
      });
    }
  } else if (data.provider === 'firebase') {
    if (!data.firebaseProjectId || data.firebaseProjectId.trim().length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['firebaseProjectId'],
        message: 'Firebase Project ID is required',
      });
    }
  } else {
    // S3, Supabase, R2, MinIO
    if (!data.bucketName || data.bucketName.trim().length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['bucketName'],
        message: 'Bucket name is required',
      });
    }
  }
});

export type StorageFormValues = z.infer<typeof storageSchema>;
