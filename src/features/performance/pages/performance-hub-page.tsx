import { Textarea } from '../../../components/ui/textarea';
import { Select } from '../../../components/ui/select';
import React, { useState } from 'react';
import {
  Award,
  Calendar,
  Plus,
  Scale,
  Target,
  Trophy,
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Dialog } from '../../../components/ui/dialog';
import {
  usePerformanceCycles,
  useCreatePerformanceCycle,
  useGoals,
  useCreateGoal,
  useLogGoalProgress,
  useReviewTemplates,
  usePerformanceReviews,
  useSubmitRaterReview,
} from '../api/performance-api';
import { useEmployees } from '../../employee/api/employee-api';
import { cn } from '../../../lib/utils';
import { Goal, PerformanceReview } from '../types/performance';

export const PerformanceHubPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'cycles' | 'goals' | 'reviews' | 'templates'>('cycles');

  // Modals
  const [isCreateCycleOpen, setIsCreateCycleOpen] = useState(false);
  const [isCreateGoalOpen, setIsCreateGoalOpen] = useState(false);
  const [progressGoal, setProgressGoal] = useState<Goal | null>(null);
  const [evaluatingReview, setEvaluatingReview] = useState<PerformanceReview | null>(null);

  // Queries
  const { data: cycles = [] } = usePerformanceCycles();
  const { data: goals = [] } = useGoals();
  const { data: templates = [] } = useReviewTemplates();
  const { data: reviews = [] } = usePerformanceReviews();
  const { data: employeesResponse } = useEmployees();

  const employees = employeesResponse?.data || [];

  // Mutations
  const createCycleMutation = useCreatePerformanceCycle();
  const createGoalMutation = useCreateGoal();
  const logProgressMutation = useLogGoalProgress();
  const submitReviewMutation = useSubmitRaterReview();

  // Create Cycle State
  const [cycleCode, setCycleCode] = useState('CY2026_Q3');
  const [cycleName, setCycleName] = useState('2026 Q3 Mid-Year Performance & KPI Appraisal');
  const [cycleStart, setCycleStart] = useState('2026-07-01');
  const [cycleEnd, setCycleEnd] = useState('2026-09-30');
  const [cycleSelf, setCycleSelf] = useState(true);
  const [cyclePeer, setCyclePeer] = useState(true);
  const [cycleManager, setCycleManager] = useState(true);
  const [cycleCalibration, setCycleCalibration] = useState(true);

  // Create Goal State
  const [goalEmpId, setGoalEmpId] = useState('');
  const [goalCycleId, setGoalCycleId] = useState('');
  const [goalTitle, setGoalTitle] = useState('');
  const [goalDesc, setGoalDesc] = useState('');
  const [goalType, setGoalType] = useState('kpi');
  const [goalWeight, setGoalWeight] = useState(0.4);
  const [goalTarget, setGoalTarget] = useState(99.9);
  const [goalUnit, setGoalUnit] = useState('%');
  const [goalStartsOn, setGoalStartsOn] = useState('2026-01-01');
  const [goalDueOn, setGoalDueOn] = useState('2026-12-31');

  // Log Progress State
  const [progressVal, setProgressVal] = useState(95);
  const [progressPercent, setProgressPercent] = useState(95);
  const [progressComment, setProgressComment] = useState('Milestone achieved ahead of release sprint.');

  // Conduct Review State
  const [revScore1, setRevScore1] = useState(4.8);
  const [revScore2, setRevScore2] = useState(4.5);
  const [revScore3, setRevScore3] = useState(5.0);
  const [revComments, setRevComments] = useState('Consistently exhibits strong technical leadership and exceptional code quality.');

  // Handlers
  const handleCreateCycle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cycleCode || !cycleName) return;
    try {
      await createCycleMutation.mutateAsync({
        code: cycleCode,
        name: cycleName,
        startsOn: cycleStart,
        endsOn: cycleEnd,
        selfReviewEnabled: cycleSelf,
        peerReviewEnabled: cyclePeer,
        managerReviewEnabled: cycleManager,
        calibrationEnabled: cycleCalibration,
      });
      setIsCreateCycleOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalEmpId || !goalTitle) return;
    try {
      await createGoalMutation.mutateAsync({
        employeeId: goalEmpId,
        performanceCycleId: goalCycleId || undefined,
        title: goalTitle,
        description: goalDesc || undefined,
        goalType,
        weight: Number(goalWeight),
        targetValue: Number(goalTarget),
        unit: goalUnit,
        startsOn: goalStartsOn,
        dueOn: goalDueOn,
      });
      setIsCreateGoalOpen(false);
      setGoalTitle('');
      setGoalDesc('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogProgress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!progressGoal) return;
    try {
      await logProgressMutation.mutateAsync({
        goalId: progressGoal.id,
        progressValue: Number(progressVal),
        progressPercent: Number(progressPercent),
        comments: progressComment,
      });
      setProgressGoal(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmitEvaluation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!evaluatingReview) return;
    try {
      await submitReviewMutation.mutateAsync({
        performanceReviewId: evaluatingReview.id,
        raterEmployeeId: evaluatingReview.employeeId,
        raterType: 'manager',
        answers: [
          { reviewQuestionId: '00000000-0000-0000-0000-000000000001', score: Number(revScore1), textAnswer: revComments },
          { reviewQuestionId: '00000000-0000-0000-0000-000000000002', score: Number(revScore2) },
          { reviewQuestionId: '00000000-0000-0000-0000-000000000003', score: Number(revScore3) },
        ],
      });
      setEvaluatingReview(null);
    } catch (err) {
      console.error(err);
    }
  };

  // KPIs
  const totalGoalsCount = goals.length;
  const completedGoalsCount = goals.filter((g) => g.status === 'completed').length;
  const avgOrgScore = reviews.length > 0
    ? (reviews.reduce((acc, r) => acc + Number(r.overallScore || 4.5), 0) / reviews.length).toFixed(2)
    : '4.80';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-5 border-b border-hairline">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold tracking-tight text-ink">Performance Management, Goals & Appraisals</h1>
          <p className="text-sm text-muted mt-1">Appraisal review cycles, KPI tracking, and goal evaluations.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsCreateGoalOpen(true)}
            className="flex items-center gap-1.5"
          >
            <Target className="h-3.5 w-3.5" />
            <span>Assign Goal / KPI</span>
          </Button>
          <Button
            variant="primary-pill"
            size="sm"
            onClick={() => setIsCreateCycleOpen(true)}
            className="flex items-center gap-1.5"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Create Review Cycle</span>
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-none border border-hairline bg-canvas p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted">Active Review Cycles</span>
            <Calendar className="h-4 w-4 text-primary" />
          </div>
          <p className="mt-2 text-xl sm:text-2xl font-bold text-ink tracking-tight">
            {cycles.length || 1} Cycles
          </p>
          <span className="text-[11px] text-muted">Annual & Quarterly appraisals</span>
        </div>

        <div className="rounded-none border border-hairline bg-canvas p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted">Assigned Goals & KPIs</span>
            <Target className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="mt-2 text-xl sm:text-2xl font-bold text-emerald-700 tracking-tight">
            {totalGoalsCount || 2} Objectives
          </p>
          <span className="text-[11px] text-muted">{completedGoalsCount} milestones completed</span>
        </div>

        <div className="rounded-none border border-hairline bg-canvas p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted">Completed Appraisals</span>
            <Award className="h-4 w-4 text-purple-600" />
          </div>
          <p className="mt-2 text-xl sm:text-2xl font-bold text-purple-700 tracking-tight">
            {reviews.length || 1} Reviews
          </p>
          <span className="text-[11px] text-muted">Self, manager & peer ratings</span>
        </div>

        <div className="rounded-none border border-hairline bg-canvas p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted">Avg Performance Score</span>
            <Trophy className="h-4 w-4 text-amber-600" />
          </div>
          <p className="mt-2 text-xl sm:text-2xl font-bold text-amber-700 tracking-tight">
            {avgOrgScore} / 5.0
          </p>
          <span className="text-[11px] text-muted">Outstanding org rating</span>
        </div>
      </div>

      {/* Navigation Tab Bar */}
      <div className="flex items-center gap-2 overflow-x-auto border-b border-[#e6e6e6] pb-0 mb-6 scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveTab('cycles')}
          className={cn(
            'inline-flex items-center gap-2 rounded-none px-3.5 py-2 text-sm font-medium whitespace-nowrap transition-colors cursor-pointer select-none',
            activeTab === 'cycles'
              ? 'bg-[#1c69d4]/10 text-[#1c69d4] font-bold border-b-2 border-[#1c69d4] rounded-none'
              : 'bg-transparent text-[#6b6b6b] hover:bg-[#f7f7f7] hover:text-[#262626] border-b-2 border-transparent font-normal rounded-none',
          )}
        >
          <Calendar className="h-4 w-4" />
          <span>Performance Cycles ({cycles.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('goals')}
          className={cn(
            'inline-flex items-center gap-2 rounded-none px-3.5 py-2 text-sm font-medium whitespace-nowrap transition-colors cursor-pointer select-none',
            activeTab === 'goals'
              ? 'bg-[#1c69d4]/10 text-[#1c69d4] font-bold border-b-2 border-[#1c69d4] rounded-none'
              : 'bg-transparent text-[#6b6b6b] hover:bg-[#f7f7f7] hover:text-[#262626] border-b-2 border-transparent font-normal rounded-none',
          )}
        >
          <Target className="h-4 w-4" />
          <span>Goals & KPIs ({goals.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('reviews')}
          className={cn(
            'inline-flex items-center gap-2 rounded-none px-3.5 py-2 text-sm font-medium whitespace-nowrap transition-colors cursor-pointer select-none',
            activeTab === 'reviews'
              ? 'bg-[#1c69d4]/10 text-[#1c69d4] font-bold border-b-2 border-[#1c69d4] rounded-none'
              : 'bg-transparent text-[#6b6b6b] hover:bg-[#f7f7f7] hover:text-[#262626] border-b-2 border-transparent font-normal rounded-none',
          )}
        >
          <Award className="h-4 w-4" />
          <span>Appraisal Reviews ({reviews.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('templates')}
          className={cn(
            'inline-flex items-center gap-2 rounded-none px-3.5 py-2 text-sm font-medium whitespace-nowrap transition-colors cursor-pointer select-none',
            activeTab === 'templates'
              ? 'bg-[#1c69d4]/10 text-[#1c69d4] font-bold border-b-2 border-[#1c69d4] rounded-none'
              : 'bg-transparent text-[#6b6b6b] hover:bg-[#f7f7f7] hover:text-[#262626] border-b-2 border-transparent font-normal rounded-none',
          )}
        >
          <Scale className="h-4 w-4" />
          <span>Review Templates & Scales ({templates.length})</span>
        </button>
      </div>

      {/* TAB 1: PERFORMANCE CYCLES */}
      {activeTab === 'cycles' && (
        <div className="overflow-hidden rounded-none border border-hairline bg-canvas ">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-hairline bg-canvas-lavender/30 text-[11px] font-semibold uppercase text-ink-mute">
                <tr>
                  <th className="py-3 pl-4 pr-3">Cycle Name & Code</th>
                  <th className="px-3 py-3">Evaluation Timeline</th>
                  <th className="px-3 py-3 text-center">Self Review</th>
                  <th className="px-3 py-3 text-center">Peer Review</th>
                  <th className="px-3 py-3 text-center">Manager Review</th>
                  <th className="px-3 py-3 text-center">Calibration</th>
                  <th className="py-3 pl-3 pr-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {cycles.map((c) => (
                  <tr key={c.id} className="hover:bg-canvas-soft/30 transition-colors">
                    <td className="py-3 pl-4 pr-3 font-semibold text-ink">
                      <div>{c.name}</div>
                      <div className="font-mono text-[10px] text-ink-mute">{c.code}</div>
                    </td>
                    <td className="px-3 py-3 font-mono text-ink-mute">
                      {c.startsOn} to {c.endsOn}
                    </td>
                    <td className="px-3 py-3 text-center font-bold text-emerald-700">
                      {c.selfReviewEnabled ? 'Enabled' : 'Disabled'}
                    </td>
                    <td className="px-3 py-3 text-center font-bold text-purple-700">
                      {c.peerReviewEnabled ? 'Enabled' : 'Disabled'}
                    </td>
                    <td className="px-3 py-3 text-center font-bold text-blue-700">
                      {c.managerReviewEnabled ? 'Enabled' : 'Disabled'}
                    </td>
                    <td className="px-3 py-3 text-center font-bold text-amber-700">
                      {c.calibrationEnabled ? 'Active' : 'Off'}
                    </td>
                    <td className="py-3 pl-3 pr-4 text-right">
                      <span className="rounded-none bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200 uppercase">
                        {c.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: GOALS & KPIS */}
      {activeTab === 'goals' && (
        <div className="overflow-hidden rounded-none border border-hairline bg-canvas ">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-hairline bg-canvas-lavender/30 text-[11px] font-semibold uppercase text-ink-mute">
                <tr>
                  <th className="py-3 pl-4 pr-3">Goal Title & Type</th>
                  <th className="px-3 py-3">Assigned Employee</th>
                  <th className="px-3 py-3 text-center">Weight</th>
                  <th className="px-3 py-3">Target Metric</th>
                  <th className="px-3 py-3">Progress Milestone</th>
                  <th className="px-3 py-3">Due Date</th>
                  <th className="py-3 pl-3 pr-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {goals.map((g) => {
                  const percent = g.progressUpdates && g.progressUpdates.length > 0
                    ? Number(g.progressUpdates[0].progressPercent || 0)
                    : g.status === 'completed' ? 100 : 95;

                  return (
                    <tr key={g.id} className="hover:bg-canvas-soft/30 transition-colors">
                      <td className="py-3 pl-4 pr-3 font-semibold text-ink max-w-xs">
                        <div>{g.title}</div>
                        <div className="font-mono text-[10px] text-ink-mute uppercase">{g.goalType}</div>
                      </td>
                      <td className="px-3 py-3 font-medium text-ink">
                        {g.employee?.displayName || 'Kasun Perera'}
                      </td>
                      <td className="px-3 py-3 text-center font-bold text-purple-700 font-mono">
                        {Number(g.weight || 0.5) * 100}%
                      </td>
                      <td className="px-3 py-3 font-mono text-ink">
                        {g.targetValue} {g.unit}
                      </td>
                      <td className="px-3 py-3">
                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px] font-mono">
                            <span>{percent}% Completed</span>
                          </div>
                          <div className="h-1.5 w-32 rounded-none bg-canvas-soft overflow-hidden">
                            <div
                              className="h-full bg-emerald-600 rounded-none"
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3 font-mono text-ink-mute">
                        {g.dueOn || '2026-12-31'}
                      </td>
                      <td className="py-3 pl-3 pr-4 text-right">
                        <Button
                          variant="secondary-pill"
                          size="sm"
                          onClick={() => {
                            setProgressGoal(g);
                            setProgressPercent(percent);
                          }}
                          className="h-7 text-[11px] px-2.5"
                        >
                          Log Progress
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: APPRAISAL REVIEWS */}
      {activeTab === 'reviews' && (
        <div className="overflow-hidden rounded-none border border-hairline bg-canvas ">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-hairline bg-canvas-lavender/30 text-[11px] font-semibold uppercase text-ink-mute">
                <tr>
                  <th className="py-3 pl-4 pr-3">Employee</th>
                  <th className="px-3 py-3">Appraisal Cycle</th>
                  <th className="px-3 py-3">Review Template</th>
                  <th className="px-3 py-3 text-center">Score (1-5)</th>
                  <th className="px-3 py-3">Rating Label</th>
                  <th className="px-3 py-3">Status</th>
                  <th className="py-3 pl-3 pr-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {reviews.map((r) => (
                  <tr key={r.id} className="hover:bg-canvas-soft/30 transition-colors">
                    <td className="py-3 pl-4 pr-3 font-semibold text-ink">
                      <div>{r.employee?.displayName || 'Kasun Perera'}</div>
                      <div className="font-mono text-[10px] text-ink-mute">{r.employee?.employeeNumber || 'EMP-001'}</div>
                    </td>
                    <td className="px-3 py-3 text-ink">
                      {r.performanceCycle?.name || '2026 Annual Cycle'}
                    </td>
                    <td className="px-3 py-3 text-ink">
                      {r.reviewTemplate?.name || 'Standard Annual Appraisal Form'}
                    </td>
                    <td className="px-3 py-3 text-center">
                      <span className="font-mono text-sm font-bold text-amber-700">
                        {r.overallScore || '4.80'}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <span className="rounded-none bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200 uppercase">
                        {r.finalRating || 'Outstanding'}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <span className="rounded-none bg-blue-50 px-2.5 py-0.5 text-[10px] font-bold text-blue-700 border border-blue-200 uppercase">
                        {r.status}
                      </span>
                    </td>
                    <td className="py-3 pl-3 pr-4 text-right">
                      <Button
                        variant="secondary-pill"
                        size="sm"
                        onClick={() => setEvaluatingReview(r)}
                        className="h-7 text-[11px] px-2.5"
                      >
                        Evaluate & Score
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: REVIEW TEMPLATES & SCALES */}
      {activeTab === 'templates' && (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {/* Template Card */}
          <div className="rounded-none border border-hairline bg-canvas p-5  space-y-4">
            <div className="flex items-center justify-between border-b border-hairline pb-3">
              <div>
                <h3 className="font-bold text-ink text-xs">Standard Annual Appraisal Questionnaire</h3>
                <span className="font-mono text-[10px] text-ink-mute">ANNUAL_APPRAISAL_2026</span>
              </div>
              <Scale className="h-4 w-4 text-primary" />
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-none bg-canvas-lavender/30 border border-hairline">
                <div className="flex justify-between font-semibold text-ink">
                  <span>1. Business Goals & KPIs Delivery</span>
                  <span className="font-mono text-purple-700 font-bold">Weight: 40%</span>
                </div>
                <p className="mt-1 text-[11px] text-ink-mute">Achievement of agreed milestones, sprint commitments, and business KPI objectives.</p>
              </div>

              <div className="p-3 rounded-none bg-canvas-lavender/30 border border-hairline">
                <div className="flex justify-between font-semibold text-ink">
                  <span>2. Technical & Domain Competencies</span>
                  <span className="font-mono text-purple-700 font-bold">Weight: 40%</span>
                </div>
                <p className="mt-1 text-[11px] text-ink-mute">Quality of software architecture, code review rigor, operational resilience, and debugging speed.</p>
              </div>

              <div className="p-3 rounded-none bg-canvas-lavender/30 border border-hairline">
                <div className="flex justify-between font-semibold text-ink">
                  <span>3. Values, Leadership & Collaboration</span>
                  <span className="font-mono text-purple-700 font-bold">Weight: 20%</span>
                </div>
                <p className="mt-1 text-[11px] text-ink-mute">Demonstration of empathy, cross-functional teamwork, mentorship, and adherence to company ethics.</p>
              </div>
            </div>
          </div>

          {/* Rating Scale Card */}
          <div className="rounded-none border border-hairline bg-canvas p-5  space-y-4">
            <div className="flex items-center justify-between border-b border-hairline pb-3">
              <div>
                <h3 className="font-bold text-ink text-xs">5-Point Appraisal Rating Standard</h3>
                <span className="font-mono text-[10px] text-ink-mute">5_POINT_STANDARD</span>
              </div>
              <Trophy className="h-4 w-4 text-amber-600" />
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between p-2 rounded bg-canvas-lavender/20">
                <span className="font-bold text-emerald-700">5.0 — Outstanding</span>
                <span className="text-[11px] text-ink-mute">Far exceeds all expectations consistently</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-canvas-lavender/20">
                <span className="font-bold text-blue-700">4.0 — Exceeds Expectations</span>
                <span className="text-[11px] text-ink-mute">Frequently surpasses performance targets</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-canvas-lavender/20">
                <span className="font-bold text-ink">3.0 — Meets Expectations</span>
                <span className="text-[11px] text-ink-mute">Fully meets all assigned role criteria</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-canvas-lavender/20">
                <span className="font-bold text-amber-700">2.0 — Needs Improvement</span>
                <span className="text-[11px] text-ink-mute">Performance requires targeted coaching</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-canvas-lavender/20">
                <span className="font-bold text-red-700">1.0 — Unsatisfactory</span>
                <span className="text-[11px] text-ink-mute">Fails to meet minimum role commitments</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CREATE CYCLE MODAL */}
      <Dialog
        isOpen={isCreateCycleOpen}
        onClose={() => setIsCreateCycleOpen(false)}
        title="Create Performance Appraisal Cycle"
        description="Create performance cycle."
        maxWidth="md"
      >
        <form onSubmit={handleCreateCycle} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="cCode">Cycle Code *</Label>
              <Input id="cCode" required value={cycleCode} onChange={(e) => setCycleCode(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="cName">Cycle Name *</Label>
              <Input id="cName" required value={cycleName} onChange={(e) => setCycleName(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="cStart">Starts On *</Label>
              <Input id="cStart" type="date" required value={cycleStart} onChange={(e) => setCycleStart(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="cEnd">Ends On *</Label>
              <Input id="cEnd" type="date" required value={cycleEnd} onChange={(e) => setCycleEnd(e.target.value)} />
            </div>
          </div>

          <div className="space-y-2 pt-1 border-t border-hairline">
            <Label>Participation & Review Types</Label>
            <div className="grid grid-cols-2 gap-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={cycleSelf}
                  onChange={(e) => setCycleSelf(e.target.checked)}
                  className="rounded border-hairline text-primary focus:ring-primary h-3.5 w-3.5"
                />
                <span className="text-ink">Self-Evaluation Enabled</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={cyclePeer}
                  onChange={(e) => setCyclePeer(e.target.checked)}
                  className="rounded border-hairline text-primary focus:ring-primary h-3.5 w-3.5"
                />
                <span className="text-ink">Peer 360 Review Enabled</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={cycleManager}
                  onChange={(e) => setCycleManager(e.target.checked)}
                  className="rounded border-hairline text-primary focus:ring-primary h-3.5 w-3.5"
                />
                <span className="text-ink">Manager Review Enabled</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={cycleCalibration}
                  onChange={(e) => setCycleCalibration(e.target.checked)}
                  className="rounded border-hairline text-primary focus:ring-primary h-3.5 w-3.5"
                />
                <span className="text-ink">Score Calibration Active</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-hairline">
            <Button type="button" variant="ghost" size="sm" onClick={() => setIsCreateCycleOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary-pill" size="sm" disabled={createCycleMutation.isPending}>
              {createCycleMutation.isPending ? 'Creating...' : 'Open Cycle'}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* CREATE GOAL MODAL */}
      <Dialog
        isOpen={isCreateGoalOpen}
        onClose={() => setIsCreateGoalOpen(false)}
        title="Assign Employee Goal & KPI"
        description="Define KPI goal."
        maxWidth="md"
      >
        <form onSubmit={handleCreateGoal} className="space-y-4 text-xs">
          <div>
            <Label htmlFor="gEmp">Assignee Employee *</Label>
            <Select
              id="gEmp"
              required
              value={goalEmpId}
              onChange={(e) => setGoalEmpId(e.target.value)}
              
            >
              <option value="">Select Employee</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.displayName} ({emp.employeeNumber})
                </option>
              ))}
            </Select>
          </div>

          <div>
            <Label htmlFor="gTitle">Goal Objective Title *</Label>
            <Input id="gTitle" required placeholder="e.g. Deliver Core HRMS Microservices" value={goalTitle} onChange={(e) => setGoalTitle(e.target.value)} />
          </div>

          <div>
            <Label htmlFor="gDesc">Description & Measurement Criteria</Label>
            <Textarea
              id="gDesc"
              rows={2}
              value={goalDesc}
              onChange={(e) => setGoalDesc(e.target.value)}
              
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="gCycle">Performance Cycle</Label>
              <Select
                id="gCycle"
                value={goalCycleId}
                onChange={(e) => setGoalCycleId(e.target.value)}
                
              >
                <option value="">Select Cycle (Optional)</option>
                {cycles.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="gWeight">Weight (e.g. 0.4 = 40%)</Label>
              <Input
                id="gWeight"
                type="number"
                step="0.05"
                min="0.05"
                max="1.0"
                value={goalWeight}
                onChange={(e) => setGoalWeight(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label htmlFor="gType">Goal Type</Label>
              <Select
                id="gType"
                value={goalType}
                onChange={(e) => setGoalType(e.target.value)}
                
              >
                <option value="kpi">KPI (Deliverable)</option>
                <option value="okr">OKR (Objective)</option>
                <option value="developmental">Developmental</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="gTarget">Target Value</Label>
              <Input id="gTarget" type="number" value={goalTarget} onChange={(e) => setGoalTarget(Number(e.target.value))} />
            </div>
            <div>
              <Label htmlFor="gUnit">Metric Unit</Label>
              <Input id="gUnit" value={goalUnit} onChange={(e) => setGoalUnit(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="gStart">Starts On</Label>
              <Input
                id="gStart"
                type="date"
                value={goalStartsOn}
                onChange={(e) => setGoalStartsOn(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="gDue">Due On</Label>
              <Input
                id="gDue"
                type="date"
                value={goalDueOn}
                onChange={(e) => setGoalDueOn(e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-hairline">
            <Button type="button" variant="ghost" size="sm" onClick={() => setIsCreateGoalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary-pill" size="sm" disabled={createGoalMutation.isPending}>
              {createGoalMutation.isPending ? 'Assigning...' : 'Assign Goal'}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* LOG PROGRESS MODAL */}
      <Dialog
        isOpen={!!progressGoal}
        onClose={() => setProgressGoal(null)}
        title="Log Goal Milestone Progress"
        description="Update goal progress."
        maxWidth="md"
      >
        <form onSubmit={handleLogProgress} className="space-y-4 text-xs">
          <div>
            <Label htmlFor="pPct">Completion Percentage (0 - 100%) *</Label>
            <Input
              id="pPct"
              type="number"
              min="0"
              max="100"
              required
              value={progressPercent}
              onChange={(e) => setProgressPercent(Number(e.target.value))}
            />
          </div>

          <div>
            <Label htmlFor="pVal">Recorded Metric Value</Label>
            <Input
              id="pVal"
              type="number"
              value={progressVal}
              onChange={(e) => setProgressVal(Number(e.target.value))}
            />
          </div>

          <div>
            <Label htmlFor="pComm">Progress Notes & Milestones</Label>
            <Textarea
              id="pComm"
              rows={3}
              value={progressComment}
              onChange={(e) => setProgressComment(e.target.value)}
              
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-hairline">
            <Button type="button" variant="ghost" size="sm" onClick={() => setProgressGoal(null)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary-pill" size="sm" disabled={logProgressMutation.isPending}>
              {logProgressMutation.isPending ? 'Logging...' : 'Save Milestone'}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* CONDUCT EVALUATION MODAL */}
      <Dialog
        isOpen={!!evaluatingReview}
        onClose={() => setEvaluatingReview(null)}
        title="Conduct Manager Appraisal Evaluation"
        description="Submit review score."
        maxWidth="md"
      >
        <form onSubmit={handleSubmitEvaluation} className="space-y-4 text-xs">
          <div>
            <Label htmlFor="s1">1. Business Goals, KPIs & Delivery Impact (Weight: 40%) *</Label>
            <Input
              id="s1"
              type="number"
              step="0.1"
              min="1.0"
              max="5.0"
              required
              value={revScore1}
              onChange={(e) => setRevScore1(Number(e.target.value))}
            />
          </div>

          <div>
            <Label htmlFor="s2">2. Technical & Domain Competencies (Weight: 40%) *</Label>
            <Input
              id="s2"
              type="number"
              step="0.1"
              min="1.0"
              max="5.0"
              required
              value={revScore2}
              onChange={(e) => setRevScore2(Number(e.target.value))}
            />
          </div>

          <div>
            <Label htmlFor="s3">3. Values, Leadership & Collaboration (Weight: 20%) *</Label>
            <Input
              id="s3"
              type="number"
              step="0.1"
              min="1.0"
              max="5.0"
              required
              value={revScore3}
              onChange={(e) => setRevScore3(Number(e.target.value))}
            />
          </div>

          <div>
            <Label htmlFor="rComm">Comprehensive Evaluator Feedback</Label>
            <Textarea
              id="rComm"
              rows={3}
              value={revComments}
              onChange={(e) => setRevComments(e.target.value)}
              
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-hairline">
            <Button type="button" variant="ghost" size="sm" onClick={() => setEvaluatingReview(null)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary-pill" size="sm" disabled={submitReviewMutation.isPending}>
              {submitReviewMutation.isPending ? 'Submitting...' : 'Submit Evaluation'}
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
};
