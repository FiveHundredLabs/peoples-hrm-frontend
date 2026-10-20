import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PrivacyHubPage } from './privacy-hub-page';

describe('PrivacyHubPage', () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  it('renders privacy, DSAR & data governance hub with metrics and action buttons', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <PrivacyHubPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(screen.getByText(/Privacy, DSAR & Data Governance/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Log DSAR Request$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Record Consent$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Create Retention Rule$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Place Legal Hold$/i })).toBeInTheDocument();
    expect(screen.getByText(/Statutory data lifecycles/i)).toBeInTheDocument();
    expect(screen.getByText(/Open DSAR Inquiries/i)).toBeInTheDocument();
    expect(screen.getByText(/Active Legal Holds/i)).toBeInTheDocument();
  });
});
