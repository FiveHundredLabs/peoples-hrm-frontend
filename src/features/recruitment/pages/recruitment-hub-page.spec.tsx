import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RecruitmentHubPage } from './recruitment-hub-page';

describe('RecruitmentHubPage', () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  it('renders recruitment, talent pipeline and onboarding hub with metrics and action buttons', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <RecruitmentHubPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(screen.getByText(/Recruitment, Talent Pipeline & Onboarding/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Create Requisition$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Add Candidate$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Schedule Interview$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Extend Job Offer$/i })).toBeInTheDocument();
    expect(screen.getByText(/Open Requisitions/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Candidate Pipeline/i)[0]).toBeInTheDocument();
  });
});
