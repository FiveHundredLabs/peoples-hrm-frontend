import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { EmployeeListPage } from './employee-list-page';

describe('EmployeeListPage', () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  it('renders employee directory header and metrics', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <EmployeeListPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(screen.getByText(/Employee Directory/i)).toBeInTheDocument();
    expect(screen.getByText(/Total Workforce/i)).toBeInTheDocument();
    expect(screen.getByText(/Confirmed Staff/i)).toBeInTheDocument();
    expect(screen.getByText(/On Probation/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Onboard Employee/i })).toBeInTheDocument();
  });
});
