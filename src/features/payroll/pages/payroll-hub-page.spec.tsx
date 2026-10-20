import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PayrollHubPage } from './payroll-hub-page';

describe('PayrollHubPage', () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  it('renders Sri Lanka statutory payroll hub with metrics and buttons', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <PayrollHubPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(screen.getByText(/Sri Lanka Statutory Payroll & Runs/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /New Monthly Run/i })).toBeInTheDocument();
    expect(screen.getByText(/Monthly Net Payout/i)).toBeInTheDocument();
    expect(screen.getByText(/Total Employer Cost/i)).toBeInTheDocument();
  });
});
