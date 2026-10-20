import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LeaveHubPage } from './leave-hub-page';

describe('LeaveHubPage', () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  it('renders leave management hub with metrics and action buttons', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <LeaveHubPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(screen.getByText(/Leave Management & Balances/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Apply for Leave/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Allocate Quota/i })).toBeInTheDocument();
    expect(screen.getByText(/Pending Requests/i)).toBeInTheDocument();
  });
});
