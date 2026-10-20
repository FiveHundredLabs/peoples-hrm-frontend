import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HrRelationsHubPage } from './hr-relations-hub-page';

describe('HrRelationsHubPage', () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  it('renders employee relations, grievances and safety hub with metrics and action buttons', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <HrRelationsHubPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(screen.getByText(/Employee Relations, Grievances & Safety/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Open HR Case$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Record Disciplinary$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Report Safety Incident$/i })).toBeInTheDocument();
    expect(screen.getByText(/Total HR Cases/i)).toBeInTheDocument();
    expect(screen.getByText(/Inquiries In Progress/i)).toBeInTheDocument();
  });
});
