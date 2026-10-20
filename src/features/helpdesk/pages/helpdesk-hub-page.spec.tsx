import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelpdeskHubPage } from './helpdesk-hub-page';

describe('HelpdeskHubPage', () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  it('renders employee helpdesk & support center hub with metrics and action buttons', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <HelpdeskHubPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(screen.getByText(/Employee Helpdesk & Support Center/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Raise Support Ticket$/i })).toBeInTheDocument();
    expect(screen.getByText(/Total Support Inquiries/i)).toBeInTheDocument();
    expect(screen.getByText(/In-Progress Queue/i)).toBeInTheDocument();
    expect(screen.getByText(/Resolved Inquiries/i)).toBeInTheDocument();
  });
});
