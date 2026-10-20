import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AssetHubPage } from './asset-hub-page';

describe('AssetHubPage', () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  it('renders asset management and hardware custody hub with metrics and action buttons', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AssetHubPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(screen.getByText(/Asset Management, Hardware & Custody/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Register Asset$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Issue Asset to Staff$/i })).toBeInTheDocument();
    expect(screen.getByText(/Total Asset Fleet/i)).toBeInTheDocument();
    expect(screen.getByText(/Assigned in Custody/i)).toBeInTheDocument();
    expect(screen.getByText(/Available in Stock/i)).toBeInTheDocument();
  });
});
