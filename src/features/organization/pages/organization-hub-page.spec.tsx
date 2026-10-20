import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { OrganizationHubPage } from './organization-hub-page';

describe('OrganizationHubPage', () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  it('renders organization tabs correctly', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/organization?tab=legal-entities']}>
          <OrganizationHubPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(screen.getByText(/Organization & Governance/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Legal Entities/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Branches/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Departments & Teams/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Positions & Roles/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Statutory Holidays/i })).toBeInTheDocument();
  });
});
