import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LifecycleHubPage } from './lifecycle-hub-page';

describe('LifecycleHubPage', () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  it('renders career & lifecycle header and tab navigation', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <LifecycleHubPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(screen.getByText(/Career & Lifecycle Governance/i)).toBeInTheDocument();
    expect(screen.getByText(/Pending Probations/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Career Movements/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Active Contracts/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Initiate Movement/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /New Contract/i })).toBeInTheDocument();
  });
});
