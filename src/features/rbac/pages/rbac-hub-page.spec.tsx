import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RbacHubPage } from './rbac-hub-page';

describe('RbacHubPage', () => {
  const createQueryClient = () =>
    new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });

  it('renders RBAC hub navigation tabs correctly including modular feature customizer', () => {
    render(
      <QueryClientProvider client={createQueryClient()}>
        <MemoryRouter initialEntries={['/settings?tab=users']}>
          <RbacHubPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(screen.getByText(/System Settings & Security Governance/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Users & Access/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Roles & Permissions/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Active Sessions & Security/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Email & SMTP/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Storage & Media/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Feature Modules/i })).toBeInTheDocument();
  });

  it('renders Feature Modules customizer tab with Sri Lanka presets and categories', () => {
    render(
      <QueryClientProvider client={createQueryClient()}>
        <MemoryRouter initialEntries={['/settings?tab=modules']}>
          <RbacHubPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(screen.getByText(/Sri Lanka SMB Module Customizer/i)).toBeInTheDocument();
    expect(screen.getByText(/Sri Lanka SMB Essentials/i)).toBeInTheDocument();
    expect(screen.getByText(/Ultra-Minimal Core/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Full Enterprise Suite/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Core HR & Sri Lanka Statutory Baseline/i)).toBeInTheDocument();
    expect(screen.getByText(/Sri Lankan SMB High-Value Operational Modules/i)).toBeInTheDocument();
  });
});
