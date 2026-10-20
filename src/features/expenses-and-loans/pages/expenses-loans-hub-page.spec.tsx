import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ExpensesLoansHubPage } from './expenses-loans-hub-page';

describe('ExpensesLoansHubPage', () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  it('renders expenses, advances and staff loans hub with metrics and buttons', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ExpensesLoansHubPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(screen.getByText(/Expenses, Salary Advances & Staff Loans/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Request Loan$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Salary Advance$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Submit Expense$/i })).toBeInTheDocument();
    expect(screen.getByText(/Total Outstanding Loans/i)).toBeInTheDocument();
  });
});
