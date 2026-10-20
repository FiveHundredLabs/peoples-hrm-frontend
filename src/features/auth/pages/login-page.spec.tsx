import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LoginPage } from './login-page';

describe('LoginPage', () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  it('renders login form and brand branding per DESIGN.md', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <LoginPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(screen.getByText(/Sri Lanka HRMS/i)).toBeInTheDocument();
    expect(screen.getByText(/Sign In to Your Workspace/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/yourname@company.lk/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sign In to HRMS/i })).toBeInTheDocument();
  });
});
