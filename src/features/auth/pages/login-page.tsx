import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { validateWithZod } from '../../../lib/formik-zod-adapter';
import { loginSchema, LoginFormValues } from '../schemas/auth.schema';
import { useLogin, useSeedAdmin } from '../api/auth-api';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Checkbox } from '../../../components/ui/checkbox';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../../components/ui/card';
import { Compass, Lock, Mail, CheckCircle2 } from 'lucide-react';

export function LoginPage() {
  const navigate = useNavigate();
  const loginMutation = useLogin();
  const seedMutation = useSeedAdmin();
  const [seedMessage, setSeedMessage] = useState<string | null>(null);

  const initialValues: LoginFormValues = {
    email: '',
    password: '',
    rememberMe: false,
  };

  const handleSubmit = async (values: LoginFormValues) => {
    try {
      await loginMutation.mutateAsync(values);
      navigate('/dashboard');
    } catch {
      // Error handled by react-query error state
    }
  };

  const handleSeedAdmin = async () => {
    try {
      const res = await seedMutation.mutateAsync();
      setSeedMessage(res.message || 'Admin seeded successfully.');
    } catch {
      setSeedMessage('Failed to initialize admin account.');
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col justify-center items-center p-4">
      {/* Brand Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center h-14 w-14 rounded-none bg-[#1c69d4] text-white mb-4">
          <Compass className="h-7 w-7 text-white" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-[#262626] tracking-tight">
          Sri Lanka HRMS
        </h1>
        <p className="text-sm text-[#6b6b6b] mt-1 font-light">
          Statutory Compliance & Enterprise People Operations Platform
        </p>
      </div>

      {/* Login Card */}
      <Card className="w-full max-w-md bg-white border border-[#cccccc] rounded-none p-8">
        <CardHeader className="pb-4 px-0 pt-0">
          <CardTitle className="text-xl font-bold text-[#262626]">Sign In to Your Workspace</CardTitle>
          <CardDescription className="text-sm text-[#6b6b6b] font-light">
            Enter your company credentials to access your organization portal.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 px-0 pb-0">
          {/* Seed Notice if triggered */}
          {seedMessage && (
            <div className="rounded-none bg-[#f7f7f7] border border-[#e6e6e6] p-3 text-xs text-[#262626] flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-[#22c55e]" />
              <span>{seedMessage} (Default: <code>admin@ceylonholdings.lk</code> / <code>Admin@2026!Secure</code>)</span>
            </div>
          )}

          {/* Login Error Notification */}
          {loginMutation.isError && (
            <div className="rounded-none bg-red-50 border border-red-200 p-3 text-xs text-[#dc2626] font-bold">
              {(loginMutation.error as any)?.message || 'Invalid email or password. Please try again.'}
            </div>
          )}

          <Formik
            initialValues={initialValues}
            validate={validateWithZod(loginSchema)}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting, errors, touched, setFieldValue }) => (
              <Form className="space-y-4">
                {/* Email Field */}
                <div>
                  <Label htmlFor="email" className="font-bold text-xs uppercase tracking-[0.5px] text-[#262626]">Work Email</Label>
                  <div className="relative mt-1">
                    <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-[#9a9a9a] pointer-events-none" />
                    <Field
                      id="email"
                      name="email"
                      as={Input}
                      type="email"
                      placeholder="yourname@company.lk"
                      className="pl-10"
                      hasError={touched.email && !!errors.email}
                    />
                  </div>
                  <ErrorMessage name="email" component="p" className="mt-1 text-xs text-[#dc2626] font-bold" />
                </div>

                {/* Password Field */}
                <div>
                  <Label htmlFor="password" className="font-bold text-xs uppercase tracking-[0.5px] text-[#262626]">Password</Label>
                  <div className="relative mt-1">
                    <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-[#9a9a9a] pointer-events-none" />
                    <Field
                      id="password"
                      name="password"
                      as={Input}
                      type="password"
                      placeholder="••••••••"
                      className="pl-10"
                      hasError={touched.password && !!errors.password}
                    />
                  </div>
                  <ErrorMessage name="password" component="p" className="mt-1 text-xs text-[#dc2626] font-bold" />
                </div>

                {/* Options */}
                <div className="flex items-center justify-between text-xs text-[#6b6b6b] pt-1">
                  <label className="flex items-center gap-2.5 cursor-pointer select-none">
                    <Field name="rememberMe">
                      {({ field, form }: any) => (
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={(checked) => form.setFieldValue('rememberMe', !!checked)}
                        />
                      )}
                    </Field>
                    <span>Remember this session (30 days)</span>
                  </label>
                </div>

                {/* Submit Action */}
                <Button
                  type="submit"
                  variant="primary"
                  size="default"
                  className="w-full justify-center text-sm font-bold uppercase tracking-[0.5px] mt-3"
                  isLoading={isSubmitting || loginMutation.isPending}
                >
                  Sign In to HRMS
                </Button>

                {/* Quick Auto-Fill / Seed Helper */}
                <div className="pt-4 border-t border-[#e6e6e6] text-center space-y-2">
                  <p className="text-xs text-[#6b6b6b] font-light">First time setting up your local workspace?</p>
                  <div className="flex items-center justify-center gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleSeedAdmin}
                      isLoading={seedMutation.isPending}
                      className="text-xs text-[#262626] font-bold inline-flex items-center gap-1.5"
                    >
                      <Compass className="h-3.5 w-3.5 text-[#1c69d4]" />
                      <span>Initialize Default Admin</span>
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setFieldValue('email', 'admin@ceylonholdings.lk');
                        setFieldValue('password', 'Admin@2026!Secure');
                      }}
                      className="text-xs text-[#6b6b6b] hover:text-[#262626] font-bold"
                    >
                      Auto-fill Admin
                    </Button>
                  </div>
                </div>
              </Form>
            )}
          </Formik>
        </CardContent>
      </Card>
    </div>
  );
}
