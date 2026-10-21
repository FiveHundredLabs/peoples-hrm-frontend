import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LoginPage } from './login-page';
import { useAuthStore } from '../../../stores/auth-store';
import { resetMockData } from '../../../mocks/store';

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

  it('signs in with the auto-filled demo account without a backend', async () => {
    resetMockData();
    useAuthStore.getState().clearAuth();
    const user = userEvent.setup();
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(<QueryClientProvider client={client}><MemoryRouter><LoginPage /></MemoryRouter></QueryClientProvider>);
    await user.click(screen.getByRole('button', { name: /Auto-fill Admin/i }));
    await user.click(screen.getByRole('button', { name: /Sign In to HRMS/i }));
    await waitFor(() => expect(useAuthStore.getState().isAuthenticated).toBe(true));
    expect(useAuthStore.getState().roles).toContain('SUPER_ADMIN');
    useAuthStore.getState().clearAuth();
    client.clear();
  });
});
