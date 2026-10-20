import { createBrowserRouter, Navigate } from 'react-router-dom';
import { Layout } from '../components/shared/layout';
import { DashboardPage } from '../features/dashboard/pages/dashboard-page';
import { HealthPage } from '../features/health/pages/health-page';
import { OrganizationHubPage } from '../features/organization/pages/organization-hub-page';
import { LoginPage } from '../features/auth/pages/login-page';
import { RbacHubPage } from '../features/rbac/pages/rbac-hub-page';
import { EmployeeListPage } from '../features/employee/pages/employee-list-page';
import { EmployeeDetailPage } from '../features/employee/pages/employee-detail-page';
import { LifecycleHubPage } from '../features/lifecycle/pages/lifecycle-hub-page';
import { AttendanceHubPage } from '../features/attendance/pages/attendance-hub-page';
import { LeaveHubPage } from '../features/leave/pages/leave-hub-page';
import { CompensationHubPage } from '../features/compensation/pages/compensation-hub-page';
import { PayrollHubPage } from '../features/payroll/pages/payroll-hub-page';
import { ExpensesLoansHubPage } from '../features/expenses-and-loans/pages/expenses-loans-hub-page';
import { FinalSettlementHubPage } from '../features/final-settlement/pages/final-settlement-hub-page';
import { ReportingHubPage } from '../features/reporting/pages/reporting-hub-page';
import { RecruitmentHubPage } from '../features/recruitment/pages/recruitment-hub-page';
import { PerformanceHubPage } from '../features/performance/pages/performance-hub-page';
import { LearningHubPage } from '../features/learning/pages/learning-hub-page';
import { AssetHubPage } from '../features/asset/pages/asset-hub-page';
import { HrRelationsHubPage } from '../features/hr-relations/pages/hr-relations-hub-page';
import { PolicyHubPage } from '../features/policy/pages/policy-hub-page';
import { HelpdeskHubPage } from '../features/helpdesk/pages/helpdesk-hub-page';
import { PrivacyHubPage } from '../features/privacy/pages/privacy-hub-page';
import { OperationsHubPage } from '../features/operations/pages/operations-hub-page';
import { Button } from '../components/ui/button';
import { Link } from 'react-router-dom';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: <DashboardPage />,
      },
      {
        path: 'health',
        element: <HealthPage />,
      },
      {
        path: 'organization/*',
        element: <OrganizationHubPage />,
      },
      {
        path: 'employees',
        element: <EmployeeListPage />,
      },
      {
        path: 'employees/:id',
        element: <EmployeeDetailPage />,
      },
      {
        path: 'lifecycle',
        element: <LifecycleHubPage />,
      },
      {
        path: 'attendance/*',
        element: <AttendanceHubPage />,
      },
      {
        path: 'leave/*',
        element: <LeaveHubPage />,
      },
      {
        path: 'compensation/*',
        element: <CompensationHubPage />,
      },
      {
        path: 'payroll/*',
        element: <PayrollHubPage />,
      },
      {
        path: 'expenses/*',
        element: <ExpensesLoansHubPage />,
      },
      {
        path: 'loans/*',
        element: <ExpensesLoansHubPage />,
      },
      {
        path: 'settlements/*',
        element: <FinalSettlementHubPage />,
      },
      {
        path: 'reports/*',
        element: <ReportingHubPage />,
      },
      {
        path: 'recruitment/*',
        element: <RecruitmentHubPage />,
      },
      {
        path: 'performance/*',
        element: <PerformanceHubPage />,
      },
      {
        path: 'learning/*',
        element: <LearningHubPage />,
      },
      {
        path: 'assets/*',
        element: <AssetHubPage />,
      },
      {
        path: 'relations/*',
        element: <HrRelationsHubPage />,
      },
      {
        path: 'policies/*',
        element: <PolicyHubPage />,
      },
      {
        path: 'helpdesk/*',
        element: <HelpdeskHubPage />,
      },
      {
        path: 'privacy/*',
        element: <PrivacyHubPage />,
      },
      {
        path: 'operations/*',
        element: <OperationsHubPage />,
      },
      {
        path: 'settings/*',
        element: <RbacHubPage />,
      },
      {
        path: '*',
        element: (
          <div className="flex min-h-[400px] flex-col items-center justify-center text-center">
            <h2 className="text-3xl font-medium text-ink">404 - Page Not Found</h2>
            <p className="mt-2 text-ink-mute">The page you are looking for does not exist.</p>
            <Link to="/dashboard" className="mt-6">
              <Button variant="primary" size="sm">
                Back to Dashboard
              </Button>
            </Link>
          </div>
        ),
      },
    ],
  },
]);
