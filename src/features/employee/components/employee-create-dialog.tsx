import { Select } from '../../../components/ui/select';
import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import { validateWithZod } from '../../../lib/formik-zod-adapter';
import { Dialog } from '../../../components/ui/dialog';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import {
  createEmployeeSchema,
  CreateEmployeeFormValues,
} from '../schemas/employee.schema';
import { useCreateEmployee } from '../api/employee-api';
import { useLegalEntities, useDepartments, useBranches, usePositions } from '../../organization/api/organization-api';
import { CreditCard, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';

interface EmployeeCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const EmployeeCreateDialog: React.FC<EmployeeCreateDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const [activeStep, setActiveStep] = useState<1 | 2 | 3>(1);
  const [nicFeedback, setNicFeedback] = useState<string | null>(null);

  const { data: legalEntitiesData } = useLegalEntities();
  const { data: departmentsData } = useDepartments();
  const { data: branchesData } = useBranches();
  const { data: positionsData } = usePositions();

  const legalEntities = legalEntitiesData?.data || [];
  const departments = departmentsData?.data || [];
  const branches = branchesData?.data || [];
  const positions = positionsData?.data || [];

  const createMutation = useCreateEmployee();

  const formik = useFormik<CreateEmployeeFormValues>({
    initialValues: {
      employeeNumber: '',
      firstName: '',
      middleName: '',
      lastName: '',
      preferredName: '',
      companyEmail: '',
      personalEmail: '',
      companyPhone: '',
      personalPhone: '',
      hireDate: new Date().toISOString().split('T')[0],
      lifecycleStatus: 'probation',
      legalEntityId: '',
      employmentType: 'permanent',
      branchId: '',
      departmentId: '',
      positionId: '',
      jobTitle: '',
      nationalId: '',
      passportNumber: '',
      dateOfBirth: '',
      gender: '',
      maritalStatus: '',
      nationality: 'Sri Lankan',
      epfMemberNumber: '',
      etfMemberReference: '',
      tin: '',
      bankName: 'Commercial Bank of Ceylon',
      branchName: '',
      accountHolderName: '',
      accountNumber: '',
    },
    validate: validateWithZod(createEmployeeSchema),
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        await createMutation.mutateAsync(values);
        resetForm();
        setActiveStep(1);
        setNicFeedback(null);
        onOpenChange(false);
      } catch (err: any) {
        console.error('Failed to create employee', err);
      } finally {
        setSubmitting(false);
      }
    },
  });

  // Set default legal entity if available
  useEffect(() => {
    if (legalEntities.length > 0 && !formik.values.legalEntityId) {
      formik.setFieldValue('legalEntityId', legalEntities[0].id);
    }
  }, [legalEntities, formik.values.legalEntityId]);

  // Live Sri Lankan NIC evaluation
  const handleNicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.trim();
    formik.setFieldValue('nationalId', raw);

    const isOld = /^[0-9]{9}[vVxX]$/.test(raw);
    const isNew = /^[0-9]{12}$/.test(raw);

    if (isOld || isNew) {
      let year: number;
      let dayOfYear: number;
      if (isOld) {
        year = 1900 + parseInt(raw.substring(0, 2), 10);
        dayOfYear = parseInt(raw.substring(2, 5), 10);
      } else {
        year = parseInt(raw.substring(0, 4), 10);
        dayOfYear = parseInt(raw.substring(4, 7), 10);
      }

      const gender = dayOfYear > 500 ? 'female' : 'male';
      if (dayOfYear > 500) dayOfYear -= 500;

      const monthDays = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
      let month = 0;
      let day = dayOfYear;
      for (let i = 0; i < monthDays.length; i++) {
        if (day <= monthDays[i]) {
          month = i + 1;
          break;
        }
        day -= monthDays[i];
      }

      if (month > 0 && day > 0) {
        const mm = String(month).padStart(2, '0');
        const dd = String(day).padStart(2, '0');
        const calculatedDob = `${year}-${mm}-${dd}`;
        formik.setFieldValue('dateOfBirth', calculatedDob);
        formik.setFieldValue('gender', gender);
        setNicFeedback(`Valid ${isOld ? 'Legacy (9V/X)' : 'Modern (12-digit)'} NIC: DOB ${calculatedDob}, Gender: ${gender}`);
        return;
      }
    }
    setNicFeedback(null);
  };

  return (
    <Dialog
      isOpen={open}
      onClose={() => onOpenChange(false)}
      title="Onboard New Employee"
      description="Register a new employee with Sri Lankan NIC, statutory profile, and job assignment."
      maxWidth="lg"
    >
      <div className="max-h-[75vh] overflow-y-auto pr-1">
        {/* Step Indicator */}
        <div className="my-2 flex items-center justify-between border-b border-hairline pb-3">
          <button
            type="button"
            onClick={() => setActiveStep(1)}
            className={`flex items-center gap-2 text-xs font-semibold ${
              activeStep === 1 ? 'text-primary font-bold' : 'text-ink-mute hover:text-ink'
            }`}
          >
            <span
              className={`flex h-6 w-6 items-center justify-center rounded-none text-xs ${
                activeStep === 1 ? 'bg-[#1c69d4] text-white font-bold rounded-none' : 'bg-canvas-soft text-ink-mute'
              }`}
            >
              1
            </span>
            Identity & Personal
          </button>
          <div className="h-0.5 flex-1 bg-hairline mx-2" />
          <button
            type="button"
            onClick={() => setActiveStep(2)}
            className={`flex items-center gap-2 text-xs font-semibold ${
              activeStep === 2 ? 'text-primary font-bold' : 'text-ink-mute hover:text-ink'
            }`}
          >
            <span
              className={`flex h-6 w-6 items-center justify-center rounded-none text-xs ${
                activeStep === 2 ? 'bg-[#1c69d4] text-white font-bold rounded-none' : 'bg-canvas-soft text-ink-mute'
              }`}
            >
              2
            </span>
            Employment & Role
          </button>
          <div className="h-0.5 flex-1 bg-hairline mx-2" />
          <button
            type="button"
            onClick={() => setActiveStep(3)}
            className={`flex items-center gap-2 text-xs font-semibold ${
              activeStep === 3 ? 'text-primary font-bold' : 'text-ink-mute hover:text-ink'
            }`}
          >
            <span
              className={`flex h-6 w-6 items-center justify-center rounded-none text-xs ${
                activeStep === 3 ? 'bg-[#1c69d4] text-white font-bold rounded-none' : 'bg-canvas-soft text-ink-mute'
              }`}
            >
              3
            </span>
            Statutory & Banking
          </button>
        </div>

        <form onSubmit={formik.handleSubmit} className="space-y-4 pt-1">
          {createMutation.isError && (
            <div className="flex items-center gap-2 rounded-none bg-red-50 p-3 text-xs text-red-700 border border-red-200">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
              <span>
                {Array.isArray((createMutation.error as any)?.response?.data?.message)
                  ? (createMutation.error as any).response.data.message.join(' • ')
                  : (createMutation.error as any)?.response?.data?.message || (createMutation.error as any)?.message || 'Failed to save employee profile.'}
              </span>
            </div>
          )}

          {/* STEP 1: IDENTITY & PERSONAL */}
          {activeStep === 1 && (
            <div className="space-y-3 animate-in fade-in duration-200">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="employeeNumber">Employee ID / Number *</Label>
                  <Input
                    id="employeeNumber"
                    name="employeeNumber"
                    placeholder="e.g. EMP-00101"
                    value={formik.values.employeeNumber}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    hasError={Boolean(formik.touched.employeeNumber && formik.errors.employeeNumber)}
                  />
                  {formik.touched.employeeNumber && formik.errors.employeeNumber && (
                    <p className="text-[11px] text-red-500 mt-0.5">{formik.errors.employeeNumber}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="nationalId">Sri Lankan NIC (National ID)</Label>
                  <Input
                    id="nationalId"
                    name="nationalId"
                    placeholder="e.g. 199012345678 or 852341234V"
                    value={formik.values.nationalId}
                    onChange={handleNicChange}
                    onBlur={formik.handleBlur}
                    hasError={Boolean(formik.touched.nationalId && formik.errors.nationalId)}
                  />
                  {nicFeedback && (
                    <p className="flex items-center gap-1 text-[11px] text-emerald-600 mt-0.5">
                      <CheckCircle2 className="h-3 w-3" />
                      {nicFeedback}
                    </p>
                  )}
                  {formik.touched.nationalId && formik.errors.nationalId && (
                    <p className="text-[11px] text-red-500 mt-0.5">{formik.errors.nationalId}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    placeholder="First Name"
                    value={formik.values.firstName}
                    onChange={(e) => {
                      formik.handleChange(e);
                      if (!formik.values.accountHolderName) {
                        formik.setFieldValue('accountHolderName', `${e.target.value} ${formik.values.lastName || ''}`.trim());
                      }
                    }}
                    onBlur={formik.handleBlur}
                    hasError={Boolean(formik.touched.firstName && formik.errors.firstName)}
                  />
                  {formik.touched.firstName && formik.errors.firstName && (
                    <p className="text-[11px] text-red-500 mt-0.5">{formik.errors.firstName}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    placeholder="Last Name"
                    value={formik.values.lastName}
                    onChange={(e) => {
                      formik.handleChange(e);
                      if (!formik.values.accountHolderName) {
                        formik.setFieldValue('accountHolderName', `${formik.values.firstName || ''} ${e.target.value}`.trim());
                      }
                    }}
                    onBlur={formik.handleBlur}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <Input
                    type="date"
                    id="dateOfBirth"
                    name="dateOfBirth"
                    value={formik.values.dateOfBirth}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                </div>

                <div>
                  <Label htmlFor="gender">Gender</Label>
                  <Select
                    id="gender"
                    name="gender"
                    value={formik.values.gender}
                    onChange={formik.handleChange}
                    
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="maritalStatus">Marital Status</Label>
                  <Select
                    id="maritalStatus"
                    name="maritalStatus"
                    value={formik.values.maritalStatus}
                    onChange={formik.handleChange}
                    
                  >
                    <option value="">Select Status</option>
                    <option value="single">Single</option>
                    <option value="married">Married</option>
                    <option value="divorced">Divorced</option>
                    <option value="widowed">Widowed</option>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="companyEmail">Company Email</Label>
                  <Input
                    type="email"
                    id="companyEmail"
                    name="companyEmail"
                    placeholder="kasun@ceylonholdings.lk"
                    value={formik.values.companyEmail}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                </div>

                <div>
                  <Label htmlFor="companyPhone">Phone / Mobile</Label>
                  <Input
                    id="companyPhone"
                    name="companyPhone"
                    placeholder="+94 77 123 4567"
                    value={formik.values.companyPhone}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: EMPLOYMENT & ROLE */}
          {activeStep === 2 && (
            <div className="space-y-3 animate-in fade-in duration-200">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="legalEntityId">Legal Entity *</Label>
                  <Select
                    id="legalEntityId"
                    name="legalEntityId"
                    value={formik.values.legalEntityId}
                    onChange={formik.handleChange}
                    
                  >
                    <option value="">Select Legal Entity</option>
                    {legalEntities.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.legalName} ({e.code})
                      </option>
                    ))}
                  </Select>
                  {formik.touched.legalEntityId && formik.errors.legalEntityId && (
                    <p className="text-[11px] text-red-500 mt-0.5">{formik.errors.legalEntityId}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="employmentType">Employment Type *</Label>
                  <Select
                    id="employmentType"
                    name="employmentType"
                    value={formik.values.employmentType}
                    onChange={formik.handleChange}
                    
                  >
                    <option value="permanent">Permanent</option>
                    <option value="probationary">Probationary</option>
                    <option value="fixed_term">Fixed Term Contract</option>
                    <option value="casual">Casual</option>
                    <option value="trainee">Trainee / Intern</option>
                    <option value="consultant">Consultant</option>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="hireDate">Date of Joining / Hire Date *</Label>
                  <Input
                    type="date"
                    id="hireDate"
                    name="hireDate"
                    value={formik.values.hireDate}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                </div>

                <div>
                  <Label htmlFor="lifecycleStatus">Initial Status</Label>
                  <Select
                    id="lifecycleStatus"
                    name="lifecycleStatus"
                    value={formik.values.lifecycleStatus}
                    onChange={formik.handleChange}
                    
                  >
                    <option value="probation">On Probation</option>
                    <option value="active">Active</option>
                    <option value="planned">Planned (Future)</option>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="departmentId">Department</Label>
                  <Select
                    id="departmentId"
                    name="departmentId"
                    value={formik.values.departmentId}
                    onChange={formik.handleChange}
                    
                  >
                    <option value="">Select Department</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </Select>
                </div>

                <div>
                  <Label htmlFor="branchId">Branch / Location</Label>
                  <Select
                    id="branchId"
                    name="branchId"
                    value={formik.values.branchId}
                    onChange={formik.handleChange}
                    
                  >
                    <option value="">Select Branch</option>
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="positionId">Position Code</Label>
                  <Select
                    id="positionId"
                    name="positionId"
                    value={formik.values.positionId}
                    onChange={formik.handleChange}
                    
                  >
                    <option value="">Select Position</option>
                    {positions.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.code} - {p.titleOverride || 'Position'}
                      </option>
                    ))}
                  </Select>
                </div>

                <div>
                  <Label htmlFor="jobTitle">Job Title / Designation</Label>
                  <Input
                    id="jobTitle"
                    name="jobTitle"
                    placeholder="e.g. Senior Software Engineer"
                    value={formik.values.jobTitle}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: STATUTORY & BANKING */}
          {activeStep === 3 && (
            <div className="space-y-3 animate-in fade-in duration-200">
              <div className="rounded-none border border-hairline bg-canvas-lavender/30 p-3 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-ink">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  Sri Lanka Statutory Details (EPF / ETF / APIT)
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <Label htmlFor="epfMemberNumber">EPF Member No</Label>
                    <Input
                      id="epfMemberNumber"
                      name="epfMemberNumber"
                      placeholder="e.g. EPF-884920"
                      value={formik.values.epfMemberNumber}
                      onChange={formik.handleChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor="etfMemberReference">ETF Ref No</Label>
                    <Input
                      id="etfMemberReference"
                      name="etfMemberReference"
                      placeholder="e.g. ETF-993011"
                      value={formik.values.etfMemberReference}
                      onChange={formik.handleChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor="tin">Taxpayer TIN (9-digits)</Label>
                    <Input
                      id="tin"
                      name="tin"
                      placeholder="e.g. 109283746"
                      value={formik.values.tin}
                      onChange={formik.handleChange}
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-none border border-hairline bg-canvas-lavender/30 p-3 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-ink">
                  <CreditCard className="h-4 w-4 text-primary" />
                  Primary Bank Account (Salary Direct Credit)
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="bankName">Bank Name</Label>
                    <Input
                      id="bankName"
                      name="bankName"
                      placeholder="e.g. Commercial Bank of Ceylon"
                      value={formik.values.bankName}
                      onChange={formik.handleChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor="branchName">Branch Name</Label>
                    <Input
                      id="branchName"
                      name="branchName"
                      placeholder="e.g. Kollupitiya"
                      value={formik.values.branchName}
                      onChange={formik.handleChange}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="accountHolderName">Account Name</Label>
                    <Input
                      id="accountHolderName"
                      name="accountHolderName"
                      placeholder="Name as in Passbook"
                      value={formik.values.accountHolderName}
                      onChange={formik.handleChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor="accountNumber">Account Number</Label>
                    <Input
                      id="accountNumber"
                      name="accountNumber"
                      placeholder="e.g. 8001928374"
                      value={formik.values.accountNumber}
                      onChange={formik.handleChange}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="pt-2 flex justify-between border-t border-hairline">
            {activeStep > 1 ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setActiveStep((prev) => (prev - 1) as any)}
              >
                Previous Step
              </Button>
            ) : (
              <div />
            )}

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              {activeStep < 3 ? (
                <Button
                  type="button"
                  variant="primary-pill"
                  size="sm"
                  onClick={() => setActiveStep((prev) => (prev + 1) as any)}
                >
                  Next Step
                </Button>
              ) : (
                <Button
                  type="submit"
                  variant="primary-pill"
                  size="sm"
                  disabled={formik.isSubmitting}
                >
                  {formik.isSubmitting ? 'Onboarding...' : 'Save & Onboard'}
                </Button>
              )}
            </div>
          </div>
        </form>
      </div>
    </Dialog>
  );
};
