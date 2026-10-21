import { Textarea } from '../../../components/ui/textarea';
import { Select } from '../../../components/ui/select';
import React, { useState } from 'react';
import {
  Briefcase,
  Calendar,
  CheckCircle2,
  Coins,
  Plus,
  Star,
  UserPlus,
  Users,
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Dialog } from '../../../components/ui/dialog';
import {
  useJobRequisitions,
  useCreateJobRequisition,
  useCandidates,
  useCreateCandidate,
  useApplications,
  useAdvanceApplicationStage,
  useInterviews,
  useScheduleInterview,
  useSubmitScorecard,
  useOffers,
  useCreateOffer,
  useAcceptOffer,
  useOnboardingCases,
} from '../data/recruitment-data';
import { useJobs, useDepartments } from '../../organization/data/organization-data';
import { cn } from '../../../lib/utils';
import { Interview } from '../types/recruitment';

export const RecruitmentHubPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'requisitions' | 'pipeline' | 'interviews' | 'offers' | 'onboarding'>('requisitions');

  // Modals
  const [isCreateReqOpen, setIsCreateReqOpen] = useState(false);
  const [isCreateCandOpen, setIsCreateCandOpen] = useState(false);
  const [isScheduleIntvOpen, setIsScheduleIntvOpen] = useState(false);
  const [isCreateOfferOpen, setIsCreateOfferOpen] = useState(false);
  const [scorecardInterview, setScorecardInterview] = useState<Interview | null>(null);

  // Queries
  const { data: requisitions = [] } = useJobRequisitions();
  const { data: candidates = [] } = useCandidates();
  const { data: applications = [] } = useApplications();
  const { data: interviews = [] } = useInterviews();
  const { data: offers = [] } = useOffers();
  const { data: onboardingCases = [] } = useOnboardingCases();
  const { data: jobsResponse } = useJobs();
  const { data: departmentsResponse } = useDepartments();

  const jobs = jobsResponse?.data || [];
  const departments = departmentsResponse?.data || [];

  // Mutations
  const createReqMutation = useCreateJobRequisition();
  const createCandMutation = useCreateCandidate();
  const createOfferMutation = useCreateOffer();
  const scheduleIntvMutation = useScheduleInterview();
  const submitScorecardMutation = useSubmitScorecard();
  const advanceStageMutation = useAdvanceApplicationStage();
  const acceptOfferMutation = useAcceptOffer();

  // Create Requisition Form State
  const [reqJobId, setReqJobId] = useState('');
  const [reqDeptId, setReqDeptId] = useState('');
  const [reqOpenings, setReqOpenings] = useState(1);
  const [reqMinSalary, setReqMinSalary] = useState(350000);
  const [reqMaxSalary, setReqMaxSalary] = useState(550000);
  const [reqTargetDate, setReqTargetDate] = useState('2026-10-15');

  // Create Candidate Form State
  const [candFirst, setCandFirst] = useState('');
  const [candLast, setCandLast] = useState('');
  const [candEmail, setCandEmail] = useState('');
  const [candPhone, setCandPhone] = useState('');
  const [candTitle, setCandTitle] = useState('');
  const [candCompany, setCandCompany] = useState('');
  const [candSalary, setCandSalary] = useState(450000);
  const [candNotice, setCandNotice] = useState(30);

  // Schedule Interview Form State
  const [intvAppId, setIntvAppId] = useState('');
  const [intvType, setIntvType] = useState('Technical Assessment');
  const [intvStart, setIntvStart] = useState('2026-09-05T10:00:00');
  const [intvEnd, setIntvEnd] = useState('2026-09-05T11:00:00');
  const [intvLink, setIntvLink] = useState('https://meet.google.com/ceylon-tech-interview');

  // Scorecard Form State
  const [scoreRecommendation, setScoreRecommendation] = useState('hire');
  const [scoreOverall, setScoreOverall] = useState(4.5);
  const [scoreComments, setScoreComments] = useState('Strong domain knowledge of TypeScript and distributed systems architecture.');

  // Create Offer Form State
  const [offerAppId, setOfferAppId] = useState('');
  const [offerSalary, setOfferSalary] = useState(450000);
  const [offerJoinDate, setOfferJoinDate] = useState('2026-10-01');

  // Handlers
  const handleCreateRequisition = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reqJobId) return;
    try {
      await createReqMutation.mutateAsync({
        legalEntityId: '00000000-0000-0000-0000-000000000001', // Resolved from legal entity
        jobId: reqJobId,
        departmentId: reqDeptId || undefined,
        openings: Number(reqOpenings),
        minSalary: Number(reqMinSalary),
        maxSalary: Number(reqMaxSalary),
        targetHireDate: reqTargetDate,
      });
      setIsCreateReqOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateCandidate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!candFirst) return;
    try {
      await createCandMutation.mutateAsync({
        firstName: candFirst,
        lastName: candLast || undefined,
        email: candEmail || undefined,
        phone: candPhone || undefined,
        currentTitle: candTitle || undefined,
        currentCompany: candCompany || undefined,
        expectedSalary: Number(candSalary),
        noticePeriodDays: Number(candNotice),
      });
      setIsCreateCandOpen(false);
      setCandFirst('');
      setCandLast('');
      setCandEmail('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleScheduleInterview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!intvAppId) return;
    try {
      await scheduleIntvMutation.mutateAsync({
        applicationId: intvAppId,
        interviewType: intvType,
        scheduledStart: intvStart,
        scheduledEnd: intvEnd,
        locationOrLink: intvLink,
      });
      setIsScheduleIntvOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmitScorecard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scorecardInterview) return;
    try {
      await submitScorecardMutation.mutateAsync({
        interviewId: scorecardInterview.id,
        panelMemberId: '00000000-0000-0000-0000-000000000001', // Resolved panel member
        recommendation: scoreRecommendation,
        overallScore: Number(scoreOverall),
        comments: scoreComments,
      });
      setScorecardInterview(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!offerAppId) return;
    try {
      await createOfferMutation.mutateAsync({
        applicationId: offerAppId,
        baseSalary: Number(offerSalary),
        proposedJoinDate: offerJoinDate,
        currency: 'LKR',
      });
      setIsCreateOfferOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAcceptOffer = async (offerId: string) => {
    try {
      await acceptOfferMutation.mutateAsync({ offerId, confirmedJoinDate: '2026-10-01' });
    } catch (err) {
      console.error(err);
    }
  };

  const handleAdvanceStage = async (appId: string, toStatus: string, stageName: string) => {
    try {
      await advanceStageMutation.mutateAsync({ id: appId, toStatus, stageName });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-5 border-b border-hairline">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold tracking-tight text-ink">Recruitment, Talent Pipeline & Onboarding</h1>
          <p className="text-sm text-muted mt-1">Job requisitions, talent pipelines, interview schedules, and offers.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsCreateCandOpen(true)}
            className="flex items-center gap-1.5"
          >
            <UserPlus className="h-3.5 w-3.5" />
            <span>Add Candidate</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsScheduleIntvOpen(true)}
            className="flex items-center gap-1.5"
          >
            <Calendar className="h-3.5 w-3.5" />
            <span>Schedule Interview</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsCreateOfferOpen(true)}
            className="flex items-center gap-1.5"
          >
            <Coins className="h-3.5 w-3.5" />
            <span>Extend Job Offer</span>
          </Button>
          <Button
            variant="primary-pill"
            size="sm"
            onClick={() => setIsCreateReqOpen(true)}
            className="flex items-center gap-1.5"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Create Requisition</span>
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-none border border-hairline bg-canvas p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted">Open Requisitions</span>
            <Briefcase className="h-4 w-4 text-primary" />
          </div>
          <p className="mt-2 text-xl sm:text-2xl font-bold text-ink tracking-tight">
            {requisitions.filter((r) => r.status === 'open').length || 1} Roles
          </p>
          <span className="text-[11px] text-muted">Active headcount demands</span>
        </div>

        <div className="rounded-none border border-hairline bg-canvas p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted">Candidate Pipeline</span>
            <Users className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="mt-2 text-xl sm:text-2xl font-bold text-emerald-700 tracking-tight">
            {candidates.length || 2} Candidates
          </p>
          <span className="text-[11px] text-muted">Screening & Interview active</span>
        </div>

        <div className="rounded-none border border-hairline bg-canvas p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted">Interviews Scheduled</span>
            <Calendar className="h-4 w-4 text-purple-600" />
          </div>
          <p className="mt-2 text-xl sm:text-2xl font-bold text-purple-700 tracking-tight">
            {interviews.length || 1} Rounds
          </p>
          <span className="text-[11px] text-muted">Panel evaluations</span>
        </div>

        <div className="rounded-none border border-hairline bg-canvas p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted">Job Offers Extended</span>
            <Coins className="h-4 w-4 text-amber-600" />
          </div>
          <p className="mt-2 text-xl sm:text-2xl font-bold text-amber-700 tracking-tight">
            {offers.length || 1} Offers
          </p>
          <span className="text-[11px] text-muted">Pending & Accepted</span>
        </div>
      </div>

      {/* Navigation Tab Bar */}
      <div className="flex items-center gap-2 overflow-x-auto border-b border-[#e6e6e6] pb-0 mb-6 scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveTab('requisitions')}
          className={cn(
            'inline-flex items-center gap-2 rounded-none px-3.5 py-2 text-sm font-medium whitespace-nowrap transition-colors cursor-pointer select-none',
            activeTab === 'requisitions'
              ? 'bg-[#1c69d4]/10 text-[#1c69d4] font-bold border-b-2 border-[#1c69d4] rounded-none'
              : 'bg-transparent text-[#6b6b6b] hover:bg-[#f7f7f7] hover:text-[#262626] border-b-2 border-transparent font-normal rounded-none',
          )}
        >
          <Briefcase className="h-4 w-4" />
          <span>Job Requisitions ({requisitions.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('pipeline')}
          className={cn(
            'inline-flex items-center gap-2 rounded-none px-3.5 py-2 text-sm font-medium whitespace-nowrap transition-colors cursor-pointer select-none',
            activeTab === 'pipeline'
              ? 'bg-[#1c69d4]/10 text-[#1c69d4] font-bold border-b-2 border-[#1c69d4] rounded-none'
              : 'bg-transparent text-[#6b6b6b] hover:bg-[#f7f7f7] hover:text-[#262626] border-b-2 border-transparent font-normal rounded-none',
          )}
        >
          <Users className="h-4 w-4" />
          <span>Candidate Pipeline ({applications.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('interviews')}
          className={cn(
            'inline-flex items-center gap-2 rounded-none px-3.5 py-2 text-sm font-medium whitespace-nowrap transition-colors cursor-pointer select-none',
            activeTab === 'interviews'
              ? 'bg-[#1c69d4]/10 text-[#1c69d4] font-bold border-b-2 border-[#1c69d4] rounded-none'
              : 'bg-transparent text-[#6b6b6b] hover:bg-[#f7f7f7] hover:text-[#262626] border-b-2 border-transparent font-normal rounded-none',
          )}
        >
          <Calendar className="h-4 w-4" />
          <span>Interviews ({interviews.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('offers')}
          className={cn(
            'inline-flex items-center gap-2 rounded-none px-3.5 py-2 text-sm font-medium whitespace-nowrap transition-colors cursor-pointer select-none',
            activeTab === 'offers'
              ? 'bg-[#1c69d4]/10 text-[#1c69d4] font-bold border-b-2 border-[#1c69d4] rounded-none'
              : 'bg-transparent text-[#6b6b6b] hover:bg-[#f7f7f7] hover:text-[#262626] border-b-2 border-transparent font-normal rounded-none',
          )}
        >
          <Coins className="h-4 w-4" />
          <span>Offers ({offers.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('onboarding')}
          className={cn(
            'inline-flex items-center gap-2 rounded-none px-3.5 py-2 text-sm font-medium whitespace-nowrap transition-colors cursor-pointer select-none',
            activeTab === 'onboarding'
              ? 'bg-[#1c69d4]/10 text-[#1c69d4] font-bold border-b-2 border-[#1c69d4] rounded-none'
              : 'bg-transparent text-[#6b6b6b] hover:bg-[#f7f7f7] hover:text-[#262626] border-b-2 border-transparent font-normal rounded-none',
          )}
        >
          <CheckCircle2 className="h-4 w-4" />
          <span>Onboarding Cases ({onboardingCases.length})</span>
        </button>
      </div>

      {/* TAB 1: JOB REQUISITIONS */}
      {activeTab === 'requisitions' && (
        <div className="overflow-hidden rounded-none border border-hairline bg-canvas ">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-hairline bg-canvas-lavender/30 text-[11px] font-semibold uppercase text-ink-mute">
                <tr>
                  <th className="py-3 pl-4 pr-3">Job Title & Code</th>
                  <th className="px-3 py-3">Department</th>
                  <th className="px-3 py-3 text-center">Openings</th>
                  <th className="px-3 py-3">Target Hire Date</th>
                  <th className="px-3 py-3 text-right">Budgeted Salary (LKR)</th>
                  <th className="px-3 py-3 text-center">Applications</th>
                  <th className="py-3 pl-3 pr-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {requisitions.map((r) => (
                  <tr key={r.id} className="hover:bg-canvas-soft/30 transition-colors">
                    <td className="py-3 pl-4 pr-3 font-semibold text-ink">
                      <div>{r.job?.title || 'Senior Full Stack Engineer'}</div>
                      <div className="font-mono text-[10px] text-ink-mute">{r.job?.code || 'ENG-SE-001'}</div>
                    </td>
                    <td className="px-3 py-3 text-ink">
                      {r.department?.name || 'Engineering & Technology'}
                    </td>
                    <td className="px-3 py-3 text-center font-bold text-ink">
                      {r.openings}
                    </td>
                    <td className="px-3 py-3 font-mono text-ink-mute">
                      {r.targetHireDate || '2026-10-15'}
                    </td>
                    <td className="px-3 py-3 text-right font-mono text-ink">
                      LKR {Number(r.minSalary || 350000).toLocaleString('en-LK')} - {Number(r.maxSalary || 550000).toLocaleString('en-LK')}
                    </td>
                    <td className="px-3 py-3 text-center font-bold text-primary">
                      {r.applications?.length || 2}
                    </td>
                    <td className="py-3 pl-3 pr-4 text-right">
                      <span className="rounded-none bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200 uppercase">
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: CANDIDATE PIPELINE */}
      {activeTab === 'pipeline' && (
        <div className="overflow-hidden rounded-none border border-hairline bg-canvas ">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-hairline bg-canvas-lavender/30 text-[11px] font-semibold uppercase text-ink-mute">
                <tr>
                  <th className="py-3 pl-4 pr-3">Candidate</th>
                  <th className="px-3 py-3">Contact</th>
                  <th className="px-3 py-3">Current Role & Org</th>
                  <th className="px-3 py-3 text-right">Expected Salary</th>
                  <th className="px-3 py-3 text-center">Rating</th>
                  <th className="px-3 py-3">Current Stage</th>
                  <th className="py-3 pl-3 pr-4 text-right">Advance Stage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {applications.map((app) => (
                  <tr key={app.id} className="hover:bg-canvas-soft/30 transition-colors">
                    <td className="py-3 pl-4 pr-3 font-semibold text-ink">
                      {app.candidate?.firstName} {app.candidate?.lastName}
                    </td>
                    <td className="px-3 py-3 font-mono text-[11px] text-ink-mute">
                      <div>{app.candidate?.email || 'email@example.lk'}</div>
                      <div>{app.candidate?.phone || '+94770000000'}</div>
                    </td>
                    <td className="px-3 py-3 text-ink">
                      <div className="font-medium">{app.candidate?.currentTitle || 'Software Engineer'}</div>
                      <div className="text-[10px] text-ink-mute">{app.candidate?.currentCompany || 'Tech Corp'}</div>
                    </td>
                    <td className="px-3 py-3 text-right font-mono text-ink">
                      LKR {Number(app.candidate?.expectedSalary || 450000).toLocaleString('en-LK')}
                    </td>
                    <td className="px-3 py-3 text-center">
                      <div className="flex items-center justify-center gap-1 font-bold text-amber-600">
                        <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                        {app.rating || '4.8'}
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <span className="rounded-none bg-blue-50 px-2.5 py-0.5 text-[10px] font-bold text-blue-700 border border-blue-200 uppercase">
                        {app.status}
                      </span>
                    </td>
                    <td className="py-3 pl-3 pr-4 text-right">
                      <Select
                        value={app.status}
                        onChange={(e) => handleAdvanceStage(app.id, e.target.value, `${e.target.value} stage`)}
                        className="rounded border border-hairline bg-canvas px-2 py-1 text-[11px] font-medium text-ink cursor-pointer"
                      >
                        <option value="applied">Applied</option>
                        <option value="screening">Screening</option>
                        <option value="shortlisted">Shortlisted</option>
                        <option value="interview">Interview</option>
                        <option value="assessment">Assessment</option>
                        <option value="offer">Offer</option>
                        <option value="hired">Hired</option>
                        <option value="rejected">Rejected</option>
                      </Select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: INTERVIEWS & SCORECARDS */}
      {activeTab === 'interviews' && (
        <div className="overflow-hidden rounded-none border border-hairline bg-canvas ">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-hairline bg-canvas-lavender/30 text-[11px] font-semibold uppercase text-ink-mute">
                <tr>
                  <th className="py-3 pl-4 pr-3">Candidate</th>
                  <th className="px-3 py-3">Interview Round</th>
                  <th className="px-3 py-3">Date & Time</th>
                  <th className="px-3 py-3">Location / Link</th>
                  <th className="px-3 py-3">Status</th>
                  <th className="py-3 pl-3 pr-4 text-right">Scorecard</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {interviews.map((intv) => (
                  <tr key={intv.id} className="hover:bg-canvas-soft/30 transition-colors">
                    <td className="py-3 pl-4 pr-3 font-semibold text-ink">
                      {intv.application?.candidate?.firstName} {intv.application?.candidate?.lastName || 'Candidate'}
                    </td>
                    <td className="px-3 py-3 font-medium text-ink">
                      {intv.interviewType}
                    </td>
                    <td className="px-3 py-3 font-mono text-ink-mute">
                      {new Date(intv.scheduledStart).toLocaleString()}
                    </td>
                    <td className="px-3 py-3 font-mono text-[11px] text-primary truncate max-w-xs">
                      {intv.locationOrLink || 'Google Meet'}
                    </td>
                    <td className="px-3 py-3">
                      <span className="rounded-none bg-purple-50 px-2 py-0.5 text-[10px] font-bold text-purple-700 border border-purple-200 uppercase">
                        {intv.status}
                      </span>
                    </td>
                    <td className="py-3 pl-3 pr-4 text-right">
                      <Button
                        variant="secondary-pill"
                        size="sm"
                        onClick={() => setScorecardInterview(intv)}
                        className="h-7 text-[11px] px-2.5"
                      >
                        Submit Scorecard
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: JOB OFFERS */}
      {activeTab === 'offers' && (
        <div className="overflow-hidden rounded-none border border-hairline bg-canvas ">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-hairline bg-canvas-lavender/30 text-[11px] font-semibold uppercase text-ink-mute">
                <tr>
                  <th className="py-3 pl-4 pr-3">Candidate</th>
                  <th className="px-3 py-3">Target Role</th>
                  <th className="px-3 py-3 text-right">Base Remuneration (LKR)</th>
                  <th className="px-3 py-3">Proposed Join Date</th>
                  <th className="px-3 py-3">Status</th>
                  <th className="py-3 pl-3 pr-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {offers.map((off) => (
                  <tr key={off.id} className="hover:bg-canvas-soft/30 transition-colors">
                    <td className="py-3 pl-4 pr-3 font-semibold text-ink">
                      {off.application?.candidate?.firstName} {off.application?.candidate?.lastName || 'Candidate'}
                    </td>
                    <td className="px-3 py-3 text-ink">
                      {off.application?.requisition?.job?.title || 'Senior Software Engineer'}
                    </td>
                    <td className="px-3 py-3 text-right font-mono font-bold text-emerald-700">
                      LKR {Number(off.baseSalary || 450000).toLocaleString('en-LK', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-3 py-3 font-mono text-ink-mute">
                      {off.proposedJoinDate || '2026-10-01'}
                    </td>
                    <td className="px-3 py-3">
                      <span className={`rounded-none px-2.5 py-0.5 text-[10px] font-bold uppercase border ${
                        off.status === 'accepted'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-blue-50 text-blue-700 border-blue-200'
                      }`}>
                        {off.status}
                      </span>
                    </td>
                    <td className="py-3 pl-3 pr-4 text-right">
                      {off.status !== 'accepted' && (
                        <Button
                          variant="primary-pill"
                          size="sm"
                          onClick={() => handleAcceptOffer(off.id)}
                          className="h-7 text-[11px] px-2.5 bg-emerald-600 hover:bg-emerald-700"
                        >
                          Accept & Onboard
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: ONBOARDING CASES */}
      {activeTab === 'onboarding' && (
        <div className="space-y-4">
          <div className="overflow-hidden rounded-none border border-hairline bg-canvas ">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-hairline bg-canvas-lavender/30 text-[11px] font-semibold uppercase text-ink-mute">
                  <tr>
                    <th className="py-3 pl-4 pr-3">New Hire</th>
                    <th className="px-3 py-3">Start Date</th>
                    <th className="px-3 py-3">Onboarding Template</th>
                    <th className="px-3 py-3 text-center">Tasks Checklist</th>
                    <th className="py-3 pl-3 pr-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hairline">
                  {onboardingCases.map((ob) => (
                    <tr key={ob.id} className="hover:bg-canvas-soft/30 transition-colors">
                      <td className="py-3 pl-4 pr-3 font-semibold text-ink">
                        {ob.employee?.displayName || 'Dilani Samaraweera'}
                      </td>
                      <td className="px-3 py-3 font-mono text-ink-mute">
                        {ob.startDate || '2026-10-01'}
                      </td>
                      <td className="px-3 py-3 text-ink">
                        {ob.template?.name || 'Standard Sri Lanka Staff Onboarding'}
                      </td>
                      <td className="px-3 py-3 text-center font-bold text-ink">
                        {ob.tasks?.length || 5} Checklist Tasks
                      </td>
                      <td className="py-3 pl-3 pr-4 text-right">
                        <span className="rounded-none bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700 border border-blue-200 uppercase">
                          {ob.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* CREATE REQUISITION MODAL */}
      <Dialog
        isOpen={isCreateReqOpen}
        onClose={() => setIsCreateReqOpen(false)}
        title="Create Job Requisition"
        description="Create job requisition."
        maxWidth="md"
      >
        <form onSubmit={handleCreateRequisition} className="space-y-4 text-xs">
          <div>
            <Label htmlFor="reqJob">Job Title *</Label>
            <Select
              id="reqJob"
              required
              value={reqJobId}
              onChange={(e) => setReqJobId(e.target.value)}
              
            >
              <option value="">Select Job</option>
              {jobs.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.title} ({j.code})
                </option>
              ))}
            </Select>
          </div>

          <div>
            <Label htmlFor="reqDept">Department</Label>
            <Select
              id="reqDept"
              value={reqDeptId}
              onChange={(e) => setReqDeptId(e.target.value)}
              
            >
              <option value="">Select Department</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="reqOpen">Openings Count *</Label>
              <Input
                id="reqOpen"
                type="number"
                min="1"
                required
                value={reqOpenings}
                onChange={(e) => setReqOpenings(Number(e.target.value))}
              />
            </div>
            <div>
              <Label htmlFor="reqDate">Target Hire Date</Label>
              <Input
                id="reqDate"
                type="date"
                value={reqTargetDate}
                onChange={(e) => setReqTargetDate(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="reqMin">Min Budget (LKR)</Label>
              <Input
                id="reqMin"
                type="number"
                value={reqMinSalary}
                onChange={(e) => setReqMinSalary(Number(e.target.value))}
              />
            </div>
            <div>
              <Label htmlFor="reqMax">Max Budget (LKR)</Label>
              <Input
                id="reqMax"
                type="number"
                value={reqMaxSalary}
                onChange={(e) => setReqMaxSalary(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-hairline">
            <Button type="button" variant="ghost" size="sm" onClick={() => setIsCreateReqOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary-pill" size="sm" disabled={createReqMutation.isPending}>
              {createReqMutation.isPending ? 'Creating...' : 'Open Requisition'}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* CREATE CANDIDATE MODAL */}
      <Dialog
        isOpen={isCreateCandOpen}
        onClose={() => setIsCreateCandOpen(false)}
        title="Add Candidate Profile"
        description="Add talent candidate."
        maxWidth="md"
      >
        <form onSubmit={handleCreateCandidate} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="cFirst">First Name *</Label>
              <Input id="cFirst" required value={candFirst} onChange={(e) => setCandFirst(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="cLast">Last Name</Label>
              <Input id="cLast" value={candLast} onChange={(e) => setCandLast(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="cEmail">Email</Label>
              <Input id="cEmail" type="email" value={candEmail} onChange={(e) => setCandEmail(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="cPhone">Phone Number</Label>
              <Input id="cPhone" value={candPhone} onChange={(e) => setCandPhone(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="cTitle">Current Job Title</Label>
              <Input id="cTitle" value={candTitle} onChange={(e) => setCandTitle(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="cComp">Current Employer</Label>
              <Input id="cComp" value={candCompany} onChange={(e) => setCandCompany(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="cSalary">Expected Salary (LKR)</Label>
              <Input id="cSalary" type="number" value={candSalary} onChange={(e) => setCandSalary(Number(e.target.value))} />
            </div>
            <div>
              <Label htmlFor="cNotice">Notice Period (Days)</Label>
              <Input id="cNotice" type="number" value={candNotice} onChange={(e) => setCandNotice(Number(e.target.value))} />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-hairline">
            <Button type="button" variant="ghost" size="sm" onClick={() => setIsCreateCandOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary-pill" size="sm" disabled={createCandMutation.isPending}>
              {createCandMutation.isPending ? 'Saving...' : 'Add Candidate'}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* SCHEDULE INTERVIEW MODAL */}
      <Dialog
        isOpen={isScheduleIntvOpen}
        onClose={() => setIsScheduleIntvOpen(false)}
        title="Schedule Interview Round"
        description="Schedule interview."
        maxWidth="md"
      >
        <form onSubmit={handleScheduleInterview} className="space-y-4 text-xs">
          <div>
            <Label htmlFor="iApp">Applicant *</Label>
            <Select
              id="iApp"
              required
              value={intvAppId}
              onChange={(e) => setIntvAppId(e.target.value)}
              
            >
              <option value="">Select Candidate Application</option>
              {applications.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.candidate?.firstName} {a.candidate?.lastName} ({a.currentStage || a.status})
                </option>
              ))}
            </Select>
          </div>

          <div>
            <Label htmlFor="iType">Interview Round Type *</Label>
            <Input id="iType" required value={intvType} onChange={(e) => setIntvType(e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="iStart">Start Date & Time *</Label>
              <Input id="iStart" type="datetime-local" required value={intvStart} onChange={(e) => setIntvStart(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="iEnd">End Date & Time *</Label>
              <Input id="iEnd" type="datetime-local" required value={intvEnd} onChange={(e) => setIntvEnd(e.target.value)} />
            </div>
          </div>

          <div>
            <Label htmlFor="iLink">Meeting URL or Room</Label>
            <Input id="iLink" value={intvLink} onChange={(e) => setIntvLink(e.target.value)} />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-hairline">
            <Button type="button" variant="ghost" size="sm" onClick={() => setIsScheduleIntvOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary-pill" size="sm" disabled={scheduleIntvMutation.isPending}>
              {scheduleIntvMutation.isPending ? 'Scheduling...' : 'Schedule Interview'}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* SUBMIT SCORECARD MODAL */}
      <Dialog
        isOpen={!!scorecardInterview}
        onClose={() => setScorecardInterview(null)}
        title="Candidate Interview Scorecard"
        description="Submit candidate evaluation."
        maxWidth="md"
      >
        <form onSubmit={handleSubmitScorecard} className="space-y-4 text-xs">
          <div>
            <Label htmlFor="scRec">Hiring Recommendation *</Label>
            <Select
              id="scRec"
              required
              value={scoreRecommendation}
              onChange={(e) => setScoreRecommendation(e.target.value)}
              
            >
              <option value="strong_hire">Strong Hire</option>
              <option value="hire">Hire</option>
              <option value="hold">Hold / Re-evaluate</option>
              <option value="no_hire">No Hire</option>
            </Select>
          </div>

          <div>
            <Label htmlFor="scScore">Overall Rating Score (1.0 to 5.0) *</Label>
            <Input
              id="scScore"
              type="number"
              step="0.1"
              min="1.0"
              max="5.0"
              required
              value={scoreOverall}
              onChange={(e) => setScoreOverall(Number(e.target.value))}
            />
          </div>

          <div>
            <Label htmlFor="scComm">Evaluator Notes & Feedback</Label>
            <Textarea
              id="scComm"
              rows={3}
              value={scoreComments}
              onChange={(e) => setScoreComments(e.target.value)}
              
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-hairline">
            <Button type="button" variant="ghost" size="sm" onClick={() => setScorecardInterview(null)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary-pill" size="sm" disabled={submitScorecardMutation.isPending}>
              {submitScorecardMutation.isPending ? 'Submitting...' : 'Submit Scorecard'}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* EXTEND JOB OFFER MODAL */}
      <Dialog
        isOpen={isCreateOfferOpen}
        onClose={() => setIsCreateOfferOpen(false)}
        title="Extend Job Offer Package"
        description="Generate job offer."
        maxWidth="md"
      >
        <form onSubmit={handleCreateOffer} className="space-y-4 text-xs">
          <div>
            <Label htmlFor="oApp">Select Final Candidate *</Label>
            <Select
              id="oApp"
              required
              value={offerAppId}
              onChange={(e) => setOfferAppId(e.target.value)}
              
            >
              <option value="">Select Candidate</option>
              {applications.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.candidate?.firstName} {a.candidate?.lastName} (Exp: LKR {a.candidate?.expectedSalary})
                </option>
              ))}
            </Select>
          </div>

          <div>
            <Label htmlFor="oSalary">Offered Monthly Base Salary (LKR) *</Label>
            <Input
              id="oSalary"
              type="number"
              required
              value={offerSalary}
              onChange={(e) => setOfferSalary(Number(e.target.value))}
            />
          </div>

          <div>
            <Label htmlFor="oDate">Proposed Join Date *</Label>
            <Input
              id="oDate"
              type="date"
              required
              value={offerJoinDate}
              onChange={(e) => setOfferJoinDate(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-hairline">
            <Button type="button" variant="ghost" size="sm" onClick={() => setIsCreateOfferOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary-pill" size="sm" disabled={createOfferMutation.isPending}>
              {createOfferMutation.isPending ? 'Issuing...' : 'Extend Formal Offer'}
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
};
