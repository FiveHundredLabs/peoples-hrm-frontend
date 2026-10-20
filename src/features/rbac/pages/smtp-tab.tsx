import { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { Mail, RefreshCw, CheckCircle2, AlertCircle, Zap, Shield, Send } from 'lucide-react';
import { useSmtpConfig, useUpdateSmtpConfig, useTestSmtpConnection } from '../api/smtp-api';
import { smtpSchema, SmtpFormValues } from '../schemas/smtp.schema';
import { validateWithZod } from '../../../lib/formik-zod-adapter';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Checkbox } from '../../../components/ui/checkbox';
import { LoadingState } from '../../../components/shared/loading-state';
import { SmtpTestResult } from '../types/smtp';

interface PresetProvider {
  name: string;
  host: string;
  port: number;
  secure: boolean;
  auth: boolean;
}

const PROVIDER_PRESETS: PresetProvider[] = [
  { name: 'Google / Gmail', host: 'smtp.gmail.com', port: 587, secure: false, auth: true },
  { name: 'Microsoft 365', host: 'smtp.office365.com', port: 587, secure: false, auth: true },
  { name: 'SendGrid', host: 'smtp.sendgrid.net', port: 587, secure: false, auth: true },
  { name: 'Amazon SES', host: 'email-smtp.ap-south-1.amazonaws.com', port: 587, secure: false, auth: true },
  { name: 'Custom Server', host: '', port: 587, secure: false, auth: true },
];

export function SmtpTab() {
  const { data: config, isLoading, isError, refetch } = useSmtpConfig();
  const updateMutation = useUpdateSmtpConfig();
  const testMutation = useTestSmtpConnection();

  const [testRecipient, setTestRecipient] = useState('');
  const [testResult, setTestResult] = useState<SmtpTestResult | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (isLoading) {
    return <LoadingState message="Loading SMTP configuration..." />;
  }

  if (isError) {
    return (
      <div className="border border-[#dc2626]/20 bg-[#dc2626]/5 p-6 text-center text-sm text-[#dc2626]">
        Failed to load SMTP configuration from server.
        <div className="mt-3">
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const initialValues: SmtpFormValues = {
    host: config?.host || '',
    port: config?.port || 587,
    secure: config?.secure ?? false,
    username: config?.username || '',
    password: config?.hasPassword ? '••••••••' : '',
    fromName: config?.fromName || "People's HR Notifications",
    fromEmail: config?.fromEmail || '',
    requireAuth: config?.requireAuth ?? true,
    enabled: config?.enabled ?? true,
  };

  const handleSave = async (values: SmtpFormValues) => {
    setSaveSuccess(false);
    setTestResult(null);
    try {
      await updateMutation.mutateAsync(values);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch {
      // Handled by mutation
    }
  };

  const handleRunTest = async (currentValues: SmtpFormValues) => {
    setTestResult(null);
    try {
      const result = await testMutation.mutateAsync({
        recipientEmail: testRecipient.trim() || undefined,
        host: currentValues.host,
        port: currentValues.port,
        secure: currentValues.secure,
        username: currentValues.username,
        password: currentValues.password,
        fromName: currentValues.fromName,
        fromEmail: currentValues.fromEmail,
        requireAuth: currentValues.requireAuth,
      });
      setTestResult(result);
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err?.response?.data?.message || err.message || 'Connection test failed',
      });
    }
  };

  return (
    <div className="space-y-4 max-w-full">
      <Formik
        initialValues={initialValues}
        validate={validateWithZod(smtpSchema)}
        onSubmit={handleSave}
        enableReinitialize
      >
        {({ values, errors, touched, setFieldValue, isSubmitting }) => (
          <Form className="space-y-4">
            {/* Status & Preset Header Bar */}
            <div className="border border-[#e6e6e6] bg-white p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center bg-[#1c69d4]/10 text-[#1c69d4]">
                  <Mail className="h-4 w-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-ink">SMTP Engine</span>
                    {config?.isConfigured ? (
                      <span className="inline-flex items-center gap-1 bg-[#10b981]/10 px-2 py-0.5 text-[11px] font-semibold text-[#059669]">
                        <CheckCircle2 className="h-3 w-3" /> Configured
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

              {/* Quick Preset Pills */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-xs text-ink-mute mr-1 flex items-center gap-1">
                  <Shield className="h-3 w-3 text-[#1c69d4]" /> Presets:
                </span>
                {PROVIDER_PRESETS.map((p) => {
                  const isSelected = values.host === p.host && values.port === p.port && p.host !== '';
                  return (
                    <button
                      key={p.name}
                      type="button"
                      onClick={() => {
                        if (p.host) {
                          setFieldValue('host', p.host);
                          setFieldValue('port', p.port);
                          setFieldValue('secure', p.secure);
                          setFieldValue('requireAuth', p.auth);
                        }
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

            {/* Main Grid: Server Credentials (Left) & Test / Save (Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
              {/* Left Form: Server Credentials (8 cols) */}
              <div className="lg:col-span-8 border border-[#e6e6e6] bg-white p-4 space-y-3.5">
                <div className="flex items-center justify-between pb-2 border-b border-[#e6e6e6]">
                  <span className="text-xs font-bold text-ink uppercase tracking-wider">Server Parameters</span>
                  <span className="text-[11px] text-ink-mute flex items-center gap-1 font-mono">
                    <Zap className="h-3 w-3 text-[#1c69d4]" /> BullMQ Queue
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <Label className="mb-1 block">SMTP Host *</Label>
                    <Field
                      name="host"
                      as={Input}
                      placeholder="e.g. smtp.gmail.com"
                      hasError={touched.host && !!errors.host}
                    />
                    <ErrorMessage name="host" component="p" className="mt-1 text-xs text-[#dc2626]" />
                  </div>

                  <div>
                    <Label className="mb-1 block">Port *</Label>
                    <Field
                      name="port"
                      as={Input}
                      type="number"
                      placeholder="587"
                      hasError={touched.port && !!errors.port}
                    />
                    <ErrorMessage name="port" component="p" className="mt-1 text-xs text-[#dc2626]" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <Label className="mb-1 block">Username</Label>
                    <Field
                      name="username"
                      as={Input}
                      placeholder="e.g. notifications@company.com"
                      hasError={touched.username && !!errors.username}
                    />
                    <ErrorMessage name="username" component="p" className="mt-1 text-xs text-[#dc2626]" />
                  </div>

                  <div>
                    <Label className="mb-1 block">Password / App Password</Label>
                    <Field
                      name="password"
                      as={Input}
                      type="password"
                      placeholder={config?.hasPassword ? '•••••••• (unchanged)' : 'Enter SMTP password'}
                      hasError={touched.password && !!errors.password}
                    />
                    <ErrorMessage name="password" component="p" className="mt-1 text-xs text-[#dc2626]" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[#e6e6e6]">
                  <div>
                    <Label className="mb-1 block">Sender Display Name *</Label>
                    <Field
                      name="fromName"
                      as={Input}
                      placeholder="e.g. People's HR"
                      hasError={touched.fromName && !!errors.fromName}
                    />
                    <ErrorMessage name="fromName" component="p" className="mt-1 text-xs text-[#dc2626]" />
                  </div>

                  <div>
                    <Label className="mb-1 block">Sender Email Address *</Label>
                    <Field
                      name="fromEmail"
                      as={Input}
                      type="email"
                      placeholder="e.g. no-reply@company.com"
                      hasError={touched.fromEmail && !!errors.fromEmail}
                    />
                    <ErrorMessage name="fromEmail" component="p" className="mt-1 text-xs text-[#dc2626]" />
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-5 pt-2 border-t border-[#e6e6e6]">
                  <label className="inline-flex items-center gap-1.5 text-xs font-medium text-ink cursor-pointer select-none">
                    <Checkbox
                      checked={values.secure}
                      onCheckedChange={(checked) => setFieldValue('secure', Boolean(checked))}
                    />
                    <span>SSL/TLS (Port 465)</span>
                  </label>

                  <label className="inline-flex items-center gap-1.5 text-xs font-medium text-ink cursor-pointer select-none">
                    <Checkbox
                      checked={values.requireAuth}
                      onCheckedChange={(checked) => setFieldValue('requireAuth', Boolean(checked))}
                    />
                    <span>Require Auth</span>
                  </label>

                  <label className="inline-flex items-center gap-1.5 text-xs font-medium text-ink cursor-pointer select-none">
                    <Checkbox
                      checked={values.enabled}
                      onCheckedChange={(checked) => setFieldValue('enabled', Boolean(checked))}
                    />
                    <span>Enable Outbound Mail</span>
                  </label>
                </div>
              </div>

              {/* Right Column: Live Testing & Direct Save (4 cols) */}
              <div className="lg:col-span-4 border border-[#e6e6e6] bg-white p-4 space-y-3.5">
                <div className="flex items-center justify-between pb-2 border-b border-[#e6e6e6]">
                  <span className="text-xs font-bold text-ink uppercase tracking-wider flex items-center gap-1.5">
                    <Send className="h-3.5 w-3.5 text-[#1c69d4]" /> Live Test
                  </span>
                </div>

                <div>
                  <Label className="mb-1 block text-xs">Recipient Email (Optional)</Label>
                  <Input
                    type="email"
                    value={testRecipient}
                    onChange={(e) => setTestRecipient(e.target.value)}
                    placeholder="name@company.com"
                    className="text-xs h-9"
                  />
                  <p className="mt-1 text-[10px] text-ink-mute">
                    Leave blank to test handshake only, or provide an email to send a test message.
                  </p>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleRunTest(values)}
                  isLoading={testMutation.isPending}
                  className="w-full text-xs h-9"
                >
                  <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                  {testRecipient ? 'Test & Send Email' : 'Test Handshake'}
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
                          {testResult.success ? 'Verified' : 'Failed'}
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
                    Save Configuration
                  </Button>

                  {saveSuccess && (
                    <div className="text-center text-xs font-bold text-[#059669] flex items-center justify-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Settings saved!
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
}
