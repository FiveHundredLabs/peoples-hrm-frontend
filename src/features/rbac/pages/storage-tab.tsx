import { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import {
  HardDrive,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Shield,
  Send,
  Cloud,
  FolderOpen,
  Layers,
  Database,
  Flame,
} from 'lucide-react';
import { useStorageConfig, useUpdateStorageConfig, useTestStorageConnection } from '../data/storage-data';
import { storageSchema, StorageFormValues } from '../schemas/storage.schema';
import { StorageProviderType, StorageTestResult } from '../types/storage';
import { validateWithZod } from '../../../lib/formik-zod-adapter';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Checkbox } from '../../../components/ui/checkbox';
import { LoadingState } from '../../../components/shared/loading-state';

interface StoragePreset {
  name: string;
  provider: StorageProviderType;
  icon: React.ComponentType<{ className?: string }>;
  desc: string;
  defaults: Partial<StorageFormValues>;
}

const STORAGE_PRESETS: StoragePreset[] = [
  {
    name: 'Local Server Disk',
    provider: 'local',
    icon: FolderOpen,
    desc: 'Default for SMBs (Free / On-Premise)',
    defaults: {
      provider: 'local',
      localPath: './uploads',
      publicBaseUrl: '/uploads',
    },
  },
  {
    name: 'AWS S3',
    provider: 's3',
    icon: Cloud,
    desc: 'Amazon Web Services S3 Bucket',
    defaults: {
      provider: 's3',
      region: 'ap-south-1',
      endpoint: '',
      forcePathStyle: false,
    },
  },
  {
    name: 'Supabase Storage',
    provider: 'supabase',
    icon: Database,
    desc: 'Supabase S3-Compatible Storage',
    defaults: {
      provider: 'supabase',
      region: 'ap-southeast-1',
      endpoint: 'https://xxx.supabase.co/storage/v1/s3',
      forcePathStyle: true,
    },
  },
  {
    name: 'Firebase Storage',
    provider: 'firebase',
    icon: Flame,
    desc: 'Google Firebase / AppSpot Bucket',
    defaults: {
      provider: 'firebase',
    },
  },
  {
    name: 'Cloudflare R2',
    provider: 'r2',
    icon: Layers,
    desc: 'Zero-egress S3 Storage',
    defaults: {
      provider: 'r2',
      region: 'auto',
      endpoint: 'https://xxx.r2.cloudflarestorage.com',
      forcePathStyle: false,
    },
  },
  {
    name: 'MinIO Storage',
    provider: 'minio',
    icon: HardDrive,
    desc: 'Self-hosted S3 server',
    defaults: {
      provider: 'minio',
      region: 'us-east-1',
      endpoint: 'http://localhost:9000',
      forcePathStyle: true,
    },
  },
];

export function StorageTab() {
  const { data: config, isLoading, isError, refetch } = useStorageConfig();
  const updateMutation = useUpdateStorageConfig();
  const testMutation = useTestStorageConnection();

  const [testResult, setTestResult] = useState<StorageTestResult | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (isLoading) {
    return <LoadingState message="Loading Storage configuration..." />;
  }

  if (isError) {
    return (
      <div className="border border-[#dc2626]/20 bg-[#dc2626]/5 p-6 text-center text-sm text-[#dc2626]">
        Failed to load Storage configuration from server.
        <div className="mt-3">
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const initialValues: StorageFormValues = {
    provider: config?.provider || 'local',
    localPath: config?.localPath || './uploads',
    bucketName: config?.bucketName || '',
    region: config?.region || 'ap-south-1',
    endpoint: config?.endpoint || '',
    accessKeyId: config?.accessKeyId || '',
    secretAccessKey: config?.hasSecretKey ? '••••••••' : '',
    forcePathStyle: config?.forcePathStyle ?? false,
    publicBaseUrl: config?.publicBaseUrl || '',
    firebaseProjectId: config?.firebaseProjectId || '',
    firebaseClientEmail: config?.firebaseClientEmail || '',
    firebasePrivateKey: config?.hasFirebaseKey ? '••••••••' : '',
    maxFileSizeMb: config?.maxFileSizeMb ?? 25,
    allowedExtensions: config?.allowedExtensions || ['jpg', 'jpeg', 'png', 'webp', 'pdf', 'docx', 'xlsx', 'csv'],
    enabled: config?.enabled ?? true,
  };

  const handleSave = async (values: StorageFormValues) => {
    setSaveSuccess(false);
    setTestResult(null);
    try {
      await updateMutation.mutateAsync(values);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch {
      // Handled by query mutation
    }
  };

  const handleRunTest = async (currentValues: StorageFormValues) => {
    setTestResult(null);
    try {
      const result = await testMutation.mutateAsync({
        provider: currentValues.provider,
        localPath: currentValues.localPath,
        bucketName: currentValues.bucketName,
        region: currentValues.region,
        endpoint: currentValues.endpoint,
        accessKeyId: currentValues.accessKeyId,
        secretAccessKey: currentValues.secretAccessKey,
        forcePathStyle: currentValues.forcePathStyle,
        firebaseProjectId: currentValues.firebaseProjectId,
        firebaseClientEmail: currentValues.firebaseClientEmail,
        firebasePrivateKey: currentValues.firebasePrivateKey,
      });
      setTestResult(result);
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err?.response?.data?.message || err.message || 'Storage connection test failed',
        provider: currentValues.provider,
      });
    }
  };

  return (
    <div className="space-y-4 max-w-full">
      <Formik
        initialValues={initialValues}
        validate={validateWithZod(storageSchema)}
        onSubmit={handleSave}
        enableReinitialize
      >
        {({ values, errors, touched, setFieldValue, isSubmitting }) => {
          const isLocal = values.provider === 'local';
          const isFirebase = values.provider === 'firebase';
          const isS3Like = !isLocal && !isFirebase;

          return (
            <Form className="space-y-4">
              {/* Status & Preset Header Bar */}
              <div className="border border-[#e6e6e6] bg-white p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center bg-[#1c69d4]/10 text-[#1c69d4]">
                    <HardDrive className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-ink">Storage Provider</span>
                      {config?.isConfigured ? (
                        <span className="inline-flex items-center gap-1 bg-[#10b981]/10 px-2 py-0.5 text-[11px] font-semibold text-[#059669]">
                          <CheckCircle2 className="h-3 w-3" /> Configured ({config.provider.toUpperCase()})
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-[#f59e0b]/10 px-2 py-0.5 text-[11px] font-semibold text-[#d97706]">
                          <AlertCircle className="h-3 w-3" /> Not Configured
                        </span>
                      )}
                      {values.enabled ? (
                        <span className="bg-[#1c69d4]/10 px-1.5 py-0.2 text-[10px] font-medium text-[#1c69d4]">Active</span>
                      ) : (
                        <span className="bg-[#6b6b6b]/10 px-1.5 py-0.2 text-[10px] font-medium text-[#6b6b6b]">Disabled</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Quick Preset Selector */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-xs text-ink-mute mr-1 flex items-center gap-1">
                    <Shield className="h-3 w-3 text-[#1c69d4]" /> Presets:
                  </span>
                  {STORAGE_PRESETS.map((p) => {
                    const isSelected = values.provider === p.provider;
                    return (
                      <button
                        key={p.name}
                        type="button"
                        onClick={() => {
                          setFieldValue('provider', p.provider);
                          if (p.defaults.localPath !== undefined) setFieldValue('localPath', p.defaults.localPath);
                          if (p.defaults.region !== undefined) setFieldValue('region', p.defaults.region);
                          if (p.defaults.endpoint !== undefined) setFieldValue('endpoint', p.defaults.endpoint);
                          if (p.defaults.forcePathStyle !== undefined) setFieldValue('forcePathStyle', p.defaults.forcePathStyle);
                          if (p.defaults.publicBaseUrl !== undefined) setFieldValue('publicBaseUrl', p.defaults.publicBaseUrl);
                        }}
                        className={`px-2.5 py-1 text-xs border transition-colors cursor-pointer select-none ${
                          isSelected
                            ? 'border-[#1c69d4] bg-[#1c69d4] text-white font-medium'
                            : 'border-[#e6e6e6] bg-[#fafafa] text-ink hover:bg-[#f0f0f0]'
                        }`}
                      >
                        {p.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Main Grid: Provider Parameters (Left) & Test / Save (Right) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
                {/* Left Column: Provider Settings (8 cols) */}
                <div className="lg:col-span-8 border border-[#e6e6e6] bg-white p-4 space-y-3.5">
                  <div className="flex items-center justify-between pb-2 border-b border-[#e6e6e6]">
                    <span className="text-xs font-bold text-ink uppercase tracking-wider">
                      {isLocal && 'Local Server Disk Configuration'}
                      {isFirebase && 'Firebase Storage Configuration'}
                      {isS3Like && `${values.provider.toUpperCase()} Object Storage Parameters`}
                    </span>
                    <span className="text-[11px] text-ink-mute font-mono">
                      Max: {values.maxFileSizeMb} MB
                    </span>
                  </div>

                  {/* 1. Local Server Disk Fields */}
                  {isLocal && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <Label className="mb-1 block">Local Upload Directory *</Label>
                          <Field
                            name="localPath"
                            as={Input}
                            placeholder="./uploads"
                            hasError={touched.localPath && !!errors.localPath}
                          />
                          <ErrorMessage name="localPath" component="p" className="mt-1 text-xs text-[#dc2626]" />
                          <p className="mt-1 text-[11px] text-ink-mute">
                            Absolute or relative path on server disk where documents & avatars will be stored.
                          </p>
                        </div>

                        <div>
                          <Label className="mb-1 block">Public URL Route Prefix</Label>
                          <Field
                            name="publicBaseUrl"
                            as={Input}
                            placeholder="/uploads"
                            hasError={touched.publicBaseUrl && !!errors.publicBaseUrl}
                          />
                          <ErrorMessage name="publicBaseUrl" component="p" className="mt-1 text-xs text-[#dc2626]" />
                          <p className="mt-1 text-[11px] text-ink-mute">
                            Public endpoint route for accessing uploaded media assets.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 2. S3 / Supabase / Cloudflare R2 / MinIO Fields */}
                  {isS3Like && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="sm:col-span-2">
                          <Label className="mb-1 block">Bucket Name *</Label>
                          <Field
                            name="bucketName"
                            as={Input}
                            placeholder="e.g. peoples-hr-storage"
                            hasError={touched.bucketName && !!errors.bucketName}
                          />
                          <ErrorMessage name="bucketName" component="p" className="mt-1 text-xs text-[#dc2626]" />
                        </div>

                        <div>
                          <Label className="mb-1 block">Region</Label>
                          <Field
                            name="region"
                            as={Input}
                            placeholder="e.g. ap-south-1"
                            hasError={touched.region && !!errors.region}
                          />
                          <ErrorMessage name="region" component="p" className="mt-1 text-xs text-[#dc2626]" />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <Label className="mb-1 block">Custom Endpoint (Supabase / R2 / MinIO)</Label>
                          <Field
                            name="endpoint"
                            as={Input}
                            placeholder="e.g. https://xxx.supabase.co/storage/v1/s3"
                            hasError={touched.endpoint && !!errors.endpoint}
                          />
                          <ErrorMessage name="endpoint" component="p" className="mt-1 text-xs text-[#dc2626]" />
                        </div>

                        <div>
                          <Label className="mb-1 block">Public CDN URL Base (Optional)</Label>
                          <Field
                            name="publicBaseUrl"
                            as={Input}
                            placeholder="e.g. https://cdn.company.lk"
                            hasError={touched.publicBaseUrl && !!errors.publicBaseUrl}
                          />
                          <ErrorMessage name="publicBaseUrl" component="p" className="mt-1 text-xs text-[#dc2626]" />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[#e6e6e6]">
                        <div>
                          <Label className="mb-1 block">Access Key ID / S3 Key</Label>
                          <Field
                            name="accessKeyId"
                            as={Input}
                            placeholder="e.g. AKIA..."
                            hasError={touched.accessKeyId && !!errors.accessKeyId}
                          />
                          <ErrorMessage name="accessKeyId" component="p" className="mt-1 text-xs text-[#dc2626]" />
                        </div>

                        <div>
                          <Label className="mb-1 block">Secret Access Key</Label>
                          <Field
                            name="secretAccessKey"
                            as={Input}
                            type="password"
                            placeholder={config?.hasSecretKey ? '•••••••• (unchanged)' : 'Enter Secret Key'}
                            hasError={touched.secretAccessKey && !!errors.secretAccessKey}
                          />
                          <ErrorMessage name="secretAccessKey" component="p" className="mt-1 text-xs text-[#dc2626]" />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 3. Firebase Storage Fields */}
                  {isFirebase && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <Label className="mb-1 block">Firebase Project ID *</Label>
                          <Field
                            name="firebaseProjectId"
                            as={Input}
                            placeholder="e.g. peoples-hr-app"
                            hasError={touched.firebaseProjectId && !!errors.firebaseProjectId}
                          />
                          <ErrorMessage name="firebaseProjectId" component="p" className="mt-1 text-xs text-[#dc2626]" />
                        </div>

                        <div>
                          <Label className="mb-1 block">Firebase Client Email</Label>
                          <Field
                            name="firebaseClientEmail"
                            as={Input}
                            placeholder="firebase-adminsdk@...iam.gserviceaccount.com"
                            hasError={touched.firebaseClientEmail && !!errors.firebaseClientEmail}
                          />
                          <ErrorMessage name="firebaseClientEmail" component="p" className="mt-1 text-xs text-[#dc2626]" />
                        </div>
                      </div>

                      <div>
                        <Label className="mb-1 block">Firebase Private Key</Label>
                        <Field
                          name="firebasePrivateKey"
                          as={Input}
                          type="password"
                          placeholder={config?.hasFirebaseKey ? '•••••••• (unchanged)' : 'Enter Private Key'}
                          hasError={touched.firebasePrivateKey && !!errors.firebasePrivateKey}
                        />
                        <ErrorMessage name="firebasePrivateKey" component="p" className="mt-1 text-xs text-[#dc2626]" />
                      </div>
                    </div>
                  )}

                  {/* Limits & Options Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-[#e6e6e6]">
                    <div>
                      <Label className="mb-1 block">Max File Size (MB) *</Label>
                      <Field
                        name="maxFileSizeMb"
                        as={Input}
                        type="number"
                        placeholder="25"
                        hasError={touched.maxFileSizeMb && !!errors.maxFileSizeMb}
                      />
                      <ErrorMessage name="maxFileSizeMb" component="p" className="mt-1 text-xs text-[#dc2626]" />
                    </div>

                    <div className="sm:col-span-2">
                      <Label className="mb-1 block">Allowed Extensions</Label>
                      <Field
                        name="allowedExtensions"
                        value={Array.isArray(values.allowedExtensions) ? values.allowedExtensions.join(', ') : ''}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          const exts = e.target.value
                            .split(',')
                            .map((x) => x.trim().replace(/^\./, ''))
                            .filter(Boolean);
                          setFieldValue('allowedExtensions', exts);
                        }}
                        as={Input}
                        placeholder="jpg, jpeg, png, webp, pdf, docx, xlsx, csv"
                      />
                      <p className="mt-1 text-[10px] text-ink-mute">Comma-separated list of permitted extensions.</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-5 pt-2 border-t border-[#e6e6e6]">
                    {isS3Like && (
                      <label className="inline-flex items-center gap-1.5 text-xs font-medium text-ink cursor-pointer select-none">
                        <Checkbox
                          checked={values.forcePathStyle}
                          onCheckedChange={(checked) => setFieldValue('forcePathStyle', Boolean(checked))}
                        />
                        <span>Force Path Style (MinIO / Local S3)</span>
                      </label>
                    )}

                    <label className="inline-flex items-center gap-1.5 text-xs font-medium text-ink cursor-pointer select-none">
                      <Checkbox
                        checked={values.enabled}
                        onCheckedChange={(checked) => setFieldValue('enabled', Boolean(checked))}
                      />
                      <span>Enable Storage Service</span>
                    </label>
                  </div>
                </div>

                {/* Right Column: Live Probe Testing & Save (4 cols) */}
                <div className="lg:col-span-4 border border-[#e6e6e6] bg-white p-4 space-y-3.5">
                  <div className="flex items-center justify-between pb-2 border-b border-[#e6e6e6]">
                    <span className="text-xs font-bold text-ink uppercase tracking-wider flex items-center gap-1.5">
                      <Send className="h-3.5 w-3.5 text-[#1c69d4]" /> Storage Probe Test
                    </span>
                  </div>

                  <p className="text-xs text-ink-mute">
                    Tests write, read, and delete permissions on the active storage provider before saving.
                  </p>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleRunTest(values)}
                    isLoading={testMutation.isPending}
                    className="w-full text-xs h-9"
                  >
                    <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                    Test Storage Probe
                  </Button>

                  {testResult && (
                    <div
                      className={`p-2.5 text-xs border ${
                        testResult.success
                          ? 'border-[#10b981]/30 bg-[#10b981]/5 text-[#065f46]'
                          : 'border-[#dc2626]/30 bg-[#dc2626]/5 text-[#991b1b]'
                      }`}
                    >
                      <div className="flex items-start gap-1.5">
                        {testResult.success ? (
                          <CheckCircle2 className="h-3.5 w-3.5 text-[#10b981] shrink-0 mt-0.5" />
                        ) : (
                          <AlertCircle className="h-3.5 w-3.5 text-[#dc2626] shrink-0 mt-0.5" />
                        )}
                        <div className="space-y-0.5 min-w-0">
                          <div className="font-bold text-[11px]">
                            {testResult.success ? 'Probe Verified' : 'Probe Failed'}
                          </div>
                          <div className="text-[11px] leading-tight break-words">{testResult.message}</div>
                          {testResult.responseTimeMs !== undefined && (
                            <div className="text-[10px] text-ink-mute font-mono">
                              Latency: {testResult.responseTimeMs}ms
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="pt-2 border-t border-[#e6e6e6] space-y-2">
                    <Button
                      type="submit"
                      variant="primary"
                      isLoading={isSubmitting || updateMutation.isPending}
                      className="w-full h-10 text-sm font-bold"
                    >
                      Save Storage Config
                    </Button>

                    {saveSuccess && (
                      <div className="text-center text-xs font-bold text-[#059669] flex items-center justify-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Storage settings saved!
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Form>
          );
        }}
      </Formik>
    </div>
  );
}
