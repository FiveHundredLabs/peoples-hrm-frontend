import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { FinalSettlementHubPage } from './final-settlement-hub-page';

describe('FinalSettlementHubPage', () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  it('renders final settlement and gratuity hub with metrics and buttons', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <FinalSettlementHubPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(screen.getByText(/Final Settlement, Gratuity & Exit Clearance/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Compute Final Settlement$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Gratuity Estimator$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Exit Clearance Case$/i })).toBeInTheDocument();
    expect(screen.getByText(/Net Settlements Payable/i)).toBeInTheDocument();
    expect(screen.getByText(/Statutory Gratuity Total/i)).toBeInTheDocument();
  });
});
