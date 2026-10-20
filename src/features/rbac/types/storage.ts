export type StorageProviderType = 'local' | 's3' | 'supabase' | 'firebase' | 'r2' | 'minio';

export interface StorageConfig {
  isConfigured: boolean;
  provider: StorageProviderType;
  localPath: string;
  bucketName?: string;
  region?: string;
  endpoint?: string;
  accessKeyId?: string;
  hasSecretKey: boolean;
  maskedSecretKey?: string;
  forcePathStyle: boolean;
  publicBaseUrl?: string;
  firebaseProjectId?: string;
  firebaseClientEmail?: string;
  hasFirebaseKey: boolean;
  maskedFirebaseKey?: string;
  maxFileSizeMb: number;
  allowedExtensions: string[];
  enabled: boolean;
  updatedAt?: string;
}

export interface UpdateStorageConfigPayload {
  provider: StorageProviderType;
  localPath?: string;
  bucketName?: string;
  region?: string;
  endpoint?: string;
  accessKeyId?: string;
  secretAccessKey?: string;
  forcePathStyle?: boolean;
  publicBaseUrl?: string;
  firebaseProjectId?: string;
  firebaseClientEmail?: string;
  firebasePrivateKey?: string;
  maxFileSizeMb?: number;
  allowedExtensions?: string[];
  enabled?: boolean;
}

export interface TestStoragePayload {
  provider?: StorageProviderType;
  localPath?: string;
  bucketName?: string;
  region?: string;
  endpoint?: string;
  accessKeyId?: string;
  secretAccessKey?: string;
  forcePathStyle?: boolean;
  firebaseProjectId?: string;
  firebaseClientEmail?: string;
  firebasePrivateKey?: string;
}

export interface StorageTestResult {
  success: boolean;
  message: string;
  responseTimeMs?: number;
  provider: string;
  probeDetails?: {
    writeSuccess?: boolean;
    readSuccess?: boolean;
    deleteSuccess?: boolean;
    pathOrBucket?: string;
  };
}
