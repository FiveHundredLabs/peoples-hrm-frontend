import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PerformanceHubPage } from './performance-hub-page';

describe('PerformanceHubPage', () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  it('renders performance management hub with metrics, tabs and action buttons', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <PerformanceHubPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(screen.getByText(/Performance Management, Goals & Appraisals/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Create Review Cycle$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Assign Goal \/ KPI$/i })).toBeInTheDocument();
    expect(screen.getByText(/Active Review Cycles/i)).toBeInTheDocument();
    expect(screen.getByText(/Assigned Goals & KPIs/i)).toBeInTheDocument();
  });
});
