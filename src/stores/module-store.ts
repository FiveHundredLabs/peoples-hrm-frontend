import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type ModuleCategory = 'core' | 'high_value' | 'extended' | 'system';

export interface ModuleDefinition {
  id: string;
  title: string;
  category: ModuleCategory;
  path: string;
  description: string;
  slContext: string;
  isLocked?: boolean; // Core modules cannot be disabled
  defaultEnabled: boolean;
}

export const MODULE_REGISTRY: ModuleDefinition[] = [
  // 1. CORE HR & STATUTORY (Locked Active)
  {
    id: 'employees',
    title: 'Employee Directory & Profiles',
    category: 'core',
    path: '/employees',
    description: 'Central digital records, NIC, personal details, bank accounts, and statutory identity.',
    slContext: 'Mandatory master data directory for all employees.',
    isLocked: true,
    defaultEnabled: true,
  },
  {
    id: 'organization',
    title: 'Organization & Branches',
    category: 'core',
    path: '/organization',
    description: 'Business legal entities, branch locations, departments, and public holiday calendars.',
    slContext: 'Configures Colombo/regional offices and Sri Lankan mercantile holiday calendars.',
    isLocked: true,
    defaultEnabled: true,
  },
  {
    id: 'attendance',
    title: 'Attendance & Time Tracking',
    category: 'core',
    path: '/attendance',
    description: 'Biometric device synchronization (Hikvision/ZKTeco), punch logs, shifts, and overtime (OT).',
    slContext: 'Critical for computing monthly OT hours, late deductions, and shift work in SL SMBs.',
    isLocked: true,
    defaultEnabled: true,
  },
  {
    id: 'leave',
    title: 'Leave & Balances',
    category: 'core',
    path: '/leave',
    description: 'Annual (14), Casual (7), Medical, and Maternity leave quotas with approval workflows.',
    slContext: 'Enforces statutory compliance with the Shop and Office Employees Act & Wages Boards.',
    isLocked: true,
    defaultEnabled: true,
  },
  {
    id: 'compensation',
    title: 'Compensation & Salary Bands',
    category: 'core',
    path: '/compensation',
    description: 'Basic salary structures, Budgetary Relief Allowance (BRA), and fixed allowances.',
    slContext: 'Manages salary components that form the qualifying base for EPF/ETF contributions.',
    isLocked: true,
    defaultEnabled: true,
  },
  {
    id: 'payroll',
    title: 'Statutory Payroll (EPF / ETF / APIT)',
    category: 'core',
    path: '/payroll',
    description: 'Automated Gross-to-Net payroll, EPF (8%/12%), ETF (3%), APIT tax, and payslips.',
    slContext: 'Core engine for generating Sri Lankan C-Form schedules and bank transfer batch files.',
    isLocked: true,
    defaultEnabled: true,
  },

  // 2. HIGH-VALUE SRI LANKAN SMB ADD-ONS (Recommended ON for growing businesses)
  {
    id: 'expenses',
    title: 'Expenses & Salary Advances / Loans',
    category: 'high_value',
    path: '/expenses',
    description: 'Employee expense claims, festival advances (Avurudu/Christmas), and loan deduction schedules.',
    slContext: 'Extremely popular in Sri Lankan workplaces where salary advances are a monthly operational norm.',
    defaultEnabled: true,
  },
  {
    id: 'settlements',
    title: 'Final Settlement & Gratuity',
    category: 'high_value',
    path: '/settlements',
    description: 'Separation calculations, Payment of Gratuity Act (half-month per year >5 yrs), and leave encashment.',
    slContext: 'Ensures lawful final payouts and statutory gratuity compliance when staff resign or retire.',
    defaultEnabled: true,
  },
  {
    id: 'assets',
    title: 'Asset Management',
    category: 'high_value',
    path: '/assets',
    description: 'Company laptop, phone, monitor, SIM card, and equipment assignment tracking.',
    slContext: 'Prevents asset loss during onboarding and exit handovers in small teams.',
    defaultEnabled: true,
  },
  {
    id: 'lifecycle',
    title: 'Career & Probation Lifecycle',
    category: 'high_value',
    path: '/lifecycle',
    description: 'Probation 3/6-month review alerts, confirmations, transfers, and promotion logs.',
    slContext: 'Standardizes the 6-month probation confirmation process commonly mandated in SL.',
    defaultEnabled: true,
  },
  {
    id: 'reports',
    title: 'Reports & Statutory Analytics',
    category: 'high_value',
    path: '/reports',
    description: 'EPF/ETF monthly summaries, headcount analytics, payroll registers, and audit exports.',
    slContext: 'Provides ready-to-print schedules for company auditors and labor department inspections.',
    defaultEnabled: true,
  },

  // 3. EXTENDED ENTERPRISE MODULES (Default OFF for SMBs to keep UI clean)
  {
    id: 'recruitment',
    title: 'Recruitment & ATS Pipeline',
    category: 'extended',
    path: '/recruitment',
    description: 'Job requisitions, applicant tracking, interview stages, and formal offer letters.',
    slContext: 'Enterprise feature. Most SMBs handle hiring through TopJobs/LinkedIn and direct email.',
    defaultEnabled: false,
  },
  {
    id: 'performance',
    title: 'Performance & 360 Reviews',
    category: 'extended',
    path: '/performance',
    description: 'Goal cascading, multi-rater 360 reviews, competency matrices, and appraisal cycles.',
    slContext: 'Enterprise feature. Usually too bureaucratic for lean teams with under 50 staff.',
    defaultEnabled: false,
  },
  {
    id: 'learning',
    title: 'Learning & Training (LMS)',
    category: 'extended',
    path: '/learning',
    description: 'Course catalogs, training sessions, enrollment tracking, and certification records.',
    slContext: 'Enterprise feature. SMBs typically conduct informal on-the-job mentorship.',
    defaultEnabled: false,
  },
  {
    id: 'relations',
    title: 'HR Relations, Cases & Safety',
    category: 'extended',
    path: '/relations',
    description: 'Formal disciplinary inquiry boards, grievance case tracking, and workplace safety incidents.',
    slContext: 'Enterprise feature. Handled directly between management and staff in smaller companies.',
    defaultEnabled: false,
  },
  {
    id: 'policies',
    title: 'Policies & Document Governance',
    category: 'extended',
    path: '/policies',
    description: 'Company handbook repository with mandatory electronic employee acknowledgement tracking.',
    slContext: 'Enterprise feature. Large companies use this for corporate policy compliance.',
    defaultEnabled: false,
  },
  {
    id: 'helpdesk',
    title: 'Employee Support Helpdesk',
    category: 'extended',
    path: '/helpdesk',
    description: 'Internal ticketing portal for HR queries, SLA escalation, and ticket queues.',
    slContext: 'Enterprise feature. Small teams typically communicate directly or via WhatsApp.',
    defaultEnabled: false,
  },
  {
    id: 'privacy',
    title: 'Privacy & Data Governance (PDPA)',
    category: 'extended',
    path: '/privacy',
    description: 'Automated data subject access requests (DSAR), consent management, and legal hold tracking.',
    slContext: 'Enterprise feature. Automated self-service DSAR is not required for daily SMB workflows.',
    defaultEnabled: false,
  },
  {
    id: 'operations',
    title: 'Operations & Outbound Webhooks',
    category: 'extended',
    path: '/operations',
    description: 'Real-time telemetry, notification dispatch logs, and third-party webhook integrations.',
    slContext: 'Developer/IT operations tool for integrating with external enterprise ERPs.',
    defaultEnabled: false,
  },
];

export type ModuleId = typeof MODULE_REGISTRY[number]['id'];

// Default presets
export const PRESETS = {
  sri_lanka_smb: {
    name: 'Sri Lanka SMB Essentials (Recommended)',
    description: 'Enables Core HR, Statutory Payroll, Leave, Attendance, Salary Advances & Gratuity. Hides heavy enterprise modules.',
    enabledModules: [
      'employees',
      'organization',
      'attendance',
      'leave',
      'compensation',
      'payroll',
      'expenses',
      'settlements',
      'assets',
      'lifecycle',
      'reports',
    ],
  },
  minimal_core: {
    name: 'Ultra-Minimal Core Only',
    description: 'Stripped down to the bare essentials: Employee profiles, Attendance, Leave, and Statutory Payroll.',
    enabledModules: [
      'employees',
      'organization',
      'attendance',
      'leave',
      'compensation',
      'payroll',
    ],
  },
  full_enterprise: {
    name: 'Full Enterprise Suite',
    description: 'Unlocks all 20+ modules including Recruitment ATS, 360 Appraisals, LMS, Grievances, and Telemetry.',
    enabledModules: MODULE_REGISTRY.map((m) => m.id),
  },
};

interface ModuleState {
  enabledModules: Record<string, boolean>;
  isModuleEnabled: (id: string) => boolean;
  toggleModule: (id: string) => void;
  setModuleEnabled: (id: string, enabled: boolean) => void;
  applyPreset: (presetKey: keyof typeof PRESETS) => void;
  resetToDefaults: () => void;
  getActiveCount: () => { total: number; active: number; coreCount: number; optionalCount: number };
  getActivePreset: () => keyof typeof PRESETS | 'custom';
}

const getDefaultEnabledMap = (): Record<string, boolean> => {
  const map: Record<string, boolean> = {};
  MODULE_REGISTRY.forEach((mod) => {
    map[mod.id] = mod.defaultEnabled;
  });
  return map;
};

export const useModuleStore = create<ModuleState>()(
  persist(
    (set, get) => ({
      enabledModules: getDefaultEnabledMap(),

      isModuleEnabled: (id: string) => {
        const mod = MODULE_REGISTRY.find((m) => m.id === id);
        if (mod?.isLocked) return true;
        const current = get().enabledModules;
        return current[id] ?? mod?.defaultEnabled ?? true;
      },

      toggleModule: (id: string) => {
        const mod = MODULE_REGISTRY.find((m) => m.id === id);
        if (mod?.isLocked) return; // Cannot toggle locked core modules

        set((state) => ({
          enabledModules: {
            ...state.enabledModules,
            [id]: !state.enabledModules[id],
          },
        }));
      },

      setModuleEnabled: (id: string, enabled: boolean) => {
        const mod = MODULE_REGISTRY.find((m) => m.id === id);
        if (mod?.isLocked) return;

        set((state) => ({
          enabledModules: {
            ...state.enabledModules,
            [id]: enabled,
          },
        }));
      },

      applyPreset: (presetKey: keyof typeof PRESETS) => {
        const preset = PRESETS[presetKey];
        if (!preset) return;

        const newMap: Record<string, boolean> = {};
        MODULE_REGISTRY.forEach((mod) => {
          if (mod.isLocked) {
            newMap[mod.id] = true;
          } else {
            newMap[mod.id] = preset.enabledModules.includes(mod.id);
          }
        });

        set({ enabledModules: newMap });
      },

      resetToDefaults: () => {
        set({ enabledModules: getDefaultEnabledMap() });
      },

      getActiveCount: () => {
        const current = get().enabledModules;
        let active = 0;
        let coreCount = 0;
        let optionalCount = 0;

        MODULE_REGISTRY.forEach((mod) => {
          const isEnabled = mod.isLocked || current[mod.id] === true;
          if (isEnabled) active++;
          if (mod.category === 'core') coreCount++;
          if (mod.category !== 'core' && isEnabled) optionalCount++;
        });

        return {
          total: MODULE_REGISTRY.length,
          active,
          coreCount,
          optionalCount,
        };
      },

      getActivePreset: () => {
        const current = get().enabledModules;
        for (const [key, preset] of Object.entries(PRESETS)) {
          const isMatch = MODULE_REGISTRY.every((mod) => {
            if (mod.isLocked) return true;
            const shouldBeEnabled = preset.enabledModules.includes(mod.id);
            const isActuallyEnabled = current[mod.id] ?? mod.defaultEnabled;
            return shouldBeEnabled === isActuallyEnabled;
          });
          if (isMatch) return key as keyof typeof PRESETS;
        }
        return 'custom';
      },
    }),
    {
      name: 'sri-lanka-hrms-module-config',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
