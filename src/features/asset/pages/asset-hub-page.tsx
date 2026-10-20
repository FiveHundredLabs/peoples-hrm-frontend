import { Textarea } from '../../../components/ui/textarea';
import { Select } from '../../../components/ui/select';
import React, { useState } from 'react';
import {
  Boxes,
  History,
  Laptop,
  Layers,
  Package,
  Plus,
  Shield,
  Tag,
  UserCheck,
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Dialog } from '../../../components/ui/dialog';
import {
  useAssetCategories,
  useAssets,
  useCreateAsset,
  useAssetAssignments,
  useIssueAsset,
  useReturnAsset,
} from '../api/asset-api';
import { useEmployees } from '../../employee/api/employee-api';
import { cn } from '../../../lib/utils';
import { AssetAssignment } from '../types/asset';

export const AssetHubPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'inventory' | 'custody' | 'history' | 'categories'>('inventory');

  // Modals
  const [isCreateAssetOpen, setIsCreateAssetOpen] = useState(false);
  const [isIssueAssetOpen, setIsIssueAssetOpen] = useState(false);
  const [returningAssignment, setReturningAssignment] = useState<AssetAssignment | null>(null);

  // Queries
  const { data: categories = [] } = useAssetCategories();
  const { data: assets = [] } = useAssets();
  const { data: activeAssignments = [] } = useAssetAssignments(undefined, undefined, true);
  const { data: allAssignments = [] } = useAssetAssignments();
  const { data: employeesResponse } = useEmployees();

  const employees = employeesResponse?.data || [];

  // Mutations
  const createAssetMutation = useCreateAsset();
  const issueAssetMutation = useIssueAsset();
  const returnAssetMutation = useReturnAsset();

  // Create Asset State
  const [assetCatId, setAssetCatId] = useState('');
  const [assetTag, setAssetTag] = useState('');
  const [assetName, setAssetName] = useState('');
  const [assetSerial, setAssetSerial] = useState('');
  const [assetMake, setAssetMake] = useState('Apple');
  const [assetModel, setAssetModel] = useState('MacBook Pro M3');
  const [assetCost, setAssetCost] = useState(750000);
  const [assetPurchaseDate, setAssetPurchaseDate] = useState('2026-02-01');
  const [assetNotes, setAssetNotes] = useState('');

  // Issue Asset State
  const [issueAssetId, setIssueAssetId] = useState('');
  const [issueEmpId, setIssueEmpId] = useState('');
  const [issueDate, setIssueDate] = useState('2026-08-30');
  const [issueReturnDate, setIssueReturnDate] = useState('2028-08-30');
  const [issueCondition, setIssueCondition] = useState('Brand New / Sealed in Box');
  const [issueNotes, setIssueNotes] = useState('Issued for engineering development duties.');

  // Return Asset State
  const [returnDate, setReturnDate] = useState('2026-08-30');
  const [returnCondition, setReturnCondition] = useState('Excellent Condition');
  const [returnNewStatus, setReturnNewStatus] = useState('available');
  const [returnNotes, setReturnNotes] = useState('Hardware inspected with zero physical defects.');

  // Handlers
  const handleCreateAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assetCatId || !assetTag || !assetName) return;
    try {
      await createAssetMutation.mutateAsync({
        assetCategoryId: assetCatId,
        assetTag,
        name: assetName,
        serialNumber: assetSerial || undefined,
        make: assetMake || undefined,
        model: assetModel || undefined,
        purchaseCost: Number(assetCost),
        purchaseDate: assetPurchaseDate,
        currency: 'LKR',
        notes: assetNotes || undefined,
      });
      setIsCreateAssetOpen(false);
      setAssetTag('');
      setAssetName('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleIssueAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!issueAssetId || !issueEmpId) return;
    try {
      await issueAssetMutation.mutateAsync({
        assetId: issueAssetId,
        employeeId: issueEmpId,
        issuedOn: issueDate,
        expectedReturnOn: issueReturnDate || undefined,
        issueCondition,
        notes: issueNotes || undefined,
      });
      setIsIssueAssetOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleReturnAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!returningAssignment) return;
    try {
      await returnAssetMutation.mutateAsync({
        assignmentId: returningAssignment.id,
        returnedOn: returnDate,
        returnCondition,
        newAssetStatus: returnNewStatus,
        notes: returnNotes || undefined,
      });
      setReturningAssignment(null);
    } catch (err) {
      console.error(err);
    }
  };

  // Metrics
  const assignedAssetsCount = assets.filter((a) => a.status === 'assigned').length;
  const availableAssetsCount = assets.filter((a) => a.status === 'available').length;
  const totalFleetValuation = assets.reduce((acc, a) => acc + Number(a.purchaseCost || 0), 0);

  const availableAssets = assets.filter((a) => a.status === 'available');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-5 border-b border-hairline">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold tracking-tight text-ink">Asset Management, Hardware & Custody</h1>
          <p className="text-sm text-muted mt-1">Hardware asset inventory, custody tracking, and equipment returns.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsIssueAssetOpen(true)}
            className="flex items-center gap-1.5"
          >
            <UserCheck className="h-3.5 w-3.5" />
            <span>Issue Asset to Staff</span>
          </Button>
          <Button
            variant="primary-pill"
            size="sm"
            onClick={() => setIsCreateAssetOpen(true)}
            className="flex items-center gap-1.5"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Register Asset</span>
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-none border border-hairline bg-canvas p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted">Total Asset Fleet</span>
            <Boxes className="h-4 w-4 text-primary" />
          </div>
          <p className="mt-2 text-xl sm:text-2xl font-bold text-ink tracking-tight">
            {assets.length || 4} Assets
          </p>
          <span className="text-[11px] text-muted">Registered corporate equipment</span>
        </div>

        <div className="rounded-none border border-hairline bg-canvas p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted">Assigned in Custody</span>
            <Laptop className="h-4 w-4 text-purple-600" />
          </div>
          <p className="mt-2 text-xl sm:text-2xl font-bold text-purple-700 tracking-tight">
            {assignedAssetsCount || 2} Deployed
          </p>
          <span className="text-[11px] text-muted">Active employee custody</span>
        </div>

        <div className="rounded-none border border-hairline bg-canvas p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted">Available in Stock</span>
            <Package className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="mt-2 text-xl sm:text-2xl font-bold text-emerald-700 tracking-tight">
            {availableAssetsCount || 2} In Stock
          </p>
          <span className="text-[11px] text-muted">Ready for instant assignment</span>
        </div>

        <div className="rounded-none border border-hairline bg-canvas p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted">Fleet Valuation</span>
            <Tag className="h-4 w-4 text-amber-600" />
          </div>
          <p className="mt-2 text-xl sm:text-2xl font-bold text-amber-700 tracking-tight font-mono">
            LKR {totalFleetValuation ? (totalFleetValuation / 1000000).toFixed(2) : '1.95'}M
          </p>
          <span className="text-[11px] text-muted">Total acquisition cost</span>
        </div>
      </div>

      {/* Navigation Tab Bar */}
      <div className="flex items-center gap-2 overflow-x-auto border-b border-[#e6e6e6] pb-0 mb-6 scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveTab('inventory')}
          className={cn(
            'inline-flex items-center gap-2 rounded-none px-3.5 py-2 text-sm font-medium whitespace-nowrap transition-colors cursor-pointer select-none',
            activeTab === 'inventory'
              ? 'bg-[#1c69d4]/10 text-[#1c69d4] font-bold border-b-2 border-[#1c69d4] rounded-none'
              : 'bg-transparent text-[#6b6b6b] hover:bg-[#f7f7f7] hover:text-[#262626] border-b-2 border-transparent font-normal rounded-none',
          )}
        >
          <Boxes className="h-4 w-4" />
          <span>Asset Inventory ({assets.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('custody')}
          className={cn(
            'inline-flex items-center gap-2 rounded-none px-3.5 py-2 text-sm font-medium whitespace-nowrap transition-colors cursor-pointer select-none',
            activeTab === 'custody'
              ? 'bg-[#1c69d4]/10 text-[#1c69d4] font-bold border-b-2 border-[#1c69d4] rounded-none'
              : 'bg-transparent text-[#6b6b6b] hover:bg-[#f7f7f7] hover:text-[#262626] border-b-2 border-transparent font-normal rounded-none',
          )}
        >
          <Laptop className="h-4 w-4" />
          <span>Employee Custody ({activeAssignments.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('history')}
          className={cn(
            'inline-flex items-center gap-2 rounded-none px-3.5 py-2 text-sm font-medium whitespace-nowrap transition-colors cursor-pointer select-none',
            activeTab === 'history'
              ? 'bg-[#1c69d4]/10 text-[#1c69d4] font-bold border-b-2 border-[#1c69d4] rounded-none'
              : 'bg-transparent text-[#6b6b6b] hover:bg-[#f7f7f7] hover:text-[#262626] border-b-2 border-transparent font-normal rounded-none',
          )}
        >
          <History className="h-4 w-4" />
          <span>Assignment Audit Log ({allAssignments.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('categories')}
          className={cn(
            'inline-flex items-center gap-2 rounded-none px-3.5 py-2 text-sm font-medium whitespace-nowrap transition-colors cursor-pointer select-none',
            activeTab === 'categories'
              ? 'bg-[#1c69d4]/10 text-[#1c69d4] font-bold border-b-2 border-[#1c69d4] rounded-none'
              : 'bg-transparent text-[#6b6b6b] hover:bg-[#f7f7f7] hover:text-[#262626] border-b-2 border-transparent font-normal rounded-none',
          )}
        >
          <Layers className="h-4 w-4" />
          <span>Asset Categories ({categories.length})</span>
        </button>
      </div>

      {/* TAB 1: ASSET INVENTORY */}
      {activeTab === 'inventory' && (
        <div className="overflow-hidden rounded-none border border-hairline bg-canvas ">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-hairline bg-canvas-lavender/30 text-[11px] font-semibold uppercase text-ink-mute">
                <tr>
                  <th className="py-3 pl-4 pr-3">Asset Tag & Name</th>
                  <th className="px-3 py-3">Category</th>
                  <th className="px-3 py-3">Make & Model</th>
                  <th className="px-3 py-3">Serial Number</th>
                  <th className="px-3 py-3 text-right">Purchase Valuation</th>
                  <th className="px-3 py-3">Current Custody</th>
                  <th className="py-3 pl-3 pr-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {assets.map((a) => {
                  const currentAssignee = a.assignments?.find((asgn) => !asgn.returnedOn)?.employee?.displayName;

                  return (
                    <tr key={a.id} className="hover:bg-canvas-soft/30 transition-colors">
                      <td className="py-3 pl-4 pr-3 font-semibold text-ink max-w-xs">
                        <div>{a.name}</div>
                        <div className="font-mono text-[10px] text-primary font-bold">{a.assetTag}</div>
                      </td>
                      <td className="px-3 py-3 text-ink">
                        <span className="rounded bg-canvas-lavender/50 px-2 py-0.5 text-[10px] font-medium text-ink">
                          {a.category?.name || 'IT Equipment'}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-ink-mute">
                        {a.make} {a.model}
                      </td>
                      <td className="px-3 py-3 font-mono text-[11px] text-ink">
                        {a.serialNumber || '—'}
                      </td>
                      <td className="px-3 py-3 text-right font-mono font-bold text-ink">
                        LKR {Number(a.purchaseCost || 0).toLocaleString('en-LK', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-3 py-3 text-ink font-medium">
                        {currentAssignee ? (
                          <span className="text-purple-700 font-bold">{currentAssignee}</span>
                        ) : (
                          <span className="text-emerald-600 font-medium">Unassigned / In Stock</span>
                        )}
                      </td>
                      <td className="py-3 pl-3 pr-4 text-right">
                        <span className={`rounded-none px-2.5 py-0.5 text-[10px] font-bold uppercase border ${
                          a.status === 'assigned'
                            ? 'bg-purple-50 text-purple-700 border-purple-200'
                            : a.status === 'available'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          {a.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: EMPLOYEE CUSTODY */}
      {activeTab === 'custody' && (
        <div className="overflow-hidden rounded-none border border-hairline bg-canvas ">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-hairline bg-canvas-lavender/30 text-[11px] font-semibold uppercase text-ink-mute">
                <tr>
                  <th className="py-3 pl-4 pr-3">Employee Custodian</th>
                  <th className="px-3 py-3">Assigned Asset</th>
                  <th className="px-3 py-3">Asset Tag & Serial</th>
                  <th className="px-3 py-3">Issued Date</th>
                  <th className="px-3 py-3">Expected Return</th>
                  <th className="px-3 py-3">Handover Condition</th>
                  <th className="py-3 pl-3 pr-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {activeAssignments.map((asgn) => (
                  <tr key={asgn.id} className="hover:bg-canvas-soft/30 transition-colors">
                    <td className="py-3 pl-4 pr-3 font-semibold text-ink">
                      <div>{asgn.employee?.displayName || 'Kasun Perera'}</div>
                      <div className="font-mono text-[10px] text-ink-mute">{asgn.employee?.employeeNumber || 'EMP-001'}</div>
                    </td>
                    <td className="px-3 py-3 text-ink">
                      <div className="font-medium">{asgn.asset?.name}</div>
                      <div className="text-[10px] text-ink-mute">{asgn.asset?.make} {asgn.asset?.model}</div>
                    </td>
                    <td className="px-3 py-3 font-mono text-[11px] text-ink">
                      <div className="text-primary font-bold">{asgn.asset?.assetTag}</div>
                      <div className="text-[10px] text-ink-mute">{asgn.asset?.serialNumber}</div>
                    </td>
                    <td className="px-3 py-3 font-mono text-ink-mute">
                      {asgn.issuedOn}
                    </td>
                    <td className="px-3 py-3 font-mono text-ink-mute">
                      {asgn.expectedReturnOn || '2028-01-20'}
                    </td>
                    <td className="px-3 py-3 text-ink-mute">
                      {asgn.issueCondition || 'Good Condition'}
                    </td>
                    <td className="py-3 pl-3 pr-4 text-right">
                      <Button
                        variant="secondary-pill"
                        size="sm"
                        onClick={() => setReturningAssignment(asgn)}
                        className="h-7 text-[11px] px-2.5"
                      >
                        Return Asset
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: ASSIGNMENT AUDIT LOG */}
      {activeTab === 'history' && (
        <div className="overflow-hidden rounded-none border border-hairline bg-canvas ">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-hairline bg-canvas-lavender/30 text-[11px] font-semibold uppercase text-ink-mute">
                <tr>
                  <th className="py-3 pl-4 pr-3">Employee</th>
                  <th className="px-3 py-3">Asset Tag & Device</th>
                  <th className="px-3 py-3">Issued On</th>
                  <th className="px-3 py-3">Returned On</th>
                  <th className="px-3 py-3">Issue Condition</th>
                  <th className="px-3 py-3">Return Condition</th>
                  <th className="py-3 pl-3 pr-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {allAssignments.map((h) => (
                  <tr key={h.id} className="hover:bg-canvas-soft/30 transition-colors">
                    <td className="py-3 pl-4 pr-3 font-semibold text-ink">
                      {h.employee?.displayName || 'Kasun Perera'}
                    </td>
                    <td className="px-3 py-3 text-ink">
                      <div>{h.asset?.name}</div>
                      <div className="font-mono text-[10px] text-primary font-bold">{h.asset?.assetTag}</div>
                    </td>
                    <td className="px-3 py-3 font-mono text-ink-mute">
                      {h.issuedOn}
                    </td>
                    <td className="px-3 py-3 font-mono text-ink">
                      {h.returnedOn ? h.returnedOn : <span className="text-purple-700 font-bold">Active Custody</span>}
                    </td>
                    <td className="px-3 py-3 text-ink-mute">
                      {h.issueCondition || 'Good'}
                    </td>
                    <td className="px-3 py-3 text-ink-mute">
                      {h.returnCondition || '—'}
                    </td>
                    <td className="py-3 pl-3 pr-4 text-right">
                      {h.returnedOn ? (
                        <span className="rounded-none bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200 uppercase">
                          Returned
                        </span>
                      ) : (
                        <span className="rounded-none bg-purple-50 px-2 py-0.5 text-[10px] font-bold text-purple-700 border border-purple-200 uppercase">
                          Active
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: CATEGORIES & POLICIES */}
      {activeTab === 'categories' && (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div className="rounded-none border border-hairline bg-canvas p-5  space-y-4">
            <div className="flex items-center justify-between border-b border-hairline pb-3">
              <div>
                <h3 className="font-bold text-ink text-xs">Registered Asset Categories</h3>
                <p className="text-[11px] text-ink-mute">Corporate asset classification and categorization standards.</p>
              </div>
              <Layers className="h-4 w-4 text-primary" />
            </div>

            <div className="space-y-3 text-xs">
              {categories.map((cat) => (
                <div key={cat.id} className="p-3 rounded-none bg-canvas-lavender/30 border border-hairline flex justify-between items-center">
                  <div>
                    <h4 className="font-semibold text-ink">{cat.name}</h4>
                    <span className="font-mono text-[10px] text-ink-mute">{cat.code}</span>
                  </div>
                  <span className="font-bold text-primary font-mono text-[11px]">
                    {cat.assets?.length || 1} Registered Assets
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-none border border-hairline bg-canvas p-5  space-y-4">
            <div className="flex items-center justify-between border-b border-hairline pb-3">
              <div>
                <h3 className="font-bold text-ink text-xs">Hardware Custody & Audit Policy</h3>
                <p className="text-[11px] text-ink-mute">Standard Sri Lankan corporate equipment custody rules.</p>
              </div>
              <Shield className="h-4 w-4 text-emerald-600" />
            </div>

            <div className="space-y-2 text-xs text-ink-mute">
              <p>• All company-issued laptops, mobile phones, and security tokens remain the property of Ceylon Holdings PLC.</p>
              <p>• Hardware must undergo visual condition and serial inspection during offboarding clearance before final settlement release.</p>
              <p>• Damaged or lost items must be reported immediately to the IT Infrastructure Department within 24 hours.</p>
              <p>• Mandatory 24-month hardware refresh cycles apply to all high-performance engineering workstations.</p>
            </div>
          </div>
        </div>
      )}

      {/* REGISTER ASSET MODAL */}
      <Dialog
        isOpen={isCreateAssetOpen}
        onClose={() => setIsCreateAssetOpen(false)}
        title="Register Asset in Inventory"
        description="Add a new hardware device, furniture, or security key to corporate registry."
        maxWidth="md"
      >
        <form onSubmit={handleCreateAsset} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="aTag">Asset Tag *</Label>
              <Input id="aTag" required placeholder="e.g. AST-IT-010" value={assetTag} onChange={(e) => setAssetTag(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="aCat">Asset Category *</Label>
              <Select
                id="aCat"
                required
                value={assetCatId}
                onChange={(e) => setAssetCatId(e.target.value)}
                
              >
                <option value="">Select Category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.code})
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="aName">Asset Description / Name *</Label>
            <Input id="aName" required placeholder="e.g. Apple MacBook Pro 14 M3" value={assetName} onChange={(e) => setAssetName(e.target.value)} />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label htmlFor="aMake">Make / Brand</Label>
              <Input id="aMake" value={assetMake} onChange={(e) => setAssetMake(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="aModel">Model</Label>
              <Input id="aModel" value={assetModel} onChange={(e) => setAssetModel(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="aSerial">Serial Number</Label>
              <Input id="aSerial" value={assetSerial} onChange={(e) => setAssetSerial(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="aCost">Purchase Cost (LKR)</Label>
              <Input id="aCost" type="number" value={assetCost} onChange={(e) => setAssetCost(Number(e.target.value))} />
            </div>
            <div>
              <Label htmlFor="aDate">Purchase Date</Label>
              <Input id="aDate" type="date" value={assetPurchaseDate} onChange={(e) => setAssetPurchaseDate(e.target.value)} />
            </div>
          </div>

          <div>
            <Label htmlFor="aNotes">Hardware Notes</Label>
            <Textarea
              id="aNotes"
              rows={2}
              value={assetNotes}
              onChange={(e) => setAssetNotes(e.target.value)}
              
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-hairline">
            <Button type="button" variant="ghost" size="sm" onClick={() => setIsCreateAssetOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary-pill" size="sm" disabled={createAssetMutation.isPending}>
              {createAssetMutation.isPending ? 'Registering...' : 'Register Asset'}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* ISSUE ASSET MODAL */}
      <Dialog
        isOpen={isIssueAssetOpen}
        onClose={() => setIsIssueAssetOpen(false)}
        title="Issue Asset to Employee Custody"
        description="Record physical handover and establish custody accountability."
        maxWidth="md"
      >
        <form onSubmit={handleIssueAsset} className="space-y-4 text-xs">
          <div>
            <Label htmlFor="iAst">Available Asset *</Label>
            <Select
              id="iAst"
              required
              value={issueAssetId}
              onChange={(e) => setIssueAssetId(e.target.value)}
              
            >
              <option value="">Select In-Stock Asset</option>
              {availableAssets.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.assetTag} — {a.name} ({a.serialNumber})
                </option>
              ))}
            </Select>
          </div>

          <div>
            <Label htmlFor="iEmp">Assignee Employee *</Label>
            <Select
              id="iEmp"
              required
              value={issueEmpId}
              onChange={(e) => setIssueEmpId(e.target.value)}
              
            >
              <option value="">Select Employee</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.displayName} ({emp.employeeNumber})
                </option>
              ))}
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="iDate">Issued Date *</Label>
              <Input id="iDate" type="date" required value={issueDate} onChange={(e) => setIssueDate(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="iRetDate">Expected Return Date</Label>
              <Input id="iRetDate" type="date" value={issueReturnDate} onChange={(e) => setIssueReturnDate(e.target.value)} />
            </div>
          </div>

          <div>
            <Label htmlFor="iCond">Handover Condition</Label>
            <Input id="iCond" value={issueCondition} onChange={(e) => setIssueCondition(e.target.value)} />
          </div>

          <div>
            <Label htmlFor="iNotes">Issue Notes</Label>
            <Textarea
              id="iNotes"
              rows={2}
              value={issueNotes}
              onChange={(e) => setIssueNotes(e.target.value)}
              
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-hairline">
            <Button type="button" variant="ghost" size="sm" onClick={() => setIsIssueAssetOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary-pill" size="sm" disabled={issueAssetMutation.isPending}>
              {issueAssetMutation.isPending ? 'Issuing...' : 'Issue Asset'}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* RETURN ASSET MODAL */}
      <Dialog
        isOpen={!!returningAssignment}
        onClose={() => setReturningAssignment(null)}
        title="Process Asset Return & Inspection"
        description="Verify returned hardware condition and restore inventory availability."
        maxWidth="md"
      >
        <form onSubmit={handleReturnAsset} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="rDate">Returned Date *</Label>
              <Input id="rDate" type="date" required value={returnDate} onChange={(e) => setReturnDate(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="rStat">New Asset Status</Label>
              <Select
                id="rStat"
                value={returnNewStatus}
                onChange={(e) => setReturnNewStatus(e.target.value)}
                
              >
                <option value="available">Available (Ready in Stock)</option>
                <option value="maintenance">Under Maintenance / Inspection</option>
                <option value="damaged">Damaged</option>
                <option value="retired">Retired / Decommissioned</option>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="rCond">Return Inspection Condition</Label>
            <Input id="rCond" value={returnCondition} onChange={(e) => setReturnCondition(e.target.value)} />
          </div>

          <div>
            <Label htmlFor="rNotes">Inspection Remarks</Label>
            <Textarea
              id="rNotes"
              rows={2}
              value={returnNotes}
              onChange={(e) => setReturnNotes(e.target.value)}
              
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-hairline">
            <Button type="button" variant="ghost" size="sm" onClick={() => setReturningAssignment(null)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary-pill" size="sm" disabled={returnAssetMutation.isPending}>
              {returnAssetMutation.isPending ? 'Processing...' : 'Confirm Return'}
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
};
