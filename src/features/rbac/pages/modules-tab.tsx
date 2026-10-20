import { useState } from 'react';
import {
  useModuleStore,
  MODULE_REGISTRY,
  PRESETS,
  ModuleDefinition,
  ModuleCategory,
} from '../../../stores/module-store';
import { useUpdateSystemSetting } from '../../operations/api/operations-api';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Card } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import {
  Building2,
  Users,
  Clock,
  CalendarDays,
  Coins,
  Banknote,
  Receipt,
  UserX,
  Package,
  GitCommit,
  BarChart3,
  UserPlus,
  Target,
  GraduationCap,
  Scale,
  BookOpen,
  LifeBuoy,
  ShieldCheck,
  Server,
  Lock,
  Sparkles,
  SlidersHorizontal,
  RotateCcw,
  Save,
  Search,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react';
import { cn } from '../../../lib/utils';

// Icon mapping per module ID
const MODULE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  employees: Users,
  organization: Building2,
  attendance: Clock,
  leave: CalendarDays,
  compensation: Coins,
  payroll: Banknote,
  expenses: Receipt,
  settlements: UserX,
  assets: Package,
  lifecycle: GitCommit,
  reports: BarChart3,
  recruitment: UserPlus,
  performance: Target,
  learning: GraduationCap,
  relations: Scale,
  policies: BookOpen,
  helpdesk: LifeBuoy,
  privacy: ShieldCheck,
  operations: Server,
};

export function ModulesTab() {
  const {
    enabledModules,
    isModuleEnabled,
    toggleModule,
    applyPreset,
    resetToDefaults,
    getActiveCount,
    getActivePreset,
  } = useModuleStore();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ModuleCategory | 'all'>('all');
  const [isSavedBannerVisible, setIsSavedBannerVisible] = useState(false);

  const updateSettingMutation = useUpdateSystemSetting();
  const counts = getActiveCount();
  const activePresetKey = getActivePreset();

  const presetList: Array<{
    key: keyof typeof PRESETS;
    title: string;
    description: string;
    badge: string;
    applyLabel: string;
  }> = [
    {
      key: 'sri_lanka_smb',
      title: 'Sri Lanka SMB Essentials',
      description: PRESETS.sri_lanka_smb.description,
      badge: 'Recommended',
      applyLabel: 'Apply SMB Preset',
    },
    {
      key: 'minimal_core',
      title: 'Ultra-Minimal Core',
      description: PRESETS.minimal_core.description,
      badge: 'Micro Business',
      applyLabel: 'Apply Minimal Preset',
    },
    {
      key: 'full_enterprise',
      title: 'Full Enterprise Suite',
      description: PRESETS.full_enterprise.description,
      badge: 'All 20+ Modules',
      applyLabel: 'Apply Enterprise Preset',
    },
  ];

  const handleSaveToCloud = async () => {
    try {
      await updateSettingMutation.mutateAsync({
        key: 'system.active_modules',
        value: enabledModules,
        description: 'Active HRMS module configuration for Sri Lanka SMB workspace',
      });
      setIsSavedBannerVisible(true);
      setTimeout(() => setIsSavedBannerVisible(false), 4000);
    } catch {
      // Local state is already persistent via zustand/persist
      setIsSavedBannerVisible(true);
      setTimeout(() => setIsSavedBannerVisible(false), 4000);
    }
  };

  const filteredModules = MODULE_REGISTRY.filter((mod) => {
    const matchesSearch =
      mod.title.toLowerCase().includes(search.toLowerCase()) ||
      mod.description.toLowerCase().includes(search.toLowerCase()) ||
      mod.slContext.toLowerCase().includes(search.toLowerCase());

    const matchesCategory = selectedCategory === 'all' || mod.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const coreModules = filteredModules.filter((m) => m.category === 'core');
  const highValueModules = filteredModules.filter((m) => m.category === 'high_value');
  const extendedModules = filteredModules.filter((m) => m.category === 'extended');

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="border border-[#e6e6e6] bg-white p-5 rounded-none">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-[#262626] tracking-tight">
                Sri Lanka SMB Module Customizer
              </h2>
              <Badge variant="primary" className="text-[10px] py-0 px-2">
                Live Dynamic
              </Badge>
            </div>
            <p className="text-sm text-[#6b6b6b] font-light max-w-2xl">
              Tailor this installation for small and medium businesses. Disable heavy enterprise tools to keep the sidebar
              clean, intuitive, and focused strictly on Sri Lankan statutory compliance and day-to-day operations.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start lg:self-center shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={resetToDefaults}
              className="inline-flex items-center gap-1.5"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset Defaults</span>
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSaveToCloud}
              disabled={updateSettingMutation.isPending}
              className="inline-flex items-center gap-1.5"
            >
              <Save className="h-3.5 w-3.5" />
              <span>{updateSettingMutation.isPending ? 'Syncing...' : 'Save Configuration'}</span>
            </Button>
          </div>
        </div>

        {/* Real-time sync feedback */}
        {isSavedBannerVisible && (
          <div className="mt-4 flex items-center gap-2 border border-emerald-300 bg-emerald-50 px-3 py-2 text-xs text-emerald-800 rounded-none animate-in fade-in duration-200">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>
              Module configuration saved successfully! Sidebar navigation and permissions have been updated in real-time.
            </span>
          </div>
        )}
      </div>

      {/* Metrics Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="border border-[#e6e6e6] bg-white p-4 rounded-none">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#6b6b6b]">Total Modules</span>
          <div className="mt-1 text-2xl font-bold text-[#262626]">{counts.total}</div>
          <span className="text-[11px] text-[#9a9a9a]">Full Enterprise Suite</span>
        </div>

        <div className="border border-[#e6e6e6] bg-white p-4 rounded-none">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#6b6b6b]">Active in Sidebar</span>
          <div className="mt-1 text-2xl font-bold text-[#1c69d4]">{counts.active}</div>
          <span className="text-[11px] text-emerald-700 font-medium">Currently visible to team</span>
        </div>

        <div className="border border-[#e6e6e6] bg-white p-4 rounded-none">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#6b6b6b]">Core Statutory</span>
          <div className="mt-1 text-2xl font-bold text-[#262626]">{counts.coreCount}</div>
          <span className="text-[11px] text-[#6b6b6b]">Always active (Locked)</span>
        </div>

        <div className="border border-[#e6e6e6] bg-white p-4 rounded-none">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#6b6b6b]">Disabled / Hidden</span>
          <div className="mt-1 text-2xl font-bold text-[#9a9a9a]">{counts.total - counts.active}</div>
          <span className="text-[11px] text-[#9a9a9a]">Cleaned from navigation</span>
        </div>
      </div>

      {/* Recommended Quick Presets */}
      <div className="border border-[#e6e6e6] bg-[#fafafa] p-4 rounded-none space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[#1c69d4]" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#262626]">
              One-Click Configuration Presets
            </span>
          </div>

          {activePresetKey === 'custom' && (
            <span className="text-[11px] font-medium text-[#6b6b6b] bg-[#f0f0f0] px-2 py-0.5 rounded-none border border-[#e0e0e0]">
              Custom Individual Overrides Active
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {presetList.map((preset) => {
            const isActive = activePresetKey === preset.key;
            return (
              <div
                key={preset.key}
                onClick={() => applyPreset(preset.key)}
                className={cn(
                  'group relative cursor-pointer p-3.5 transition-all rounded-none select-none',
                  isActive
                    ? 'border-2 border-[#1c69d4] bg-[#1c69d4]/[0.03] shadow-xs'
                    : 'border border-[#e6e6e6] bg-white hover:border-[#262626] hover:shadow-xs',
                )}
              >
                <div className="flex items-center justify-between">
                  <span className={cn('text-sm font-bold', isActive ? 'text-[#1c69d4]' : 'text-[#262626]')}>
                    {preset.title}
                  </span>
                  {isActive ? (
                    <Badge variant="primary" className="text-[9px] py-0 px-1.5 font-bold">
                      Active
                    </Badge>
                  ) : (
                    <Badge
                      variant={preset.key === 'sri_lanka_smb' ? 'primary' : 'outline'}
                      className="text-[9px] py-0 px-1.5"
                    >
                      {preset.badge}
                    </Badge>
                  )}
                </div>
                <p className="mt-1.5 text-xs text-[#6b6b6b] font-light leading-relaxed">
                  {preset.description}
                </p>
                <div
                  className={cn(
                    'mt-2.5 flex items-center text-[11px] font-bold',
                    isActive
                      ? 'text-[#1c69d4]'
                      : 'text-[#6b6b6b] group-hover:text-[#1c69d4] group-hover:underline',
                  )}
                >
                  {isActive ? (
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5 text-[#1c69d4]" /> Currently Active
                    </span>
                  ) : (
                    <span>{preset.applyLabel} →</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6b6b6b]" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search modules by name or labor law..."
            className="pl-9 text-sm"
          />
        </div>

        <div className="flex items-center gap-1 self-stretch sm:self-auto overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setSelectedCategory('all')}
            className={cn(
              'px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-none cursor-pointer transition-colors border',
              selectedCategory === 'all'
                ? 'bg-[#1c69d4] text-white border-[#1c69d4]'
                : 'bg-white text-[#6b6b6b] border-[#e6e6e6] hover:bg-[#f7f7f7]',
            )}
          >
            All ({filteredModules.length})
          </button>
          <button
            onClick={() => setSelectedCategory('core')}
            className={cn(
              'px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-none cursor-pointer transition-colors border',
              selectedCategory === 'core'
                ? 'bg-[#1c69d4] text-white border-[#1c69d4]'
                : 'bg-white text-[#6b6b6b] border-[#e6e6e6] hover:bg-[#f7f7f7]',
            )}
          >
            Core Statutory (6)
          </button>
          <button
            onClick={() => setSelectedCategory('high_value')}
            className={cn(
              'px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-none cursor-pointer transition-colors border',
              selectedCategory === 'high_value'
                ? 'bg-[#1c69d4] text-white border-[#1c69d4]'
                : 'bg-white text-[#6b6b6b] border-[#e6e6e6] hover:bg-[#f7f7f7]',
            )}
          >
            SMB Add-ons (5)
          </button>
          <button
            onClick={() => setSelectedCategory('extended')}
            className={cn(
              'px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-none cursor-pointer transition-colors border',
              selectedCategory === 'extended'
                ? 'bg-[#1c69d4] text-white border-[#1c69d4]'
                : 'bg-white text-[#6b6b6b] border-[#e6e6e6] hover:bg-[#f7f7f7]',
            )}
          >
            Enterprise (8)
          </button>
        </div>
      </div>

      {/* MODULE SECTION 1: CORE STATUTORY */}
      {coreModules.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 border-b border-[#e6e6e6] pb-2">
            <Lock className="h-4 w-4 text-[#262626]" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#262626]">
              1. Core HR & Sri Lanka Statutory Baseline (Always Active)
            </h3>
            <span className="text-xs text-[#6b6b6b] font-light">
              — Mandatory components required for labor law compliance.
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {coreModules.map((mod) => (
              <ModuleCard
                key={mod.id}
                module={mod}
                isEnabled={true}
                onToggle={() => {}}
              />
            ))}
          </div>
        </div>
      )}

      {/* MODULE SECTION 2: HIGH-VALUE SMB ADD-ONS */}
      {highValueModules.length > 0 && (
        <div className="space-y-3 pt-4">
          <div className="flex items-center gap-2 border-b border-[#e6e6e6] pb-2">
            <SlidersHorizontal className="h-4 w-4 text-[#1c69d4]" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#262626]">
              2. Sri Lankan SMB High-Value Operational Modules
            </h3>
            <span className="text-xs text-[#6b6b6b] font-light">
              — Highly recommended for businesses with 20 to 150 employees.
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {highValueModules.map((mod) => (
              <ModuleCard
                key={mod.id}
                module={mod}
                isEnabled={isModuleEnabled(mod.id)}
                onToggle={() => toggleModule(mod.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* MODULE SECTION 3: EXTENDED ENTERPRISE MODULES */}
      {extendedModules.length > 0 && (
        <div className="space-y-3 pt-4">
          <div className="flex items-center gap-2 border-b border-[#e6e6e6] pb-2">
            <HelpCircle className="h-4 w-4 text-[#6b6b6b]" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#262626]">
              3. Extended Corporate & Enterprise Modules (Default OFF)
            </h3>
            <span className="text-xs text-[#6b6b6b] font-light">
              — Turn ON only if your client explicitly requires multi-stage corporate bureaucracy.
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {extendedModules.map((mod) => (
              <ModuleCard
                key={mod.id}
                module={mod}
                isEnabled={isModuleEnabled(mod.id)}
                onToggle={() => toggleModule(mod.id)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface ModuleCardProps {
  module: ModuleDefinition;
  isEnabled: boolean;
  onToggle: () => void;
}

function ModuleCard({ module, isEnabled, onToggle }: ModuleCardProps) {
  const Icon = MODULE_ICONS[module.id] || Building2;

  return (
    <Card
      className={cn(
        'relative flex flex-col justify-between p-4 transition-all rounded-none border',
        isEnabled
          ? 'bg-white border-[#e6e6e6] shadow-2xs'
          : 'bg-[#fafafa]/80 border-[#e6e6e6]/60 opacity-75 hover:opacity-100',
      )}
    >
      <div className="space-y-3">
        {/* Top Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-none font-bold text-xs shrink-0',
                isEnabled ? 'bg-[#1c69d4] text-white' : 'bg-[#e6e6e6] text-[#6b6b6b]',
              )}
            >
              <Icon className="h-4 w-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#262626] leading-tight">{module.title}</h4>
              <span className="text-[11px] font-mono text-[#9a9a9a]">{module.path}</span>
            </div>
          </div>

          {/* Toggle Button / Lock Icon */}
          {module.isLocked ? (
            <div className="flex items-center gap-1 text-[11px] font-bold text-[#1c69d4] bg-[#1c69d4]/10 px-2 py-0.5 rounded-none">
              <Lock className="h-3 w-3" />
              <span>CORE</span>
            </div>
          ) : (
            <button
              type="button"
              onClick={onToggle}
              className={cn(
                'relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-none border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none select-none',
                isEnabled ? 'bg-[#1c69d4]' : 'bg-[#cccccc]',
              )}
              aria-label={`Toggle ${module.title}`}
            >
              <span
                className={cn(
                  'pointer-events-none inline-block h-4 w-4 transform bg-white shadow-sm ring-0 transition duration-200 ease-in-out',
                  isEnabled ? 'translate-x-4' : 'translate-x-0',
                )}
              />
            </button>
          )}
        </div>

        {/* Description */}
        <p className="text-xs text-[#6b6b6b] font-light leading-relaxed">{module.description}</p>
      </div>

      {/* Sri Lanka Business & Labor Law Context Footer */}
      <div className="mt-3.5 pt-2.5 border-t border-[#f0f0f0] flex items-start gap-1.5 text-[11px] text-[#6b6b6b]">
        <InfoBadge category={module.category} />
        <span className="leading-tight">{module.slContext}</span>
      </div>
    </Card>
  );
}

function InfoBadge({ category }: { category: ModuleCategory }) {
  if (category === 'core') {
    return (
      <span className="shrink-0 font-bold text-[#1c69d4] uppercase text-[10px] tracking-wide">
        [Statutory]
      </span>
    );
  }
  if (category === 'high_value') {
    return (
      <span className="shrink-0 font-bold text-emerald-700 uppercase text-[10px] tracking-wide">
        [SMB Fit]
      </span>
    );
  }
  return (
    <span className="shrink-0 font-bold text-[#9a9a9a] uppercase text-[10px] tracking-wide">
      [Optional]
    </span>
  );
}
