import { defaults, initialResources } from './defaults';
import type { MockDatabase, MockRecord } from './types';

export const MOCK_STORAGE_KEY = 'peoples-hrm-mock-v1';
export const DEMO_EMAIL = 'admin@ceylonholdings.lk';
export const DEMO_PASSWORD = 'Admin@2026!Secure';

export function createSeed(): MockDatabase {
  const db = structuredClone(initialResources);
  // Collections without curated examples start empty, but still support local creation.
  for (const key of Object.keys(db)) if (Array.isArray(db[key])) db[key] = [];
  const seed = (key: string, records: MockRecord[]) => {
    db[key] = records.map(record => ({ ...structuredClone(defaults[key] || {}), ...record }));
  };
  seed('/organization/legal-entities', [{ id: '3aac49d4-f3ac-4e55-856f-d03fe3bfabe1', code: 'CH', legalName: 'Ceylon Holdings (Demo)', displayName: 'Ceylon Holdings' }]);
  seed('/organization/branches', [{ id: '287bba5a-8757-48d6-822c-0c51aaae2dc1', code: 'CMB', name: 'Colombo Office', city: 'Colombo' }]);
  seed('/organization/departments', [
    { id: '2096bbf4-3f68-4181-8f54-cfeea6ae7ae7', code: 'ENG', name: 'Engineering', branchId: '287bba5a-8757-48d6-822c-0c51aaae2dc1' },
    { id: '710a24dd-95e4-4d9e-8e59-37beb63a4e33', code: 'HR', name: 'Human Resources', branchId: '287bba5a-8757-48d6-822c-0c51aaae2dc1' },
  ]);
  seed('/organization/jobs', [{ id: '262f4bd0-eab0-4d33-8e65-983509cd319b', code: 'SE', title: 'Software Engineer' }]);
  seed('/organization/positions', [{ id: '6dea1fe6-adde-4ce9-8eba-e2c56b3abefb', code: 'SE-01', titleOverride: 'Software Engineer', departmentId: '2096bbf4-3f68-4181-8f54-cfeea6ae7ae7', headcountLimit: 5, fte: '1' }]);
  seed('/organization/teams', [{ id: 'd68b97ee-9a82-437f-890a-2bd99ef9fce5', code: 'PLATFORM', name: 'Platform Team' }]);
  seed('/organization/work-locations', [{ id: 'c81ce290-2122-4603-87bb-e691406706b9', code: 'HQ', name: 'Colombo Headquarters', branchId: '287bba5a-8757-48d6-822c-0c51aaae2dc1' }]);
  seed('/organization/holiday-calendars', [{ id: '73626d8d-8d0b-4451-89ff-9fdd2a81f19c', code: 'DEMO-2026', name: 'Demo Company Calendar', year: 2026 }]);
  seed('/employees', [
    { id: 'd97deb14-01f4-4093-84af-dd347d687b52', employeeNumber: 'EMP-001', firstName: 'Nimal', lastName: 'Perera', displayName: 'Nimal Perera', companyEmail: 'nimal@example.com', departmentId: '2096bbf4-3f68-4181-8f54-cfeea6ae7ae7' },
    { id: '4abc0bbf-3d53-40fc-893a-7042814d5d78', employeeNumber: 'EMP-002', firstName: 'Anjali', lastName: 'Silva', displayName: 'Anjali Silva', companyEmail: 'anjali@example.com', departmentId: '710a24dd-95e4-4d9e-8e59-37beb63a4e33' },
    { id: 'aa9bb9fb-a1d1-4fb6-8d53-4f4a9af3a36e', employeeNumber: 'EMP-003', firstName: 'Kavindu', lastName: 'Fernando', displayName: 'Kavindu Fernando', companyEmail: 'kavindu@example.com', departmentId: '2096bbf4-3f68-4181-8f54-cfeea6ae7ae7' },
  ].map(employee => ({ ...employee, hireDate: '2022-04-01', legalEntityId: '3aac49d4-f3ac-4e55-856f-d03fe3bfabe1',
    employmentRecords: [{ id: employee.id.replace(/^./, 'e'), employeeId: employee.id, legalEntityId: '3aac49d4-f3ac-4e55-856f-d03fe3bfabe1', employmentType: 'permanent', status: 'active', hireDate: '2022-04-01' }],
    assignments: [{ id: employee.id.replace(/^./, 'b'), employeeId: employee.id, employmentRecordId: employee.id.replace(/^./, 'e'), assignmentType: 'primary', departmentId: employee.departmentId, branchId: '287bba5a-8757-48d6-822c-0c51aaae2dc1', positionId: '6dea1fe6-adde-4ce9-8eba-e2c56b3abefb', title: employee.departmentId === '710a24dd-95e4-4d9e-8e59-37beb63a4e33' ? 'HR Executive' : 'Software Engineer', fte: 1, effectiveFrom: '2022-04-01' }],
  })));
  seed('/rbac/users', [{ id: 'f39a3852-e7a1-4085-80b9-826474358be0', email: DEMO_EMAIL, username: 'Demo Admin', status: 'active', locale: 'en', employeeId: '4abc0bbf-3d53-40fc-893a-7042814d5d78' }]);
  seed('/rbac/roles', [{ id: '08a1f075-adb8-465a-8071-dec4cb7bd1ac', code: 'SUPER_ADMIN', name: 'Demo Administrator' }]);
  seed('/rbac/permissions', [{ id: 'a4788dc5-84f9-47a7-8ed1-9f834b2c2ed1', code: 'employees.read', resource: 'employees', action: 'read' }]);
  seed('/rbac/user-role-assignments', [{ id: '0d3705dd-c99e-4200-8082-ed6503fbcebd', userId: 'f39a3852-e7a1-4085-80b9-826474358be0', roleId: '08a1f075-adb8-465a-8071-dec4cb7bd1ac', scopeType: 'organization' }]);
  seed('/assets/categories', [{ id: '80cd9118-31fe-44f7-862a-d37e18e6722c', code: 'LAPTOP', name: 'Laptops' }]);
  seed('/assets', [
    { id: 'aee9df6d-7eb7-4c7a-8472-0b985159561d', assetTag: 'IT-001', name: 'Dell Latitude 5450', make: 'Dell', status: 'available', branchId: '287bba5a-8757-48d6-822c-0c51aaae2dc1', purchaseCost: 250000 },
    { id: '529ca6a6-b125-4477-8350-fc06de45176c', assetTag: 'IT-002', name: 'Lenovo ThinkPad', make: 'Lenovo', status: 'assigned', branchId: '287bba5a-8757-48d6-822c-0c51aaae2dc1', purchaseCost: 280000 },
  ]);
  seed('/assets/assignments/list', [{ id: 'd80508a9-694b-493c-8aa4-f29c01080120', assetId: '529ca6a6-b125-4477-8350-fc06de45176c', employeeId: 'd97deb14-01f4-4093-84af-dd347d687b52', issueCondition: 'New' }]);
  seed('/attendance/shifts', [{ id: '58446cc3-f08b-4d8c-83ab-9bf3790e7bd1', code: 'DAY', name: 'Office Day Shift', startTime: '08:30', endTime: '17:30', graceInMinutes: 10 }]);
  seed('/attendance/devices', [{ id: 'aecea593-cc83-4485-8d9b-7426d9dea396', name: 'Demo Office Entrance', externalDeviceId: 'DEMO-DEVICE', branchId: '287bba5a-8757-48d6-822c-0c51aaae2dc1' }]);
  seed('/attendance/daily-logs', [{ id: '57c99960-75fa-4fa7-8d2b-c8855d66a3b9', workedMinutes: 480, paidMinutes: 480, locked: false }]);
  seed('/leave/types', [{ id: '925d8f17-46ae-4dfa-833a-d0c9a3f20bf8', code: 'ANNUAL', name: 'Annual Leave', category: 'annual' }]);
  seed('/leave/entitlements', [{ id: '806ee847-05e5-49fd-84d7-3b1e1f39e04d', allocated: 14, currentBalance: 14 }]);
  seed('/leave/requests', [{ id: 'dbe064d2-0997-4932-861c-34fb75925115', status: 'pending', requestedQuantity: 1, reason: 'Personal appointment' }]);
  seed('/compensation/components', [{ id: '5a67165d-434a-4add-80d9-aa30cc524265', code: 'BASIC', name: 'Basic Salary' }]);
  seed('/compensation/plans', [{ id: '0fd3840c-b6f6-4ca9-8aea-e39e4d0eaf9b', code: 'MONTHLY', name: 'Monthly Staff Plan', frequency: 'monthly' }]);
  seed('/compensation/assignments', [{ id: 'fba91b0f-4381-4ce2-8096-427e481f2c5a', baseSalary: 150000, payFrequency: 'monthly' }]);
  seed('/compensation/benefits', [{ id: '6cedb13a-c6db-4eb8-8c20-bec464f3e70d', code: 'MEDICAL', name: 'Medical Cover', category: 'insurance' }]);
  seed('/payroll/runs', [{ id: '972fbe8d-d5f8-4b21-8d49-11ea872ebb2c', runNumber: 'DEMO-OCT-2026', status: 'draft', periodStart: '2026-10-01', periodEnd: '2026-10-31', payDate: '2026-10-25' }]);
  seed('/loans/types', [{ id: '9bb465b2-f551-4e35-8b67-2c37f2928812', code: 'STAFF', name: 'Staff Loan', interestMethod: 'none' }]);
  seed('/expenses/policies', [{ id: '13f5d290-a02f-4b4a-898a-bc1d32dd9573', code: 'TRAVEL', name: 'Travel Expenses', categoryRules: { categories: ['travel', 'meals'] } }]);
  seed('/recruitment/requisitions', [{ id: 'bbe6fbbd-24a9-43dc-8975-5a9d6a1bd801', openings: 2, status: 'open', departmentId: '2096bbf4-3f68-4181-8f54-cfeea6ae7ae7' }]);
  seed('/recruitment/candidates', [{ id: '07a7e6d6-7340-4cc6-8211-a2e6340de475', firstName: 'Dilini', lastName: 'Jayasinghe', email: 'dilini@example.com', currentTitle: 'Software Engineer' }]);
  seed('/recruitment/applications', [{ id: 'fd04c1ac-b31e-4afc-80c2-3a6bdcc1b453', status: 'applied', currentStage: 'Screening' }]);
  seed('/performance/cycles', [{ id: '20bbacf0-4d2e-418d-897b-105012d06f41', code: '2026', name: '2026 Annual Review', startsOn: '2026-01-01', endsOn: '2026-12-31' }]);
  seed('/performance/rating-scales', [{ id: '658bd2ec-4115-4741-818b-064b664806a2', code: 'FIVE', name: 'Five Point Scale', minValue: 1, maxValue: 5 }]);
  seed('/performance/goals', [{ id: '349446b3-98f9-4f6c-85a4-2325e52ad356', title: 'Complete onboarding documentation', goalType: 'individual', targetValue: 100, performanceCycleId: '20bbacf0-4d2e-418d-897b-105012d06f41' }]);
  seed('/learning/courses', [{ id: 'c0966af1-5d7a-43eb-8a39-88da1e6de2fd', code: 'SECURITY', title: 'Security Awareness', category: 'compliance', provider: 'Internal Training' }]);
  seed('/learning/assignments', [{ id: '273c82ab-d918-43d3-8b72-c77ef670eebe', status: 'assigned' }]);
  seed('/hr-relations/types', [{ id: '41b7eb1a-13cc-4e9e-8b24-21ec51a4a128', code: 'GRIEVANCE', name: 'Employee Grievance' }]);
  seed('/policies', [{ id: '2cdd95e1-ef20-4219-8686-c1ed970e9d73', code: 'CONDUCT', title: 'Code of Conduct', currentVersion: 1 }]);
  seed('/policies/versions', [{ id: '2309596a-e43f-4fa2-849e-d4dd77896a7b', policyDocumentId: '2cdd95e1-ef20-4219-8686-c1ed970e9d73', versionNo: 1, effectiveFrom: '2026-01-01', acknowledgementRequired: true }]);
  seed('/helpdesk/tickets', [{ id: '8faa7f73-c484-4009-86d0-064df5668fcf', ticketNumber: 'HD-001', category: 'general', subject: 'Update emergency contact', description: 'Please help me update my contact details.', status: 'open', priority: 'normal' }]);
  seed('/lifecycle/skills', [{ id: 'f9e58aa7-3ab3-4580-89b9-de344d0d777e', code: 'TS', name: 'TypeScript', active: true }]);
  db['/operations/settings'] = [];
  db['/settings/storage'] = { ...defaults['/settings/storage'], localPath: 'browser', maxFileSizeMb: 2, allowedExtensions: ['jpg', 'jpeg', 'png', 'webp', 'pdf', 'docx', 'xlsx', 'csv'] };
  db['/settings/smtp'] = { ...defaults['/settings/smtp'], isConfigured: false, enabled: false, host: 'mock.local', port: 587, fromName: 'HRMS Demo', fromEmail: DEMO_EMAIL };
  db['/health'] = { status: 'ok', service: 'Browser mock data', uptime: 0, timestamp: new Date().toISOString() };
  db['/health/detailed'] = { ...defaults['/health/detailed'], status: 'ok', environment: 'mock', timestamp: new Date().toISOString(), database: { status: 'not_configured' } };
  db['/operations/diagnostics'] = { ...defaults['/operations/diagnostics'], status: 'ok', environment: 'mock', nodeVersion: 'Browser', timestamp: new Date().toISOString(), subsystems: { database: { status: 'local', latencyMs: 0, engine: 'Browser storage' }, redis: { status: 'not_configured', latencyMs: 0, role: 'unused' }, bullmq: { status: 'not_configured', queue: 'unused', backlog: 0 } } };
  for (const [key, record] of Object.entries(db)) {
    if (key.startsWith('/reports/') && !Array.isArray(record)) {
      if (record.summary) for (const field of Object.keys(record.summary)) record.summary[field] = 0;
      if ('title' in record) record.title = 'Demo report (sample data only)';
    }
  }
  db['/reports/analytics/demographics'] = { ...defaults['/reports/analytics/demographics'], totalHeadcount: 3, activeEmployees: 3, averageTenureYears: 4, turnoverRateMonthly: '0%', departmentBreakdown: { Engineering: 2, 'Human Resources': 1 } };
  return db;
}
