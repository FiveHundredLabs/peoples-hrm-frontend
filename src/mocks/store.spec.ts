import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mockData, resetMockData, getMockFileUrl } from './store';
import { DEMO_EMAIL, DEMO_PASSWORD, MOCK_STORAGE_KEY } from './seed';
import operations from './operations.json';
import { z } from 'zod';
import { createSeed } from './seed';

beforeEach(() => { localStorage.clear(); resetMockData(); });

describe('browser mock data', () => {
  it('uses UUIDs accepted by the existing form schemas for seeded records', () => {
    function check(value: unknown): void {
      if (!value || typeof value !== 'object') return;
      if (Array.isArray(value)) { value.forEach(check); return; }
      for (const [key, field] of Object.entries(value)) {
        if (key === 'id' && typeof field === 'string') expect(z.string().uuid().safeParse(field).success, field).toBe(true);
        check(field);
      }
    }
    check(createSeed());
  });
  it('loads every collection and singleton without network requests', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Network must not be used'));
    const xhrSpy = vi.spyOn(XMLHttpRequest.prototype, 'open');
    try {
      for (const operation of operations.filter(op => op.method === 'get' && !op.resource.includes(':id'))) {
        const response = await mockData.read(operation.resource);
        expect(response.data.data, operation.resource).toBeDefined();
      }
      expect(fetchSpy).not.toHaveBeenCalled();
      expect(xhrSpy).not.toHaveBeenCalled();
    } finally { fetchSpy.mockRestore(); xhrSpy.mockRestore(); }
  });

  it('authenticates the demo administrator and rejects incorrect passwords', async () => {
    await expect(mockData.create('/auth/login', { email: DEMO_EMAIL, password: 'wrong' })).rejects.toThrow('Invalid demo');
    const result = await mockData.create('/auth/login', { email: DEMO_EMAIL, password: DEMO_PASSWORD });
    expect(result.data.data.roles).toContain('SUPER_ADMIN');
    expect((await mockData.read('/auth/me')).data.data.email).toBe(DEMO_EMAIL);
    await mockData.create('/auth/logout');
    expect((await mockData.read('/rbac/sessions')).data.data).toEqual([]);
  });

  it('creates, filters, paginates, updates and deletes employees and persists edits', async () => {
    const created = (await mockData.create('/employees', { firstName: 'Test', lastName: 'Employee', departmentId: '710a24dd-95e4-4d9e-8e59-37beb63a4e33' })).data.data;
    const result = await mockData.read('/employees', { params: { search: 'Test Employee', limit: 1 } });
    expect(result.data.data[0].displayName).toBe('Test Employee');
    expect(result.data.meta).toMatchObject({ total: 1, limit: 1, pageSize: 1 });
    await mockData.update(`/employees/${created.id}`, { firstName: 'Updated' });
    expect((await mockData.read(`/employees/${created.id}`)).data.data.displayName).toBe('Updated Employee');
    expect(JSON.parse(localStorage.getItem(MOCK_STORAGE_KEY)!)['/employees']).toContainEqual(expect.objectContaining({ id: created.id, firstName: 'Updated' }));
    vi.resetModules();
    const reloaded = await import('./store');
    expect((await reloaded.mockData.read(`/employees/${created.id}`)).data.data.firstName).toBe('Updated');
    await mockData.remove(`/employees/${created.id}`);
    await expect(mockData.read(`/employees/${created.id}`)).rejects.toThrow('not found');
  });

  it('issues and returns assets and keeps inventory and assignment filters consistent', async () => {
    const issued = (await mockData.create('/assets/issue', { assetId: 'aee9df6d-7eb7-4c7a-8472-0b985159561d', employeeId: '4abc0bbf-3d53-40fc-893a-7042814d5d78' })).data.data;
    expect((await mockData.read('/assets', { params: { status: 'available' } })).data.data).toHaveLength(0);
    await expect(mockData.create('/assets/issue', { assetId: 'aee9df6d-7eb7-4c7a-8472-0b985159561d', employeeId: 'd97deb14-01f4-4093-84af-dd347d687b52' })).rejects.toThrow('not available');
    await mockData.create(`/assets/assignments/${issued.id}/return`, {});
    expect((await mockData.read('/assets/assignments/list', { params: { assetId: 'aee9df6d-7eb7-4c7a-8472-0b985159561d', activeOnly: true } })).data.data).toHaveLength(0);
    expect((await mockData.read('/assets', { params: { categoryId: '80cd9118-31fe-44f7-862a-d37e18e6722c', status: 'available' } })).data.data).toHaveLength(1);
  });

  it('updates leave balances once and records an approval in the ledger', async () => {
    await mockData.create('/leave/requests/dbe064d2-0997-4932-861c-34fb75925115/approve');
    expect((await mockData.read('/leave/entitlements')).data.data[0]).toMatchObject({ consumed: 1, currentBalance: 13 });
    expect((await mockData.read('/leave/ledger')).data.data).toHaveLength(1);
    await expect(mockData.create('/leave/requests/dbe064d2-0997-4932-861c-34fb75925115/approve')).rejects.toThrow('already been processed');
  });

  it('saves local files and attaches them to the employee dossier', async () => {
    const form = new FormData();
    form.append('file', new File(['demo'], 'demo.txt', { type: 'text/plain' }));
    const uploaded = (await mockData.create('/storage/upload', form)).data.data;
    expect(getMockFileUrl(uploaded.id)).toMatch(/^data:text\/plain;base64,/);
    await mockData.create('/employees/d97deb14-01f4-4093-84af-dd347d687b52/documents', { title: 'Demo document', fileId: uploaded.id, documentType: 'other' });
    expect((await mockData.read('/employees/d97deb14-01f4-4093-84af-dd347d687b52/documents')).data.data[0].versions[0].file.originalName).toBe('demo.txt');
  });

  it('returns explicit errors for unimplemented operations and missing records', async () => {
    await expect(mockData.read('/unknown')).rejects.toThrow('Unsupported mock operation');
    await expect(mockData.update('/assets/missing/status', { status: 'available' })).rejects.toThrow('not found');
  });

  it('rolls back mutations when browser persistence fails', async () => {
    const storageSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('Quota exceeded'); });
    try {
      await expect(mockData.create('/employees', { firstName: 'Unsaved' })).rejects.toThrow('Could not save');
      expect((await mockData.read('/employees', { params: { search: 'Unsaved' } })).data.meta.total).toBe(0);
    } finally { storageSpy.mockRestore(); }
  });
});
