import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReportingHubPage } from './reporting-hub-page';

describe('ReportingHubPage', () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  it('renders reporting, statutory returns and workforce analytics hub with metrics and buttons', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ReportingHubPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(screen.getByText(/Reporting, Statutory Compliance & Analytics/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Export Schedule \(CSV\)$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Create Custom Report$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Schedule Dispatch$/i })).toBeInTheDocument();
    expect(screen.getByText(/Active Workforce Headcount/i)).toBeInTheDocument();
    expect(screen.getByText(/Monthly Gross Remuneration/i)).toBeInTheDocument();
  });
});
