import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { OperationsHubPage } from './operations-hub-page';

describe('OperationsHubPage', () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  it('renders system operations, telemetry and hardening hub with metrics and buttons', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <OperationsHubPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(screen.getByText(/System Operations, Telemetry & Hardening/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Refresh Telemetry$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Register Webhook$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Dispatch Notification$/i })).toBeInTheDocument();
    expect(screen.getByText(/Overall System Health/i)).toBeInTheDocument();
    expect(screen.getByText(/Memory Footprint/i)).toBeInTheDocument();
  });
});
