import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CompensationHubPage } from './compensation-hub-page';

describe('CompensationHubPage', () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  it('renders compensation and benefits hub with metrics and buttons', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <CompensationHubPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(screen.getByText(/Compensation & Benefits/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Assign Salary/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Propose Revision/i })).toBeInTheDocument();
    expect(screen.getByText(/Monthly Base Payroll/i)).toBeInTheDocument();
  });
});
