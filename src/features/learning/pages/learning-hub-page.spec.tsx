import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LearningHubPage } from './learning-hub-page';

describe('LearningHubPage', () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  it('renders learning and corporate training hub with metrics and action buttons', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <LearningHubPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(screen.getByText(/Learning, Corporate Training & Certifications/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Add Course$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Schedule Workshop$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Assign Course$/i })).toBeInTheDocument();
    expect(screen.getAllByText(/Course Catalog/i)[0]).toBeInTheDocument();
    expect(screen.getByText(/Scheduled Workshops/i)).toBeInTheDocument();
  });
});
