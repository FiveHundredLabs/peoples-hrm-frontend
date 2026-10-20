import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PolicyHubPage } from './policy-hub-page';

describe('PolicyHubPage', () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  it('renders policies, compliance & HR helpdesk hub with metrics and action buttons', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <PolicyHubPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(screen.getByText(/Policies, Compliance & HR Helpdesk/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Publish Policy$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Acknowledge Policy$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Raise Support Ticket$/i })).toBeInTheDocument();
    expect(screen.getByText(/Active Policies/i)).toBeInTheDocument();
    expect(screen.getByText(/Signed Acknowledgements/i)).toBeInTheDocument();
  });
});
