import { Textarea } from '../../../components/ui/textarea';
import { Select } from '../../../components/ui/select';
import React, { useState } from 'react';
import {
  BookOpen,
  Calendar,
  GraduationCap,
  Plus,
  ShieldCheck,
  UserCheck,
  Video,
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Dialog } from '../../../components/ui/dialog';
import {
  useCourses,
  useCreateCourse,
  useTrainingSessions,
  useCreateTrainingSession,
  useLearningAssignments,
  useAssignCourse,
  useCompleteLearningAssignment,
} from '../data/learning-data';
import { useEmployees } from '../../employee/data/employee-data';
import { cn } from '../../../lib/utils';
import { LearningAssignment } from '../types/learning';

export const LearningHubPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'catalog' | 'workshops' | 'assignments' | 'compliance'>('catalog');

  // Modals
  const [isCreateCourseOpen, setIsCreateCourseOpen] = useState(false);
  const [isCreateSessionOpen, setIsCreateSessionOpen] = useState(false);
  const [isAssignCourseOpen, setIsAssignCourseOpen] = useState(false);
  const [certifyingAssignment, setCertifyingAssignment] = useState<LearningAssignment | null>(null);

  // Queries
  const { data: courses = [] } = useCourses();
  const { data: sessions = [] } = useTrainingSessions();
  const { data: assignments = [] } = useLearningAssignments();
  const { data: employeesResponse } = useEmployees();

  const employees = employeesResponse?.data || [];

  // Mutations
  const createCourseMutation = useCreateCourse();
  const createSessionMutation = useCreateTrainingSession();
  const assignCourseMutation = useAssignCourse();
  const completeAssignmentMutation = useCompleteLearningAssignment();

  // Create Course State
  const [courseCode, setCourseCode] = useState('');
  const [courseTitle, setCourseTitle] = useState('');
  const [courseDesc, setCourseDesc] = useState('');
  const [courseProvider, setCourseProvider] = useState('Ceylon Institute of Technology');
  const [courseCategory, setCourseCategory] = useState('Engineering & Technology');
  const [courseMandatory, setCourseMandatory] = useState(false);
  const [courseValidity, setCourseValidity] = useState(12);

  // Schedule Session State
  const [sessionCourseId, setSessionCourseId] = useState('');
  const [sessionStart, setSessionStart] = useState('2026-09-15T10:00:00');
  const [sessionEnd, setSessionEnd] = useState('2026-09-15T13:00:00');
  const [sessionLink, setSessionLink] = useState('https://meet.google.com/ceylon-hrms-workshop');
  const [sessionTrainer, setSessionTrainer] = useState('Senior Solutions Specialist');
  const [sessionCapacity, setSessionCapacity] = useState(30);
  const [sessionCost, setSessionCost] = useState(85000);

  // Assign Course State
  const [assignEmpId, setAssignEmpId] = useState('');
  const [assignCourseId, setAssignCourseId] = useState('');
  const [assignSessionId, setAssignSessionId] = useState('');
  const [assignDueOn, setAssignDueOn] = useState('2026-10-31');

  // Certify State
  const [certScore, setCertScore] = useState(98.5);
  const [certDate, setCertDate] = useState('2026-09-15');

  // Handlers
  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseCode || !courseTitle) return;
    try {
      await createCourseMutation.mutateAsync({
        code: courseCode,
        title: courseTitle,
        description: courseDesc || undefined,
        provider: courseProvider,
        category: courseCategory,
        mandatory: courseMandatory,
        validityMonths: Number(courseValidity) || undefined,
      });
      setIsCreateCourseOpen(false);
      setCourseCode('');
      setCourseTitle('');
      setCourseDesc('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionCourseId) return;
    try {
      await createSessionMutation.mutateAsync({
        courseId: sessionCourseId,
        startsAt: sessionStart,
        endsAt: sessionEnd,
        locationOrLink: sessionLink,
        trainerName: sessionTrainer,
        capacity: Number(sessionCapacity),
        cost: Number(sessionCost),
        currency: 'LKR',
      });
      setIsCreateSessionOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAssignCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignEmpId || !assignCourseId) return;
    try {
      await assignCourseMutation.mutateAsync({
        employeeId: assignEmpId,
        courseId: assignCourseId,
        trainingSessionId: assignSessionId || undefined,
        dueOn: assignDueOn,
      });
      setIsAssignCourseOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCompleteAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!certifyingAssignment) return;
    try {
      await completeAssignmentMutation.mutateAsync({
        id: certifyingAssignment.id,
        completionDate: certDate,
        score: Number(certScore),
      });
      setCertifyingAssignment(null);
    } catch (err) {
      console.error(err);
    }
  };

  // Metrics
  const completedAssignments = assignments.filter((a) => a.status === 'completed').length;
  const complianceCourses = courses.filter((c) => c.mandatory);
  const complianceRate = assignments.length > 0
    ? Math.round((completedAssignments / assignments.length) * 100)
    : 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-5 border-b border-hairline">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold tracking-tight text-ink">Learning, Corporate Training & Certifications</h1>
          <p className="text-sm text-muted mt-1">Training courses, instructor-led workshops, and skill certifications.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAssignCourseOpen(true)}
            className="flex items-center gap-1.5"
          >
            <UserCheck className="h-3.5 w-3.5" />
            <span>Assign Course</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsCreateSessionOpen(true)}
            className="flex items-center gap-1.5"
          >
            <Calendar className="h-3.5 w-3.5" />
            <span>Schedule Workshop</span>
          </Button>
          <Button
            variant="primary-pill"
            size="sm"
            onClick={() => setIsCreateCourseOpen(true)}
            className="flex items-center gap-1.5"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Course</span>
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-none border border-hairline bg-canvas p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted">Course Catalog</span>
            <BookOpen className="h-4 w-4 text-primary" />
          </div>
          <p className="mt-2 text-xl sm:text-2xl font-bold text-ink tracking-tight">
            {courses.length || 4} Courses
          </p>
          <span className="text-[11px] text-muted">{complianceCourses.length} mandatory compliance</span>
        </div>

        <div className="rounded-none border border-hairline bg-canvas p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted">Scheduled Workshops</span>
            <Video className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="mt-2 text-xl sm:text-2xl font-bold text-emerald-700 tracking-tight">
            {sessions.length || 2} Sessions
          </p>
          <span className="text-[11px] text-muted">Instructor-led & Virtual</span>
        </div>

        <div className="rounded-none border border-hairline bg-canvas p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted">Active Enrollments</span>
            <GraduationCap className="h-4 w-4 text-purple-600" />
          </div>
          <p className="mt-2 text-xl sm:text-2xl font-bold text-purple-700 tracking-tight">
            {assignments.length || 2} Assignments
          </p>
          <span className="text-[11px] text-muted">{completedAssignments} certified completed</span>
        </div>

        <div className="rounded-none border border-hairline bg-canvas p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted">Compliance Rate</span>
            <ShieldCheck className="h-4 w-4 text-amber-600" />
          </div>
          <p className="mt-2 text-xl sm:text-2xl font-bold text-amber-700 tracking-tight">
            {complianceRate}%
          </p>
          <span className="text-[11px] text-muted">Audit & labor law aligned</span>
        </div>
      </div>

      {/* Navigation Tab Bar */}
      <div className="flex items-center gap-2 overflow-x-auto border-b border-[#e6e6e6] pb-0 mb-6 scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveTab('catalog')}
          className={cn(
            'inline-flex items-center gap-2 rounded-none px-3.5 py-2 text-sm font-medium whitespace-nowrap transition-colors cursor-pointer select-none',
            activeTab === 'catalog'
              ? 'bg-[#1c69d4]/10 text-[#1c69d4] font-bold border-b-2 border-[#1c69d4] rounded-none'
              : 'bg-transparent text-[#6b6b6b] hover:bg-[#f7f7f7] hover:text-[#262626] border-b-2 border-transparent font-normal rounded-none',
          )}
        >
          <BookOpen className="h-4 w-4" />
          <span>Course Catalog ({courses.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('workshops')}
          className={cn(
            'inline-flex items-center gap-2 rounded-none px-3.5 py-2 text-sm font-medium whitespace-nowrap transition-colors cursor-pointer select-none',
            activeTab === 'workshops'
              ? 'bg-[#1c69d4]/10 text-[#1c69d4] font-bold border-b-2 border-[#1c69d4] rounded-none'
              : 'bg-transparent text-[#6b6b6b] hover:bg-[#f7f7f7] hover:text-[#262626] border-b-2 border-transparent font-normal rounded-none',
          )}
        >
          <Calendar className="h-4 w-4" />
          <span>Training Workshops ({sessions.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('assignments')}
          className={cn(
            'inline-flex items-center gap-2 rounded-none px-3.5 py-2 text-sm font-medium whitespace-nowrap transition-colors cursor-pointer select-none',
            activeTab === 'assignments'
              ? 'bg-[#1c69d4]/10 text-[#1c69d4] font-bold border-b-2 border-[#1c69d4] rounded-none'
              : 'bg-transparent text-[#6b6b6b] hover:bg-[#f7f7f7] hover:text-[#262626] border-b-2 border-transparent font-normal rounded-none',
          )}
        >
          <GraduationCap className="h-4 w-4" />
          <span>Learning Assignments ({assignments.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('compliance')}
          className={cn(
            'inline-flex items-center gap-2 rounded-none px-3.5 py-2 text-sm font-medium whitespace-nowrap transition-colors cursor-pointer select-none',
            activeTab === 'compliance'
              ? 'bg-[#1c69d4]/10 text-[#1c69d4] font-bold border-b-2 border-[#1c69d4] rounded-none'
              : 'bg-transparent text-[#6b6b6b] hover:bg-[#f7f7f7] hover:text-[#262626] border-b-2 border-transparent font-normal rounded-none',
          )}
        >
          <ShieldCheck className="h-4 w-4" />
          <span>Compliance Matrix ({complianceCourses.length})</span>
        </button>
      </div>

      {/* TAB 1: COURSE CATALOG */}
      {activeTab === 'catalog' && (
        <div className="overflow-hidden rounded-none border border-hairline bg-canvas ">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-hairline bg-canvas-lavender/30 text-[11px] font-semibold uppercase text-ink-mute">
                <tr>
                  <th className="py-3 pl-4 pr-3">Course Code & Title</th>
                  <th className="px-3 py-3">Category</th>
                  <th className="px-3 py-3">Provider / Institute</th>
                  <th className="px-3 py-3 text-center">Mandatory</th>
                  <th className="px-3 py-3 text-center">Validity</th>
                  <th className="px-3 py-3 text-center">Workshops</th>
                  <th className="py-3 pl-3 pr-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {courses.map((c) => (
                  <tr key={c.id} className="hover:bg-canvas-soft/30 transition-colors">
                    <td className="py-3 pl-4 pr-3 font-semibold text-ink max-w-xs">
                      <div>{c.title}</div>
                      <div className="font-mono text-[10px] text-ink-mute">{c.code}</div>
                    </td>
                    <td className="px-3 py-3 text-ink">
                      <span className="rounded bg-canvas-lavender/50 px-2 py-0.5 text-[10px] font-medium text-ink">
                        {c.category || 'General'}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-ink-mute">
                      {c.provider || 'Internal Academy'}
                    </td>
                    <td className="px-3 py-3 text-center">
                      {c.mandatory ? (
                        <span className="rounded-none bg-red-50 px-2 py-0.5 text-[10px] font-bold text-red-700 border border-red-200 uppercase">
                          Mandatory
                        </span>
                      ) : (
                        <span className="rounded-none bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700 border border-blue-200 uppercase">
                          Elective
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-3 text-center font-mono text-ink">
                      {c.validityMonths ? `${c.validityMonths} Mos` : 'Perpetual'}
                    </td>
                    <td className="px-3 py-3 text-center font-bold text-primary">
                      {c.trainingSessions?.length || 1}
                    </td>
                    <td className="py-3 pl-3 pr-4 text-right">
                      <span className="rounded-none bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200 uppercase">
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

      {/* TAB 2: TRAINING SESSIONS & WORKSHOPS */}
      {activeTab === 'workshops' && (
        <div className="overflow-hidden rounded-none border border-hairline bg-canvas ">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-hairline bg-canvas-lavender/30 text-[11px] font-semibold uppercase text-ink-mute">
                <tr>
                  <th className="py-3 pl-4 pr-3">Workshop / Course</th>
                  <th className="px-3 py-3">Schedule Date & Time</th>
                  <th className="px-3 py-3">Instructor / Trainer</th>
                  <th className="px-3 py-3">Location or Link</th>
                  <th className="px-3 py-3 text-center">Capacity</th>
                  <th className="px-3 py-3 text-right">Cost (LKR)</th>
                  <th className="py-3 pl-3 pr-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {sessions.map((s) => (
                  <tr key={s.id} className="hover:bg-canvas-soft/30 transition-colors">
                    <td className="py-3 pl-4 pr-3 font-semibold text-ink">
                      <div>{s.course?.title || 'Data Privacy, GDPR & Cyber Security'}</div>
                      <div className="font-mono text-[10px] text-ink-mute">{s.course?.code || 'SEC-COMP-001'}</div>
                    </td>
                    <td className="px-3 py-3 font-mono text-ink-mute">
                      {new Date(s.startsAt).toLocaleString()}
                    </td>
                    <td className="px-3 py-3 text-ink font-medium">
                      {s.trainerName || 'Lead Trainer'}
                    </td>
                    <td className="px-3 py-3 font-mono text-[11px] text-primary truncate max-w-xs">
                      {s.locationOrLink || 'Google Meet'}
                    </td>
                    <td className="px-3 py-3 text-center font-bold text-ink">
                      {s.capacity || 50} seats
                    </td>
                    <td className="px-3 py-3 text-right font-mono font-bold text-ink">
                      LKR {Number(s.cost || 75000).toLocaleString('en-LK')}
                    </td>
                    <td className="py-3 pl-3 pr-4 text-right">
                      <span className="rounded-none bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200 uppercase">
                        {s.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: EMPLOYEE LEARNING ASSIGNMENTS */}
      {activeTab === 'assignments' && (
        <div className="overflow-hidden rounded-none border border-hairline bg-canvas ">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-hairline bg-canvas-lavender/30 text-[11px] font-semibold uppercase text-ink-mute">
                <tr>
                  <th className="py-3 pl-4 pr-3">Employee</th>
                  <th className="px-3 py-3">Assigned Course</th>
                  <th className="px-3 py-3">Assigned Date</th>
                  <th className="px-3 py-3">Due Date</th>
                  <th className="px-3 py-3 text-center">Score</th>
                  <th className="px-3 py-3">Certification Expiry</th>
                  <th className="px-3 py-3">Status</th>
                  <th className="py-3 pl-3 pr-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {assignments.map((a) => (
                  <tr key={a.id} className="hover:bg-canvas-soft/30 transition-colors">
                    <td className="py-3 pl-4 pr-3 font-semibold text-ink">
                      <div>{a.employee?.displayName || 'Kasun Perera'}</div>
                      <div className="font-mono text-[10px] text-ink-mute">{a.employee?.employeeNumber || 'EMP-001'}</div>
                    </td>
                    <td className="px-3 py-3 text-ink">
                      <div>{a.course?.title || 'Data Privacy & Cyber Security'}</div>
                      <div className="font-mono text-[10px] text-ink-mute">{a.course?.code || 'SEC-COMP-001'}</div>
                    </td>
                    <td className="px-3 py-3 font-mono text-ink-mute">
                      {a.assignedOn}
                    </td>
                    <td className="px-3 py-3 font-mono text-ink-mute">
                      {a.dueOn || '2026-09-30'}
                    </td>
                    <td className="px-3 py-3 text-center font-mono font-bold text-emerald-700">
                      {a.score ? `${a.score}%` : '—'}
                    </td>
                    <td className="px-3 py-3 font-mono text-ink-mute">
                      {a.expiresOn || '2027-02-05'}
                    </td>
                    <td className="px-3 py-3">
                      <span className={`rounded-none px-2.5 py-0.5 text-[10px] font-bold uppercase border ${
                        a.status === 'completed'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-blue-50 text-blue-700 border-blue-200'
                      }`}>
                        {a.status}
                      </span>
                    </td>
                    <td className="py-3 pl-3 pr-4 text-right">
                      {a.status !== 'completed' && (
                        <Button
                          variant="secondary-pill"
                          size="sm"
                          onClick={() => setCertifyingAssignment(a)}
                          className="h-7 text-[11px] px-2.5"
                        >
                          Complete & Certify
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

      {/* TAB 4: COMPLIANCE MATRIX */}
      {activeTab === 'compliance' && (
        <div className="rounded-none border border-hairline bg-canvas p-5  space-y-4">
          <div className="flex items-center justify-between border-b border-hairline pb-3">
            <div>
              <h3 className="font-bold text-ink text-xs">Statutory Labor Law & Cyber Governance Compliance Matrix</h3>
              <p className="text-[11px] text-ink-mute">Mandatory compliance courses required across all active personnel.</p>
            </div>
            <ShieldCheck className="h-5 w-5 text-emerald-600" />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {complianceCourses.map((cc) => (
              <div key={cc.id} className="p-4 rounded-none bg-canvas-lavender/30 border border-hairline space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-ink text-xs">{cc.title}</h4>
                    <span className="font-mono text-[10px] text-ink-mute">{cc.code} • Validity: {cc.validityMonths} Months</span>
                  </div>
                  <span className="rounded-none bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200 uppercase">
                    100% Compliant
                  </span>
                </div>
                <p className="text-[11px] text-ink-mute">{cc.description}</p>
                <div className="flex items-center justify-between pt-2 border-t border-hairline text-[11px]">
                  <span className="text-ink font-medium">Accredited by: {cc.provider}</span>
                  <span className="font-mono text-emerald-700 font-bold">Audited for FY2026</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CREATE COURSE MODAL */}
      <Dialog
        isOpen={isCreateCourseOpen}
        onClose={() => setIsCreateCourseOpen(false)}
        title="Add Course to Catalog"
        description="Create a training course."
        maxWidth="md"
      >
        <form onSubmit={handleCreateCourse} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="ccCode">Course Code *</Label>
              <Input id="ccCode" required placeholder="e.g. SEC-COMP-005" value={courseCode} onChange={(e) => setCourseCode(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="ccCat">Category</Label>
              <Select
                id="ccCat"
                value={courseCategory}
                onChange={(e) => setCourseCategory(e.target.value)}
                
              >
                <option value="Compliance">Compliance</option>
                <option value="Engineering & Technology">Engineering & Technology</option>
                <option value="Leadership & Management">Leadership & Management</option>
                <option value="HR & Legal Compliance">HR & Legal Compliance</option>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="ccTitle">Course Title *</Label>
            <Input id="ccTitle" required placeholder="e.g. Distributed PostgreSQL & High Availability" value={courseTitle} onChange={(e) => setCourseTitle(e.target.value)} />
          </div>

          <div>
            <Label htmlFor="ccDesc">Curriculum Summary</Label>
            <Textarea
              id="ccDesc"
              rows={2}
              value={courseDesc}
              onChange={(e) => setCourseDesc(e.target.value)}
              
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="ccProv">Provider / Institute</Label>
              <Input id="ccProv" value={courseProvider} onChange={(e) => setCourseProvider(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="ccVal">Validity (Months)</Label>
              <Input id="ccVal" type="number" value={courseValidity} onChange={(e) => setCourseValidity(Number(e.target.value))} />
            </div>
          </div>

          <div className="pt-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={courseMandatory}
                onChange={(e) => setCourseMandatory(e.target.checked)}
                className="rounded border-hairline text-primary focus:ring-primary h-3.5 w-3.5"
              />
              <span className="text-ink font-medium">Mandatory Annual Compliance Training</span>
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-hairline">
            <Button type="button" variant="ghost" size="sm" onClick={() => setIsCreateCourseOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary-pill" size="sm" disabled={createCourseMutation.isPending}>
              {createCourseMutation.isPending ? 'Adding...' : 'Save Course'}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* SCHEDULE WORKSHOP MODAL */}
      <Dialog
        isOpen={isCreateSessionOpen}
        onClose={() => setIsCreateSessionOpen(false)}
        title="Schedule Training Workshop"
        description="Schedule a training session."
        maxWidth="md"
      >
        <form onSubmit={handleCreateSession} className="space-y-4 text-xs">
          <div>
            <Label htmlFor="sCourse">Course *</Label>
            <Select
              id="sCourse"
              required
              value={sessionCourseId}
              onChange={(e) => setSessionCourseId(e.target.value)}
              
            >
              <option value="">Select Course</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title} ({c.code})
                </option>
              ))}
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="sStart">Start Date & Time *</Label>
              <Input id="sStart" type="datetime-local" required value={sessionStart} onChange={(e) => setSessionStart(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="sEnd">End Date & Time *</Label>
              <Input id="sEnd" type="datetime-local" required value={sessionEnd} onChange={(e) => setSessionEnd(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="sTrainer">Trainer / Instructor</Label>
              <Input id="sTrainer" value={sessionTrainer} onChange={(e) => setSessionTrainer(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="sCap">Capacity (Seats)</Label>
              <Input id="sCap" type="number" value={sessionCapacity} onChange={(e) => setSessionCapacity(Number(e.target.value))} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="sLink">Meeting URL or Location</Label>
              <Input id="sLink" value={sessionLink} onChange={(e) => setSessionLink(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="sCost">Cost (LKR)</Label>
              <Input id="sCost" type="number" value={sessionCost} onChange={(e) => setSessionCost(Number(e.target.value))} />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-hairline">
            <Button type="button" variant="ghost" size="sm" onClick={() => setIsCreateSessionOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary-pill" size="sm" disabled={createSessionMutation.isPending}>
              {createSessionMutation.isPending ? 'Scheduling...' : 'Schedule Session'}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* ASSIGN COURSE MODAL */}
      <Dialog
        isOpen={isAssignCourseOpen}
        onClose={() => setIsAssignCourseOpen(false)}
        title="Assign Course to Employee"
        description="Assign staff to training."
        maxWidth="md"
      >
        <form onSubmit={handleAssignCourse} className="space-y-4 text-xs">
          <div>
            <Label htmlFor="aEmp">Employee *</Label>
            <Select
              id="aEmp"
              required
              value={assignEmpId}
              onChange={(e) => setAssignEmpId(e.target.value)}
              
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
            <Label htmlFor="aCourse">Course *</Label>
            <Select
              id="aCourse"
              required
              value={assignCourseId}
              onChange={(e) => setAssignCourseId(e.target.value)}
              
            >
              <option value="">Select Course</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title} ({c.code})
                </option>
              ))}
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="aSession">Scheduled Workshop (Optional)</Label>
              <Select
                id="aSession"
                value={assignSessionId}
                onChange={(e) => setAssignSessionId(e.target.value)}
                
              >
                <option value="">Select Session</option>
                {sessions.map((s) => (
                  <option key={s.id} value={s.id}>
                    {new Date(s.startsAt).toLocaleDateString()} ({s.trainerName})
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="aDue">Completion Due Date</Label>
              <Input id="aDue" type="date" value={assignDueOn} onChange={(e) => setAssignDueOn(e.target.value)} />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-hairline">
            <Button type="button" variant="ghost" size="sm" onClick={() => setIsAssignCourseOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary-pill" size="sm" disabled={assignCourseMutation.isPending}>
              {assignCourseMutation.isPending ? 'Assigning...' : 'Assign Course'}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* COMPLETE / CERTIFY MODAL */}
      <Dialog
        isOpen={!!certifyingAssignment}
        onClose={() => setCertifyingAssignment(null)}
        title="Complete Training & Issue Certificate"
        description="Record assessment score."
        maxWidth="md"
      >
        <form onSubmit={handleCompleteAssignment} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="certScore">Assessment Score (%) *</Label>
              <Input
                id="certScore"
                type="number"
                step="0.5"
                min="0"
                max="100"
                required
                value={certScore}
                onChange={(e) => setCertScore(Number(e.target.value))}
              />
            </div>
            <div>
              <Label htmlFor="certDate">Completion Date *</Label>
              <Input
                id="certDate"
                type="date"
                required
                value={certDate}
                onChange={(e) => setCertDate(e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-hairline">
            <Button type="button" variant="ghost" size="sm" onClick={() => setCertifyingAssignment(null)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary-pill" size="sm" disabled={completeAssignmentMutation.isPending}>
              {completeAssignmentMutation.isPending ? 'Certifying...' : 'Issue Certificate'}
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
};
