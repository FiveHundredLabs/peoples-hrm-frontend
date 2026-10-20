import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AttendanceHubPage } from './attendance-hub-page';

describe('AttendanceHubPage', () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  it('renders attendance hub page with header and action buttons', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AttendanceHubPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(screen.getByText(/Hikvision Time & Attendance/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Simulate Biometric Punch/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Add Terminal/i })).toBeInTheDocument();
    expect(screen.getByText(/Present Today/i)).toBeInTheDocument();
    expect(screen.getByText(/Late Arrivals/i)).toBeInTheDocument();
  });
});
