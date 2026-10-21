import { defaults } from './defaults';
import operations from './operations.json';
import { createSeed, DEMO_EMAIL, DEMO_PASSWORD, MOCK_STORAGE_KEY } from './seed';
import type { MockDatabase, MockRecord } from './types';

type Options = { params?: object };
const clone = <T,>(value: T): T => structuredClone(value);
const now = () => new Date().toISOString();
const aliases: Record<string, string> = {
  '/assets/assignments/list': '/assets/assignments', '/assets/issue': '/assets/assignments',
  '/loans/advances/all': '/loans/advances', '/leave/entitlements/allocate': '/leave/entitlements',
  '/policies/acknowledgements/list': '/policies/acknowledgements', '/policies/acknowledge': '/policies/acknowledgements',
};
const canonical = (key: string) => aliases[key] || key;
function freshDatabase() {
  return Object.fromEntries(Object.entries(createSeed()).map(([key, value]) => [canonical(key), value]));
}
let memory: MockDatabase | undefined;
function database(): MockDatabase {
  if (memory) return memory;
  try {
    const stored = localStorage.getItem(MOCK_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed && typeof parsed === 'object' && Array.isArray(parsed['/employees'])) {
        memory = { ...freshDatabase(), ...parsed };
        return memory!;
      }
    }
  } catch { /* Private browsing or malformed saved data: use the demo seed. */ }
  memory = freshDatabase();
  return memory;
}
function persist() {
  try { localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(database())); }
  catch { throw new Error('Could not save demo changes. Browser storage may be full or disabled.'); }
}
export function resetMockData() {
  memory = freshDatabase();
  persist();
}
function rows(key: string): MockRecord[] {
  const db = database();
  key = canonical(key);
  if (!(key in db)) db[key] = [];
  if (!Array.isArray(db[key])) throw new Error(`Not a mock collection: ${key}`);
  return db[key] as MockRecord[];
}
function find(key: string, id: string): MockRecord {
  const record = rows(key).find(row => row.id === id);
  if (!record) throw new Error(`Demo record not found: ${key}/${id}`);
  return record;
}
function template(key: string) {
  const exact = defaults[key];
  if (exact) return clone(exact);
  const match = Object.keys(defaults).find(pattern => matches(pattern, key));
  return clone(match ? defaults[match] : {});
}
function matches(pattern: string, key: string) {
  const expected = pattern.split('/');
  const actual = key.split('/');
  return expected.length === actual.length && expected.every((part, index) => part === ':id' || part === actual[index]);
}
function validate(key: string, method: 'read' | 'create' | 'update' | 'remove') {
  const methods = { read: ['get'], create: ['post'], update: ['put', 'patch'], remove: ['delete'] };
  if (!operations.some(op => methods[method].includes(op.method) && matches(op.resource, key))) {
    throw new Error(`Unsupported mock operation: ${method} ${key}`);
  }
}
function insert(key: string, payload: MockRecord, shape = key): MockRecord {
  const record = { ...template(shape), ...clone(payload), id: crypto.randomUUID(), createdAt: now(), updatedAt: now() };
  rows(key).push(record);
  return record;
}
const relations: Record<string, [string, string]> = {
  employeeId: ['employee', '/employees'], legalEntityId: ['legalEntity', '/organization/legal-entities'],
  departmentId: ['department', '/organization/departments'], branchId: ['branch', '/organization/branches'],
  jobId: ['job', '/organization/jobs'], positionId: ['position', '/organization/positions'],
  assetCategoryId: ['category', '/assets/categories'], assetId: ['asset', '/assets'],
  leaveTypeId: ['leaveType', '/leave/types'], loanTypeId: ['loanType', '/loans/types'],
  courseId: ['course', '/learning/courses'], candidateId: ['candidate', '/recruitment/candidates'],
  requisitionId: ['requisition', '/recruitment/requisitions'], applicationId: ['application', '/recruitment/applications'],
  compensationPlanId: ['compensationPlan', '/compensation/plans'], benefitPlanId: ['benefitPlan', '/compensation/benefits'],
  roleId: ['role', '/rbac/roles'], userId: ['user', '/rbac/users'], policyDocumentId: ['policyDocument', '/policies'],
  policyVersionId: ['policyVersion', '/policies/versions'], performanceCycleId: ['performanceCycle', '/performance/cycles'],
};
function hydrate(record: MockRecord, depth = 0): MockRecord {
  const result = clone(record);
  if (depth > 1) return result;
  for (const [field, [name, collection]] of Object.entries(relations)) {
    if (record[field]) {
      const related = rows(collection).find(row => row.id === record[field]);
      if (related) result[name] = hydrate(related, depth + 1);
    }
  }
  for (const field of ['assignments', 'employmentRecords']) {
    if (Array.isArray(record[field])) result[field] = record[field].map((row: MockRecord) => hydrate(row, depth + 1));
  }
  if (rows('/rbac/users').some(user => user.id === record.id)) result.roleAssignments = rows('/rbac/user-role-assignments').filter(row => row.userId === record.id).map(row => hydrate(row, depth + 1));
  if (rows('/policies').some(policy => policy.id === record.id)) result.versions = rows('/policies/versions').filter(row => row.policyDocumentId === record.id);
  return result;
}
function envelope<T>(data: unknown, meta: MockRecord = {}): { data: T } {
  // The existing hooks consume data/meta envelopes; there is no HTTP transport here.
  return { data: clone({ data, meta: { ...meta, timestamp: now() } }) as T };
}
function select(key: string, options?: Options) {
  const source = database()[canonical(key)];
  if (source && !Array.isArray(source)) return envelope(hydrate(source));
  if (!source) {
    const employee = key.match(/^\/employees\/([^/]+)\/(documents|bank-accounts|assignments)$/);
    if (employee) return envelope(find('/employees', employee[1])[camel(employee[2])] || []);
    const index = key.lastIndexOf('/');
    return envelope(hydrate(find(key.slice(0, index), key.slice(index + 1))));
  }
  const params = (options?.params || {}) as MockRecord;
  const ignored = ['page', 'pageSize', 'limit', 'search', 'sort', 'sortBy', 'order', 'sortOrder'];
  let filtered = source.filter(row => Object.entries(params).every(([key, value]) => {
    if (ignored.includes(key) || value === undefined || value === null || value === '') return true;
    if (key === 'activeOnly') return !value || !row.returnedOn;
    const date = row.attendanceDate || row.createdAt || '';
    if (key === 'startDate') return date.slice(0, 10) >= value;
    if (key === 'endDate') return date.slice(0, 10) <= value;
    if (key === 'date') return date.slice(0, 10) === value;
    const field = ({ categoryId: 'assetCategoryId', cycleId: 'performanceCycleId', status: row.lifecycleStatus ? 'lifecycleStatus' : 'status' } as MockRecord)[key] || key;
    return String(row[field]) === String(value) || (key === 'departmentId' && row.assignments?.some((a: MockRecord) => a.departmentId === value)) || (key === 'legalEntityId' && row.employmentRecords?.some((e: MockRecord) => e.legalEntityId === value));
  }));
  if (params.search) filtered = filtered.filter(row => JSON.stringify(row).toLowerCase().includes(String(params.search).toLowerCase()));
  const sort = params.sortBy || params.sort;
  if (sort) filtered.sort((a, b) => String(a[sort] ?? '').localeCompare(String(b[sort] ?? ''), undefined, { numeric: true }) * (String(params.sortOrder || params.order).toLowerCase() === 'desc' ? -1 : 1));
  const page = Math.max(1, Number(params.page) || 1);
  const limit = Math.max(1, Number(params.limit || params.pageSize) || filtered.length || 20);
  const total = filtered.length;
  const totalPages = Math.ceil(total / limit);
  return envelope(filtered.slice((page - 1) * limit, page * limit).map(row => hydrate(row)), { page, limit, pageSize: limit, total, totalPages, hasNextPage: page < totalPages, hasPreviousPage: page > 1 });
}
const camel = (value: string) => value.replace(/-([a-z])/g, (_, char: string) => char.toUpperCase());
const clean = (payload: MockRecord) => Object.fromEntries(Object.entries(payload).filter(([, value]) => value !== undefined));

async function change(key: string, payload: MockRecord = {}, method: 'create' | 'update' | 'remove' = 'create'): Promise<unknown> {
  validate(key, method);
  payload = clean(payload);
  if (key === '/auth/login') {
    if (String(payload.email).toLowerCase() !== DEMO_EMAIL || payload.password !== DEMO_PASSWORD) throw new Error('Invalid demo email or password. Use Auto-fill Admin to try the demo.');
    const user = rows('/rbac/users')[0];
    const session = insert('/rbac/sessions', { userId: user.id, expiresAt: new Date(Date.now() + 86400000).toISOString(), lastSeenAt: now(), userAgent: 'Local demo' });
    database()['/auth/me'] = clone(user);
    return { user, accessToken: `mock-${session.id}`, refreshToken: 'mock-local-session', expiresIn: 86400, roles: ['SUPER_ADMIN'], permissions: [], scopes: [{ roleCode: 'SUPER_ADMIN', scopeType: 'organization' }] };
  }
  if (key === '/auth/logout') { database()['/rbac/sessions'] = []; database()['/auth/me'] = {}; return null; }
  if (key === '/auth/seed-admin') return { message: 'Demo admin is ready. Use Auto-fill Admin to sign in.' };
  if (key === '/auth/sync-permissions') return { message: 'Demo permissions are ready.', created: [], alreadyExisted: rows('/rbac/permissions').map(row => row.code) };
  if (key.endsWith('/test')) return { success: true, message: 'Simulated test only. No external service was contacted or email sent.', provider: 'browser mock', testEmailSent: false, responseTimeMs: 0 };
  if (key === '/storage/upload') throw new Error('Use the local file upload helper.');
  if (key.startsWith('/settings/')) {
    const safe = { ...payload };
    for (const secret of ['password', 'secretAccessKey', 'firebasePrivateKey']) delete safe[secret];
    return Object.assign(database()[key], safe, { updatedAt: now() });
  }
  if (key === '/operations/settings') {
    const existing = rows(key).find(row => row.key === payload.key);
    return existing ? Object.assign(existing, payload, { updatedAt: now() }) : insert(key, payload);
  }
  const employeePath = key.match(/^\/employees\/([^/]+)(?:\/([^/]+))?(?:\/([^/]+))?$/);
  if (employeePath) {
    const [, id, child, childId] = employeePath;
    const employee = find('/employees', id);
    if (child === 'status') return Object.assign(employee, { lifecycleStatus: payload.newStatus || payload.status, updatedAt: now() });
    if (child === 'photo') return Object.assign(employee, { profileFileId: payload.fileId, profileFile: find('/storage/files', payload.fileId), updatedAt: now() });
    if (child) {
      const collection: MockRecord[] = employee[camel(child)] ||= [];
      if (childId) {
        const index = collection.findIndex(row => row.id === childId);
        if (index < 0) throw new Error('Demo employee record not found.');
        if (method === 'remove') return collection.splice(index, 1)[0];
        return Object.assign(collection[index], payload);
      }
      const record = { ...template(key), ...payload, id: crypto.randomUUID(), employeeId: id, createdAt: now() };
      if (child === 'documents') Object.assign(record, { currentVersion: 1, versions: [{ id: crypto.randomUUID(), employeeDocumentId: record.id, versionNo: 1, fileId: payload.fileId, file: find('/storage/files', payload.fileId), createdAt: now() }] });
      if (child === 'bank-accounts') Object.assign(record, { accountNumberLast4: String(payload.accountNumber || '').slice(-4) });
      collection.push(record);
      return record;
    }
  }
  if (key === '/assets/issue') {
    const asset = find('/assets', payload.assetId);
    find('/employees', payload.employeeId);
    if (asset.status !== 'available') throw new Error('This asset is not available for issue.');
    asset.status = 'assigned';
    return insert('/assets/assignments', { ...payload, issuedOn: payload.issuedOn || now().slice(0, 10) }, key);
  }
  if (key === '/leave/entitlements/allocate') {
    const existing = rows('/leave/entitlements').find(row => row.employeeId === payload.employeeId && row.leaveTypeId === payload.leaveTypeId && row.leaveYear === payload.leaveYear);
    const entitlement = existing || insert('/leave/entitlements', payload);
    Object.assign(entitlement, payload);
    entitlement.currentBalance = Number(entitlement.openingBalance) + Number(entitlement.allocated) - Number(entitlement.consumed) - Number(entitlement.reserved);
    return entitlement;
  }
  if (key === '/attendance/events/ingest') {
    const employee = rows('/employees').find(row => row.employeeNumber === payload.employeeNo);
    if (!employee) throw new Error('Employee number was not found.');
    const date = (payload.eventTime || now()).slice(0, 10);
    const day = rows('/attendance/daily-logs').find(row => row.employeeId === employee.id && row.attendanceDate === date) || insert('/attendance/daily-logs', { employeeId: employee.id, attendanceDate: date, locked: false });
    day[payload.direction === 'out' ? 'lastOutAt' : 'firstInAt'] = payload.eventTime || now();
    return { rawEvent: payload, punch: { ...payload, id: crypto.randomUUID() }, attendanceDay: day };
  }
  if (key === '/settlements/calculate-gratuity') return { ...template(key), employeeId: payload.employeeId, completedYears: 0, gratuityAmount: 0, calculatedAt: now(), details: { ...template(key).details, remarks: 'Demo placeholder; statutory calculations are not performed.', formula: 'Not calculated in mock mode' } };
  const task = key.match(/^(.*)\/tasks\/([^/]+)$/);
  if (task) {
    const cases = task[1] === '/offboarding' ? '/offboarding/cases' : '/recruitment/onboarding/cases';
    const item = rows(cases).flatMap(row => row.tasks || []).find(row => row.id === task[2]);
    if (!item) throw new Error('Demo task not found.');
    return Object.assign(item, payload, { completedAt: payload.status === 'completed' ? now() : null });
  }
  if (key === '/performance/reviews/submit-rater') {
    const review = find('/performance/reviews', payload.performanceReviewId);
    const rater = { ...template(key), ...payload, id: crypto.randomUUID(), status: 'submitted' };
    (review.raters ||= []).push(rater);
    return rater;
  }
  if (key.endsWith('/messages')) {
    const collection = key.startsWith('/policies') ? '/policies/helpdesk/tickets' : '/helpdesk/tickets';
    const ticket = find(collection, payload.ticketId);
    const message = { ...payload, id: crypto.randomUUID(), createdAt: now(), authorUserId: 'f39a3852-e7a1-4085-80b9-826474358be0' };
    (ticket.messages ||= []).push(message);
    return message;
  }
  const action = key.match(/^(.*)\/([^/]+)\/(approve|reject|approve-hr|approve-finance|calculate|finalize|reimburse|complete|release|return|status|stage|toggle|submit|calibrate|accept|progress|permissions|scorecards)$/);
  if (action) {
    const [, collection, id, verb] = action;
    const record = find(collection, id);
    if (verb === 'permissions') {
      record.rolePermissions = (payload.permissionIds || []).map((permissionId: string) => ({ id: crypto.randomUUID(), roleId: id, permissionId, effect: 'allow', permission: find('/rbac/permissions', permissionId) }));
      return record;
    }
    if (verb === 'progress' || verb === 'scorecards') {
      const entry = { ...template(key), ...payload, id: crypto.randomUUID(), createdAt: now() };
      (record[verb === 'progress' ? 'progressUpdates' : 'scorecards'] ||= []).push(entry);
      return entry;
    }
    if (collection === '/leave/requests' && ['approve', 'reject'].includes(verb)) {
      if (!['pending', 'draft', 'submitted'].includes(record.status)) throw new Error('This leave request has already been processed.');
      if (verb === 'approve') {
        const entitlement = rows('/leave/entitlements').find(row => row.employeeId === record.employeeId && row.leaveTypeId === record.leaveTypeId && row.leaveYear === Number(record.startsAt.slice(0, 4)));
        if (!entitlement || entitlement.currentBalance < record.requestedQuantity) throw new Error('Insufficient demo leave balance.');
        entitlement.consumed += Number(record.requestedQuantity);
        entitlement.currentBalance -= Number(record.requestedQuantity);
        insert('/leave/ledger', { employeeId: record.employeeId, leaveTypeId: record.leaveTypeId, entryType: 'consumed', quantity: -record.requestedQuantity, balanceAfter: entitlement.currentBalance, effectiveDate: now().slice(0, 10) });
      }
    }
    if (verb === 'return') {
      if (record.returnedOn) throw new Error('This asset has already been returned.');
      find('/assets', record.assetId).status = payload.newAssetStatus || 'available';
      return Object.assign(record, payload, { returnedOn: payload.returnedOn || now().slice(0, 10) });
    }
    const statuses: Record<string, string> = { approve: 'approved', reject: 'rejected', 'approve-hr': 'hr_reviewed', 'approve-finance': 'finance_approved', calculate: 'calculated', finalize: collection === '/settlements' ? 'approved' : 'finalized', reimburse: 'reimbursed', complete: 'completed', submit: 'submitted', calibrate: 'calibrated', accept: 'accepted' };
    Object.assign(record, payload, { updatedAt: now() });
    if (statuses[verb]) record.status = payload.status || statuses[verb];
    if (verb === 'stage') { record.status = payload.toStatus; record.currentStage = payload.stageName || payload.toStatus; }
    if (verb === 'release') record.releasedAt = now();
    if (verb === 'complete') record.completionDate = payload.completionDate || now().slice(0, 10);
    if (verb === 'finalize') record.finalizedAt = now();
    if (verb === 'accept') {
      insert('/recruitment/onboarding/cases', { employeeId: record.employeeId || 'd97deb14-01f4-4093-84af-dd347d687b52', status: 'initiated', startDate: payload.confirmedJoinDate || now().slice(0, 10), tasks: [] });
      return { offer: record };
    }
    return record;
  }
  const target = canonical(key);
  if (method === 'create') {
    if (target === '/employees') {
      payload.displayName ||= [payload.firstName, payload.lastName].filter(Boolean).join(' ');
      payload.employeeNumber ||= `EMP-${String(rows(target).length + 1).padStart(3, '0')}`;
      payload.lifecycleStatus ||= 'active';
      const employmentId = crypto.randomUUID();
      payload.employmentRecords = payload.legalEntityId ? [{ id: employmentId, legalEntityId: payload.legalEntityId, employmentType: payload.employmentType || 'permanent', status: payload.lifecycleStatus, hireDate: payload.hireDate }] : [];
      payload.assignments = payload.departmentId || payload.branchId || payload.positionId ? [{ id: crypto.randomUUID(), employmentRecordId: employmentId, assignmentType: 'primary', departmentId: payload.departmentId, branchId: payload.branchId, positionId: payload.positionId, title: payload.jobTitle, fte: 1, effectiveFrom: payload.hireDate }] : [];
      payload.personalDetails = { id: crypto.randomUUID(), dateOfBirth: payload.dateOfBirth, gender: payload.gender, nationality: payload.nationality, maritalStatus: payload.maritalStatus };
    }
    if (target === '/assets') payload.status ||= 'available';
    if (target === '/payroll/runs') { payload.status = 'draft'; payload.runNumber ||= `DEMO-${rows(target).length + 1}`; }
    if (['/leave/requests', '/loans', '/loans/advances', '/expenses/claims', '/compensation/change-requests'].includes(target)) payload.status ||= 'pending';
    if (target === '/expenses/claims') payload.totalAmount = (payload.items || []).reduce((sum: number, item: MockRecord) => sum + Number(item.amount), 0);
    if (target === '/policies/versions') find('/policies', payload.policyDocumentId).currentVersion = payload.versionNo;
    if (target === '/lifecycle/skills') return insert('/lifecycle/employee-skills', payload, key);
    return insert(target, payload, key);
  }
  const index = target.lastIndexOf('/');
  const collection = target.slice(0, index);
  const record = find(collection, target.slice(index + 1));
  if (method === 'remove') { rows(collection).splice(rows(collection).indexOf(record), 1); return null; }
  Object.assign(record, payload, { updatedAt: now() });
  if (collection === '/employees' && (payload.firstName || payload.lastName)) record.displayName = [record.firstName, record.lastName].filter(Boolean).join(' ');
  return record;
}

async function mutate<T>(key: string, payload: MockRecord | FormData = {}, method: 'create' | 'update' | 'remove' = 'create'): Promise<{ data: T }> {
  const snapshot = clone(database());
  try {
    let result: unknown;
    if (key === '/storage/upload' && payload instanceof FormData) {
      const file = payload.get('file');
      if (!(file instanceof File)) throw new Error('Choose a file to upload.');
      if (file.size > 2 * 1024 * 1024) throw new Error('Demo uploads are limited to 2 MB per file.');
      const url = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(new Error('Could not read the selected file.'));
        reader.readAsDataURL(file);
      });
      result = insert('/storage/files', { originalName: file.name, mimeType: file.type, sizeBytes: file.size, storageProvider: 'browser', viewUrl: url, downloadUrl: url });
    } else result = await change(key, payload as MockRecord, method);
    persist();
    return envelope<T>(result && typeof result === 'object' ? hydrate(result as MockRecord) : result);
  } catch (error) { memory = snapshot; throw error; }
}

// Serialize mutations so concurrent forms cannot overwrite each other's saved changes.
let pending: Promise<unknown> = Promise.resolve();
function enqueue<T>(key: string, payload: MockRecord | FormData, method: 'create' | 'update' | 'remove') {
  const operation = pending.then(() => mutate<T>(key, payload, method));
  pending = operation.catch(() => undefined);
  return operation;
}
export const mockData = {
  async read<T = any>(key: string, options?: Options): Promise<{ data: T }> {
    validate(key, 'read');
    await pending;
    return select(key, options) as { data: T };
  },
  create<T = any>(key: string, payload: MockRecord | FormData = {}) { return enqueue<T>(key, payload, 'create'); },
  update<T = any>(key: string, payload: MockRecord = {}) { return enqueue<T>(key, payload, 'update'); },
  remove<T = any>(key: string) { return enqueue<T>(key, {}, 'remove'); },
};

export function getMockFileUrl(fileId?: string | null): string | undefined {
  return rows('/storage/files').find(file => file.id === fileId)?.viewUrl;
}
