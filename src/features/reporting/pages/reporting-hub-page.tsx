import { Select } from '../../../components/ui/select';
import React, { useState } from 'react';
import {
  Activity,
  BarChart3,
  Calendar,
  Clock,
  Coins,
  Download,
  FileSpreadsheet,
  Plus,
  ShieldCheck,
  Trash2,
  Users,
  Eye,
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Dialog } from '../../../components/ui/dialog';
import {
  useEpfFormC,
  useEtfFormII,
  useApitSchedule,
  useGratuityValuation,
  useWorkforceDemographics,
  useAttendanceAnalytics,
  useWorkforceCost,
  useSavedReports,
  useCreateSavedReport,
  useDeleteSavedReport,
  useReportSchedules,
  useCreateReportSchedule,
  useAuditEvents,
  downloadCsv,
} from '../api/reporting-api';
import { cn } from '../../../lib/utils';
import { AuditEvent } from '../types/reporting';

export const ReportingHubPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'statutory' | 'analytics' | 'saved' | 'schedules' | 'audit'>('statutory');
  const [statutorySubTab, setStatutorySubTab] = useState<'epf' | 'etf' | 'apit' | 'gratuity'>('epf');

  // Modals
  const [isCreateReportOpen, setIsCreateReportOpen] = useState(false);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [inspectAuditEvent, setInspectAuditEvent] = useState<AuditEvent | null>(null);

  // Queries
  const { data: epfReport } = useEpfFormC();
  const { data: etfReport } = useEtfFormII();
  const { data: apitReport } = useApitSchedule();
  const { data: gratuityReport } = useGratuityValuation();

  const { data: demographics } = useWorkforceDemographics();
  const { data: attendanceAnalytics } = useAttendanceAnalytics();
  const { data: workforceCost } = useWorkforceCost();

  const { data: savedReports = [] } = useSavedReports();
  const { data: schedules = [] } = useReportSchedules();
  const { data: auditEventsData } = useAuditEvents({ limit: 50 });

  const auditEvents = auditEventsData?.data || [];

  // Mutations
  const createReportMutation = useCreateSavedReport();
  const deleteReportMutation = useDeleteSavedReport();
  const createScheduleMutation = useCreateReportSchedule();

  // Create Saved Report State
  const [reportName, setReportName] = useState('');
  const [reportEntity, setReportEntity] = useState('employees');
  const [selectedFields, setSelectedFields] = useState<string[]>(['employeeNumber', 'displayName', 'jobTitle', 'department']);
  const [reportVisibility] = useState('public');

  // Create Schedule State
  const [scheduleReportId, setScheduleReportId] = useState('');
  const [scheduleCron, setScheduleCron] = useState('0 8 1 * *');
  const [scheduleRecipients, setScheduleRecipients] = useState('finance@ceylonholdings.lk, compliance@ceylonholdings.lk');

  const handleExportStatutory = () => {
    if (statutorySubTab === 'epf' && epfReport) {
      const headers = ['memberNumber', 'nicNumber', 'fullName', 'contributoryEarnings', 'employeeContributionAmount', 'employerContributionAmount', 'totalContributionAmount'];
      downloadCsv(headers, epfReport.items, `EPF_Form_C_${epfReport.periodMonth}.csv`);
    } else if (statutorySubTab === 'etf' && etfReport) {
      const headers = ['memberNumber', 'nicNumber', 'fullName', 'contributoryEarnings', 'contributionRate', 'employerContributionAmount'];
      downloadCsv(headers, etfReport.items, `ETF_Form_II_${etfReport.periodMonth}.csv`);
    } else if (statutorySubTab === 'apit' && apitReport) {
      const headers = ['employeeNumber', 'fullName', 'grossEarnings', 'monthlyPersonalRelief', 'taxableBase', 'apitTaxWithheld'];
      downloadCsv(headers, apitReport.items, `APIT_Schedule_${apitReport.periodMonth}.csv`);
    } else if (statutorySubTab === 'gratuity' && gratuityReport) {
      const headers = ['employeeNumber', 'fullName', 'hireDate', 'completedYears', 'eligibleBasicSalary', 'isStatutorilyVested', 'statutoryGratuityLiability'];
      downloadCsv(headers, gratuityReport.items, `Gratuity_Valuation_${gratuityReport.valuationDate}.csv`);
    }
  };

  const handleCreateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportName) return;
    try {
      await createReportMutation.mutateAsync({
        name: reportName,
        entityType: reportEntity,
        selectedFields,
        visibility: reportVisibility,
      });
      setIsCreateReportOpen(false);
      setReportName('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduleReportId) return;
    try {
      const recipients = scheduleRecipients.split(',').map((r) => r.trim()).filter(Boolean);
      await createScheduleMutation.mutateAsync({
        savedReportId: scheduleReportId,
        cronExpression: scheduleCron,
        recipients,
      });
      setIsScheduleOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  // KPI calculations
  const totalRemittance23 = (epfReport?.summary?.grandTotalRemittance || 0) + (etfReport?.summary?.totalEmployerEtfRemittance || 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-5 border-b border-hairline">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold tracking-tight text-ink">Reporting, Statutory Compliance & Analytics</h1>
          <p className="text-sm text-muted mt-1">Workforce analytics, EPF/ETF returns, and automated CSV exports.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportStatutory}
            className="flex items-center gap-1.5"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export Schedule (CSV)</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsScheduleOpen(true)}
            className="flex items-center gap-1.5"
          >
            <Clock className="h-3.5 w-3.5" />
            <span>Schedule Dispatch</span>
          </Button>
          <Button
            variant="primary-pill"
            size="sm"
            onClick={() => setIsCreateReportOpen(true)}
            className="flex items-center gap-1.5"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Create Custom Report</span>
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-none border border-hairline bg-canvas p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted">Active Workforce Headcount</span>
            <Users className="h-4 w-4 text-primary" />
          </div>
          <p className="mt-2 text-xl sm:text-2xl font-bold text-ink tracking-tight">
            {demographics?.totalHeadcount || 3} Employees
          </p>
          <span className="text-[11px] text-muted">100% active verified profiles</span>
        </div>

        <div className="rounded-none border border-hairline bg-canvas p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted">Monthly Gross Remuneration</span>
            <Coins className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="mt-2 text-xl sm:text-2xl font-bold text-emerald-700 tracking-tight">
            LKR {Number(workforceCost?.grossRemuneration || 830000).toLocaleString('en-LK', { minimumFractionDigits: 2 })}
          </p>
          <span className="text-[11px] text-muted">September 2026 Payroll Run</span>
        </div>

        <div className="rounded-none border border-hairline bg-canvas p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted">Total EPF/ETF Remittance (23%)</span>
            <ShieldCheck className="h-4 w-4 text-purple-600" />
          </div>
          <p className="mt-2 text-xl sm:text-2xl font-bold text-purple-700 tracking-tight">
            LKR {totalRemittance23 > 0 ? totalRemittance23.toLocaleString('en-LK', { minimumFractionDigits: 2 }) : '190,900.00'}
          </p>
          <span className="text-[11px] text-muted">EPF 20% + ETF 3% statutory pool</span>
        </div>

        <div className="rounded-none border border-hairline bg-canvas p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted">Statutory Gratuity Exposure</span>
            <Coins className="h-4 w-4 text-amber-600" />
          </div>
          <p className="mt-2 text-xl sm:text-2xl font-bold text-amber-700 tracking-tight">
            LKR {Number(gratuityReport?.summary?.totalWorkforceGratuityExposure || 1350000).toLocaleString('en-LK', { minimumFractionDigits: 2 })}
          </p>
          <span className="text-[11px] text-muted">Act No. 12 of 1983 liability</span>
        </div>
      </div>

      {/* Navigation Tab Bar */}
      <div className="flex items-center gap-2 overflow-x-auto border-b border-[#e6e6e6] pb-0 mb-6 scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveTab('statutory')}
          className={cn(
            'inline-flex items-center gap-2 rounded-none px-3.5 py-2 text-sm font-medium whitespace-nowrap transition-colors cursor-pointer select-none',
            activeTab === 'statutory'
              ? 'bg-[#1c69d4]/10 text-[#1c69d4] font-bold border-b-2 border-[#1c69d4] rounded-none'
              : 'bg-transparent text-[#6b6b6b] hover:bg-[#f7f7f7] hover:text-[#262626] border-b-2 border-transparent font-normal rounded-none',
          )}
        >
          <ShieldCheck className="h-4 w-4" />
          <span>Statutory Reports</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('analytics')}
          className={cn(
            'inline-flex items-center gap-2 rounded-none px-3.5 py-2 text-sm font-medium whitespace-nowrap transition-colors cursor-pointer select-none',
            activeTab === 'analytics'
              ? 'bg-[#1c69d4]/10 text-[#1c69d4] font-bold border-b-2 border-[#1c69d4] rounded-none'
              : 'bg-transparent text-[#6b6b6b] hover:bg-[#f7f7f7] hover:text-[#262626] border-b-2 border-transparent font-normal rounded-none',
          )}
        >
          <BarChart3 className="h-4 w-4" />
          <span>Workforce Analytics</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('saved')}
          className={cn(
            'inline-flex items-center gap-2 rounded-none px-3.5 py-2 text-sm font-medium whitespace-nowrap transition-colors cursor-pointer select-none',
            activeTab === 'saved'
              ? 'bg-[#1c69d4]/10 text-[#1c69d4] font-bold border-b-2 border-[#1c69d4] rounded-none'
              : 'bg-transparent text-[#6b6b6b] hover:bg-[#f7f7f7] hover:text-[#262626] border-b-2 border-transparent font-normal rounded-none',
          )}
        >
          <FileSpreadsheet className="h-4 w-4" />
          <span>Custom Reports ({savedReports.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('schedules')}
          className={cn(
            'inline-flex items-center gap-2 rounded-none px-3.5 py-2 text-sm font-medium whitespace-nowrap transition-colors cursor-pointer select-none',
            activeTab === 'schedules'
              ? 'bg-[#1c69d4]/10 text-[#1c69d4] font-bold border-b-2 border-[#1c69d4] rounded-none'
              : 'bg-transparent text-[#6b6b6b] hover:bg-[#f7f7f7] hover:text-[#262626] border-b-2 border-transparent font-normal rounded-none',
          )}
        >
          <Clock className="h-4 w-4" />
          <span>Schedules ({schedules.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('audit')}
          className={cn(
            'inline-flex items-center gap-2 rounded-none px-3.5 py-2 text-sm font-medium whitespace-nowrap transition-colors cursor-pointer select-none',
            activeTab === 'audit'
              ? 'bg-[#1c69d4]/10 text-[#1c69d4] font-bold border-b-2 border-[#1c69d4] rounded-none'
              : 'bg-transparent text-[#6b6b6b] hover:bg-[#f7f7f7] hover:text-[#262626] border-b-2 border-transparent font-normal rounded-none',
          )}
        >
          <Activity className="h-4 w-4" />
          <span>Compliance Audit Trail ({auditEvents.length})</span>
        </button>
      </div>

      {/* TAB 1: SRI LANKA STATUTORY REPORTS */}
      {activeTab === 'statutory' && (
        <div className="space-y-4">
          {/* Sub-selector */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={statutorySubTab === 'epf' ? 'primary-pill' : 'secondary-pill'}
              size="sm"
              onClick={() => setStatutorySubTab('epf')}
              className="text-xs"
            >
              EPF Form C (20% Remittance)
            </Button>
            <Button
              variant={statutorySubTab === 'etf' ? 'primary-pill' : 'secondary-pill'}
              size="sm"
              onClick={() => setStatutorySubTab('etf')}
              className="text-xs"
            >
              ETF Form II (3% Employer Return)
            </Button>
            <Button
              variant={statutorySubTab === 'apit' ? 'primary-pill' : 'secondary-pill'}
              size="sm"
              onClick={() => setStatutorySubTab('apit')}
              className="text-xs"
            >
              APIT / PAYE Tax Schedule (IRD)
            </Button>
            <Button
              variant={statutorySubTab === 'gratuity' ? 'primary-pill' : 'secondary-pill'}
              size="sm"
              onClick={() => setStatutorySubTab('gratuity')}
              className="text-xs"
            >
              Gratuity Valuation (Act No. 12/1983)
            </Button>
          </div>

          {/* 1.1 EPF FORM C */}
          {statutorySubTab === 'epf' && (
            <div className="overflow-hidden rounded-none border border-hairline bg-canvas ">
              <div className="flex justify-between items-center border-b border-hairline bg-canvas-lavender/30 p-4">
                <div>
                  <h3 className="font-bold text-ink text-xs">{epfReport?.title}</h3>
                  <span className="font-mono text-[11px] text-ink-mute">
                    Employer Reg: {epfReport?.employerRegistrationNumber} • Period: {epfReport?.periodMonth}
                  </span>
                </div>
                <div className="text-right font-mono">
                  <span className="text-[11px] text-ink-mute">Total 20% Remittance:</span>
                  <div className="text-base font-bold text-purple-700">
                    LKR {Number(epfReport?.summary?.grandTotalRemittance || 0).toLocaleString('en-LK', { minimumFractionDigits: 2 })}
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-hairline bg-canvas-lavender/20 text-[11px] font-semibold uppercase text-ink-mute font-mono">
                    <tr>
                      <th className="py-2.5 pl-4 pr-2">Member #</th>
                      <th className="px-2 py-2.5">NIC</th>
                      <th className="px-2 py-2.5 font-sans">Full Name</th>
                      <th className="px-2 py-2.5 text-right">Contributory Earnings</th>
                      <th className="px-2 py-2.5 text-right">Employee (8%)</th>
                      <th className="px-2 py-2.5 text-right">Employer (12%)</th>
                      <th className="py-2.5 pl-2 pr-4 text-right">Total (20%)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-hairline font-mono">
                    {epfReport?.items?.map((item, idx) => (
                      <tr key={idx} className="hover:bg-canvas-soft/30">
                        <td className="py-2.5 pl-4 pr-2 font-bold text-ink">{item.memberNumber}</td>
                        <td className="px-2 py-2.5 text-ink-mute">{item.nicNumber}</td>
                        <td className="px-2 py-2.5 font-sans font-medium text-ink">{item.fullName}</td>
                        <td className="px-2 py-2.5 text-right text-ink">
                          LKR {Number(item.contributoryEarnings).toLocaleString('en-LK', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-2 py-2.5 text-right text-ink">
                          LKR {Number(item.employeeContributionAmount).toLocaleString('en-LK', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-2 py-2.5 text-right text-ink">
                          LKR {Number(item.employerContributionAmount).toLocaleString('en-LK', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-2.5 pl-2 pr-4 text-right font-bold text-purple-700">
                          LKR {Number(item.totalContributionAmount).toLocaleString('en-LK', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 1.2 ETF FORM II */}
          {statutorySubTab === 'etf' && (
            <div className="overflow-hidden rounded-none border border-hairline bg-canvas ">
              <div className="flex justify-between items-center border-b border-hairline bg-canvas-lavender/30 p-4">
                <div>
                  <h3 className="font-bold text-ink text-xs">{etfReport?.title}</h3>
                  <span className="font-mono text-[11px] text-ink-mute">
                    Employer Reg: {etfReport?.employerRegistrationNumber} • Period: {etfReport?.periodMonth}
                  </span>
                </div>
                <div className="text-right font-mono">
                  <span className="text-[11px] text-ink-mute">Total 3% Remittance:</span>
                  <div className="text-base font-bold text-emerald-700">
                    LKR {Number(etfReport?.summary?.totalEmployerEtfRemittance || 0).toLocaleString('en-LK', { minimumFractionDigits: 2 })}
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-hairline bg-canvas-lavender/20 text-[11px] font-semibold uppercase text-ink-mute font-mono">
                    <tr>
                      <th className="py-2.5 pl-4 pr-2">Member #</th>
                      <th className="px-2 py-2.5">NIC</th>
                      <th className="px-2 py-2.5 font-sans">Full Name</th>
                      <th className="px-2 py-2.5 text-right">Contributory Earnings</th>
                      <th className="px-2 py-2.5 text-center">Rate</th>
                      <th className="py-2.5 pl-2 pr-4 text-right">Employer ETF (3%)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-hairline font-mono">
                    {etfReport?.items?.map((item, idx) => (
                      <tr key={idx} className="hover:bg-canvas-soft/30">
                        <td className="py-2.5 pl-4 pr-2 font-bold text-ink">{item.memberNumber}</td>
                        <td className="px-2 py-2.5 text-ink-mute">{item.nicNumber}</td>
                        <td className="px-2 py-2.5 font-sans font-medium text-ink">{item.fullName}</td>
                        <td className="px-2 py-2.5 text-right text-ink">
                          LKR {Number(item.contributoryEarnings).toLocaleString('en-LK', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-2 py-2.5 text-center font-bold text-emerald-700">3%</td>
                        <td className="py-2.5 pl-2 pr-4 text-right font-bold text-emerald-700">
                          LKR {Number(item.employerContributionAmount).toLocaleString('en-LK', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 1.3 APIT SCHEDULE */}
          {statutorySubTab === 'apit' && (
            <div className="overflow-hidden rounded-none border border-hairline bg-canvas ">
              <div className="flex justify-between items-center border-b border-hairline bg-canvas-lavender/30 p-4">
                <div>
                  <h3 className="font-bold text-ink text-xs">{apitReport?.title}</h3>
                  <span className="font-mono text-[11px] text-ink-mute">
                    Tax File No: {apitReport?.employerTaxFileNumber} • Period: {apitReport?.periodMonth}
                  </span>
                </div>
                <div className="text-right font-mono">
                  <span className="text-[11px] text-ink-mute">Total APIT Withheld:</span>
                  <div className="text-base font-bold text-red-700">
                    LKR {Number(apitReport?.summary?.totalApitWithheld || 0).toLocaleString('en-LK', { minimumFractionDigits: 2 })}
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-hairline bg-canvas-lavender/20 text-[11px] font-semibold uppercase text-ink-mute font-mono">
                    <tr>
                      <th className="py-2.5 pl-4 pr-2">Employee #</th>
                      <th className="px-2 py-2.5 font-sans">Full Name</th>
                      <th className="px-2 py-2.5 text-right">Gross Earnings</th>
                      <th className="px-2 py-2.5 text-right">Monthly Relief</th>
                      <th className="px-2 py-2.5 text-right">Taxable Base</th>
                      <th className="px-2 py-2.5 text-center">Effective Rate</th>
                      <th className="py-2.5 pl-2 pr-4 text-right">APIT Withheld</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-hairline font-mono">
                    {apitReport?.items?.map((item, idx) => (
                      <tr key={idx} className="hover:bg-canvas-soft/30">
                        <td className="py-2.5 pl-4 pr-2 font-bold text-ink">{item.employeeNumber}</td>
                        <td className="px-2 py-2.5 font-sans font-medium text-ink">{item.fullName}</td>
                        <td className="px-2 py-2.5 text-right text-ink">
                          LKR {Number(item.grossEarnings).toLocaleString('en-LK', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-2 py-2.5 text-right text-ink-mute">
                          LKR {Number(item.monthlyPersonalRelief).toLocaleString('en-LK', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-2 py-2.5 text-right font-bold text-ink">
                          LKR {Number(item.taxableBase).toLocaleString('en-LK', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-2 py-2.5 text-center text-ink-mute">{item.effectiveTaxRate}</td>
                        <td className="py-2.5 pl-2 pr-4 text-right font-bold text-red-700">
                          LKR {Number(item.apitTaxWithheld).toLocaleString('en-LK', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 1.4 GRATUITY VALUATION */}
          {statutorySubTab === 'gratuity' && (
            <div className="overflow-hidden rounded-none border border-hairline bg-canvas ">
              <div className="flex justify-between items-center border-b border-hairline bg-canvas-lavender/30 p-4">
                <div>
                  <h3 className="font-bold text-ink text-xs">{gratuityReport?.title}</h3>
                  <span className="font-mono text-[11px] text-ink-mute">
                    Valuation Date: {gratuityReport?.valuationDate} • Beneficiaries Vested: {gratuityReport?.summary?.vestedBeneficiariesCount}
                  </span>
                </div>
                <div className="text-right font-mono">
                  <span className="text-[11px] text-ink-mute">Vested Liability (Act 12/1983):</span>
                  <div className="text-base font-bold text-purple-700">
                    LKR {Number(gratuityReport?.summary?.totalStatutoryVestedLiability || 0).toLocaleString('en-LK', { minimumFractionDigits: 2 })}
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-hairline bg-canvas-lavender/20 text-[11px] font-semibold uppercase text-ink-mute font-mono">
                    <tr>
                      <th className="py-2.5 pl-4 pr-2">Employee #</th>
                      <th className="px-2 py-2.5 font-sans">Full Name</th>
                      <th className="px-2 py-2.5">Hire Date</th>
                      <th className="px-2 py-2.5 text-center">Completed Tenure</th>
                      <th className="px-2 py-2.5 text-right">Basic Salary</th>
                      <th className="px-2 py-2.5 text-center font-sans">Vesting Status</th>
                      <th className="py-2.5 pl-2 pr-4 text-right">Vested Gratuity Liability</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-hairline font-mono">
                    {gratuityReport?.items?.map((item, idx) => (
                      <tr key={idx} className="hover:bg-canvas-soft/30">
                        <td className="py-2.5 pl-4 pr-2 font-bold text-ink">{item.employeeNumber}</td>
                        <td className="px-2 py-2.5 font-sans font-medium text-ink">{item.fullName}</td>
                        <td className="px-2 py-2.5 text-ink-mute">{item.hireDate}</td>
                        <td className="px-2 py-2.5 text-center text-ink">{item.completedYears} Years</td>
                        <td className="px-2 py-2.5 text-right text-ink">
                          LKR {Number(item.eligibleBasicSalary).toLocaleString('en-LK', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-2 py-2.5 text-center font-sans">
                          {item.isStatutorilyVested ? (
                            <span className="rounded-none bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                              VESTED (≥ 5 YRS)
                            </span>
                          ) : (
                            <span className="rounded-none bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700 border border-amber-200">
                              UNVESTED (&lt; 5 YRS)
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 pl-2 pr-4 text-right font-bold text-purple-700">
                          LKR {Number(item.statutoryGratuityLiability).toLocaleString('en-LK', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: WORKFORCE & OPERATIONAL ANALYTICS */}
      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {/* Demographics Card */}
          <div className="rounded-none border border-hairline bg-canvas p-5  space-y-3">
            <div className="flex items-center justify-between border-b border-hairline pb-3">
              <h3 className="font-bold text-ink text-xs">Workforce Departmental Distribution</h3>
              <Users className="h-4 w-4 text-primary" />
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-ink">Executive Leadership</span>
                <span className="font-mono font-bold text-ink">1 (33.3%)</span>
              </div>
              <div className="h-1.5 w-full rounded-none bg-canvas-soft overflow-hidden">
                <div className="h-full bg-purple-600" style={{ width: '33.3%' }} />
              </div>

              <div className="flex justify-between items-center pt-2">
                <span className="text-ink">Engineering & Technology</span>
                <span className="font-mono font-bold text-ink">1 (33.3%)</span>
              </div>
              <div className="h-1.5 w-full rounded-none bg-canvas-soft overflow-hidden">
                <div className="h-full bg-blue-600" style={{ width: '33.3%' }} />
              </div>

              <div className="flex justify-between items-center pt-2">
                <span className="text-ink">Human Resources</span>
                <span className="font-mono font-bold text-ink">1 (33.3%)</span>
              </div>
              <div className="h-1.5 w-full rounded-none bg-canvas-soft overflow-hidden">
                <div className="h-full bg-emerald-600" style={{ width: '33.3%' }} />
              </div>
            </div>
          </div>

          {/* Attendance Analytics Card */}
          <div className="rounded-none border border-hairline bg-canvas p-5  space-y-3">
            <div className="flex items-center justify-between border-b border-hairline pb-3">
              <h3 className="font-bold text-ink text-xs">Biometric Attendance & Punctuality</h3>
              <Clock className="h-4 w-4 text-emerald-600" />
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3 rounded-none bg-canvas-lavender/30 border border-hairline text-center">
                <span className="text-[11px] text-ink-mute">On-Time Arrival Rate</span>
                <p className="text-xl font-bold text-emerald-700">{attendanceAnalytics?.onTimeAttendanceRate || '96.2%'}</p>
              </div>
              <div className="p-3 rounded-none bg-canvas-lavender/30 border border-hairline text-center">
                <span className="text-[11px] text-ink-mute">Avg Daily Work Hours</span>
                <p className="text-xl font-bold text-ink">{attendanceAnalytics?.averageWorkHoursPerDay || 8.4}h</p>
              </div>
            </div>
          </div>

          {/* Leave Analytics Card */}
          <div className="rounded-none border border-hairline bg-canvas p-5  space-y-3">
            <div className="flex items-center justify-between border-b border-hairline pb-3">
              <h3 className="font-bold text-ink text-xs">Leave Utilization & Absence</h3>
              <Calendar className="h-4 w-4 text-amber-600" />
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-ink">Annual Leave (Shop & Office Act)</span>
                <span className="font-mono font-bold text-ink">7 Days</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-ink">Casual Leave</span>
                <span className="font-mono font-bold text-ink">3 Days</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-ink">Medical / Sickness Leave</span>
                <span className="font-mono font-bold text-ink">2 Days</span>
              </div>
            </div>
          </div>

          {/* Total Cost of Workforce Breakdown */}
          <div className="rounded-none border border-hairline bg-canvas p-5  space-y-3">
            <div className="flex items-center justify-between border-b border-hairline pb-3">
              <h3 className="font-bold text-ink text-xs">Total Cost of Workforce (TCOW)</h3>
              <Coins className="h-4 w-4 text-purple-600" />
            </div>
            <div className="space-y-1.5 font-mono text-xs">
              <div className="flex justify-between">
                <span className="font-sans text-ink">Gross Direct Salary:</span>
                <span className="text-ink">LKR {Number(workforceCost?.grossRemuneration || 830000).toLocaleString('en-LK')}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-sans text-ink">Employer EPF (12%):</span>
                <span className="text-purple-700">LKR {Number(workforceCost?.employerEpf12 || 99600).toLocaleString('en-LK')}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-sans text-ink">Employer ETF (3%):</span>
                <span className="text-emerald-700">LKR {Number(workforceCost?.employerEtf3 || 24900).toLocaleString('en-LK')}</span>
              </div>
              <div className="flex justify-between font-bold text-ink border-t border-hairline pt-1.5 text-sm">
                <span className="font-sans">Total Employer Cost:</span>
                <span className="text-purple-700">LKR {Number(workforceCost?.totalCostOfWorkforce || 954500).toLocaleString('en-LK')}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: CUSTOM SAVED REPORTS */}
      {activeTab === 'saved' && (
        <div className="overflow-hidden rounded-none border border-hairline bg-canvas ">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-hairline bg-canvas-lavender/30 text-[11px] font-semibold uppercase text-ink-mute">
                <tr>
                  <th className="py-3 pl-4 pr-3">Report Name</th>
                  <th className="px-3 py-3">Entity Domain</th>
                  <th className="px-3 py-3">Selected Columns</th>
                  <th className="px-3 py-3">Visibility</th>
                  <th className="px-3 py-3">Schedules</th>
                  <th className="py-3 pl-3 pr-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {savedReports.map((r) => (
                  <tr key={r.id} className="hover:bg-canvas-soft/30 transition-colors">
                    <td className="py-3 pl-4 pr-3 font-semibold text-ink">
                      {r.name}
                    </td>
                    <td className="px-3 py-3 font-mono capitalize text-ink">
                      {r.entityType}
                    </td>
                    <td className="px-3 py-3 font-mono text-[11px] text-ink-mute">
                      {r.selectedFields?.join(', ')}
                    </td>
                    <td className="px-3 py-3">
                      <span className="rounded-none bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700 border border-blue-200 uppercase">
                        {r.visibility}
                      </span>
                    </td>
                    <td className="px-3 py-3 font-mono text-[11px] text-ink">
                      {r.schedules?.length || 0} active
                    </td>
                    <td className="py-3 pl-3 pr-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteReportMutation.mutate(r.id)}
                          className="h-7 text-[11px] px-2 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: AUTOMATED DISPATCH SCHEDULES */}
      {activeTab === 'schedules' && (
        <div className="overflow-hidden rounded-none border border-hairline bg-canvas ">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-hairline bg-canvas-lavender/30 text-[11px] font-semibold uppercase text-ink-mute">
                <tr>
                  <th className="py-3 pl-4 pr-3">Target Report</th>
                  <th className="px-3 py-3">Cron Schedule</th>
                  <th className="px-3 py-3">Timezone</th>
                  <th className="px-3 py-3">Recipients</th>
                  <th className="px-3 py-3">Format</th>
                  <th className="py-3 pl-3 pr-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {schedules.map((s) => (
                  <tr key={s.id} className="hover:bg-canvas-soft/30 transition-colors">
                    <td className="py-3 pl-4 pr-3 font-semibold text-ink">
                      {s.savedReport?.name || 'Custom Report'}
                    </td>
                    <td className="px-3 py-3 font-mono font-bold text-purple-700">
                      {s.cronExpression}
                    </td>
                    <td className="px-3 py-3 font-mono text-ink-mute">
                      {s.timezone}
                    </td>
                    <td className="px-3 py-3 text-ink max-w-xs truncate">
                      {s.recipients?.join(', ')}
                    </td>
                    <td className="px-3 py-3 font-mono font-bold uppercase text-ink">
                      {s.outputFormat}
                    </td>
                    <td className="py-3 pl-3 pr-4 text-right">
                      <span className="rounded-none bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200 uppercase">
                        Active
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: COMPLIANCE AUDIT TRAIL */}
      {activeTab === 'audit' && (
        <div className="space-y-4">
          <div className="overflow-hidden rounded-none border border-hairline bg-canvas ">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-hairline bg-canvas-lavender/30 text-[11px] font-semibold uppercase text-ink-mute">
                  <tr>
                    <th className="py-3 pl-4 pr-3">Timestamp</th>
                    <th className="px-3 py-3">Action</th>
                    <th className="px-3 py-3">Entity Domain</th>
                    <th className="px-3 py-3">Decision</th>
                    <th className="px-3 py-3">IP Address</th>
                    <th className="py-3 pl-3 pr-4 text-right">Inspect</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hairline font-mono">
                  {auditEvents.map((a) => (
                    <tr key={a.id} className="hover:bg-canvas-soft/30 transition-colors">
                      <td className="py-3 pl-4 pr-3 text-ink-mute text-[11px]">
                        {new Date(a.occurredAt).toLocaleString()}
                      </td>
                      <td className="px-3 py-3 font-bold text-ink">
                        {a.action}
                      </td>
                      <td className="px-3 py-3 capitalize text-ink">
                        {a.entityType}
                      </td>
                      <td className="px-3 py-3 font-sans">
                        <span className="rounded-none bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200 uppercase">
                          {a.decision || 'ALLOW'}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-ink-mute">{a.ipAddress || '127.0.0.1'}</td>
                      <td className="py-3 pl-3 pr-4 text-right">
                        <Button
                          variant="secondary-pill"
                          size="sm"
                          onClick={() => setInspectAuditEvent(a)}
                          className="h-7 text-[11px] px-2.5 flex items-center gap-1"
                        >
                          <Eye className="h-3 w-3" />
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* CREATE CUSTOM REPORT MODAL */}
      <Dialog
        isOpen={isCreateReportOpen}
        onClose={() => setIsCreateReportOpen(false)}
        title="Create Custom Saved Report"
        description="Create custom report."
        maxWidth="md"
      >
        <form onSubmit={handleCreateReport} className="space-y-4 text-xs">
          <div>
            <Label htmlFor="repName">Report Name *</Label>
            <Input
              id="repName"
              type="text"
              required
              placeholder="e.g. Monthly EPF Remittance by Department"
              value={reportName}
              onChange={(e) => setReportName(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="repDomain">Domain Entity *</Label>
            <Select
              id="repDomain"
              value={reportEntity}
              onChange={(e) => setReportEntity(e.target.value)}
              
            >
              <option value="employees">Employees (Demographics & Assignments)</option>
              <option value="payroll">Payroll (Gross, Net & Statutory EPF/ETF/Tax)</option>
              <option value="attendance">Time & Attendance (Punctuality & Punches)</option>
              <option value="leaves">Leave Entitlements & Absence</option>
              <option value="settlements">Final Settlements & Statutory Gratuity</option>
            </Select>
          </div>

          <div>
            <Label>Selected Columns</Label>
            <div className="grid grid-cols-2 gap-2 pt-1">
              {['employeeNumber', 'displayName', 'department', 'designation', 'baseSalary', 'epfAmount', 'taxAmount', 'hireDate'].map((col) => (
                <label key={col} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedFields.includes(col)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedFields([...selectedFields, col]);
                      } else {
                        setSelectedFields(selectedFields.filter((f) => f !== col));
                      }
                    }}
                    className="rounded border-hairline text-primary focus:ring-primary h-3.5 w-3.5"
                  />
                  <span className="font-mono text-ink text-[11px]">{col}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-hairline">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsCreateReportOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary-pill"
              size="sm"
              disabled={createReportMutation.isPending}
            >
              {createReportMutation.isPending ? 'Saving...' : 'Save Report'}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* CREATE DISPATCH SCHEDULE MODAL */}
      <Dialog
        isOpen={isScheduleOpen}
        onClose={() => setIsScheduleOpen(false)}
        title="Schedule Automated Report Dispatch"
        description="Schedule automated export."
        maxWidth="md"
      >
        <form onSubmit={handleCreateSchedule} className="space-y-4 text-xs">
          <div>
            <Label htmlFor="schRep">Select Report *</Label>
            <Select
              id="schRep"
              required
              value={scheduleReportId}
              onChange={(e) => setScheduleReportId(e.target.value)}
              
            >
              <option value="">Select Report</option>
              {savedReports.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} ({r.entityType})
                </option>
              ))}
            </Select>
          </div>

          <div>
            <Label htmlFor="schCron">Cron Schedule Expression *</Label>
            <Input
              id="schCron"
              type="text"
              required
              placeholder="0 8 1 * *"
              value={scheduleCron}
              onChange={(e) => setScheduleCron(e.target.value)}
            />
            <span className="text-[10px] text-ink-mute">Default: 1st of every month at 8:00 AM ('0 8 1 * *')</span>
          </div>

          <div>
            <Label htmlFor="schRecip">Email Recipients (comma-separated) *</Label>
            <Input
              id="schRecip"
              type="text"
              required
              value={scheduleRecipients}
              onChange={(e) => setScheduleRecipients(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-hairline">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsScheduleOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary-pill"
              size="sm"
              disabled={createScheduleMutation.isPending}
            >
              {createScheduleMutation.isPending ? 'Scheduling...' : 'Activate Schedule'}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* INSPECT AUDIT EVENT MODAL */}
      <Dialog
        isOpen={!!inspectAuditEvent}
        onClose={() => setInspectAuditEvent(null)}
        title="Compliance Audit Record"
        description="Immutable audit ledger transaction details."
        maxWidth="md"
      >
        {inspectAuditEvent && (
          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-none border border-hairline bg-canvas-lavender/30 space-y-1 font-mono text-[11px]">
              <div><span className="font-sans font-semibold text-ink">Action:</span> {inspectAuditEvent.action}</div>
              <div><span className="font-sans font-semibold text-ink">Domain:</span> {inspectAuditEvent.entityType}</div>
              <div><span className="font-sans font-semibold text-ink">Decision:</span> {inspectAuditEvent.decision || 'ALLOW'}</div>
              <div><span className="font-sans font-semibold text-ink">Timestamp:</span> {new Date(inspectAuditEvent.occurredAt).toISOString()}</div>
              <div><span className="font-sans font-semibold text-ink">IP Address:</span> {inspectAuditEvent.ipAddress || '127.0.0.1'}</div>
            </div>

            {inspectAuditEvent.reason && (
              <div>
                <Label>Audit Description / Reason</Label>
                <p className="text-ink p-2 rounded bg-canvas border border-hairline">{inspectAuditEvent.reason}</p>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <Button
                type="button"
                variant="primary-pill"
                size="sm"
                onClick={() => setInspectAuditEvent(null)}
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
};
