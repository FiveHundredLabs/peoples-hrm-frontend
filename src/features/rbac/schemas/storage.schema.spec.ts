import { describe, it, expect } from 'vitest';
import { storageSchema } from './storage.schema';

describe('storageSchema', () => {
  it('validates local disk storage successfully', () => {
    const result = storageSchema.safeParse({
      provider: 'local',
      localPath: './uploads',
      maxFileSizeMb: 25,
      allowedExtensions: ['jpg', 'png', 'pdf'],
      enabled: true,
    });

    expect(result.success).toBe(true);
  });

  it('fails if localPath is empty for local provider', () => {
    const result = storageSchema.safeParse({
      provider: 'local',
      localPath: '',
      maxFileSizeMb: 25,
    });

    expect(result.success).toBe(false);
  });

  it('validates s3 / supabase storage successfully with bucketName', () => {
    const result = storageSchema.safeParse({
      provider: 'supabase',
      bucketName: 'avatars-and-docs',
      endpoint: 'https://xxx.supabase.co/storage/v1/s3',
      region: 'ap-southeast-1',
      accessKeyId: 'test-key',
      maxFileSizeMb: 50,
      enabled: true,
    });

    expect(result.success).toBe(true);
  });

  it('fails if bucketName is missing for S3 provider', () => {
    const result = storageSchema.safeParse({
      provider: 's3',
      bucketName: '',
      region: 'ap-south-1',
    });

    expect(result.success).toBe(false);
  });

  it('validates firebase storage successfully with firebaseProjectId', () => {
    const result = storageSchema.safeParse({
      provider: 'firebase',
      firebaseProjectId: 'my-hr-project',
      maxFileSizeMb: 25,
      enabled: true,
    });

    expect(result.success).toBe(true);
  });
});
