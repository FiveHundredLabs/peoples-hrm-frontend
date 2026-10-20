import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { App } from '../src/app/App';

describe('App Smoke Test', () => {
  it('renders application shell and dashboard title', () => {
    render(<App />);

    expect(screen.getByText(/Sri Lanka HRMS Dashboard/i)).toBeInTheDocument();
    expect(screen.getByText(/HRMS Core Modules/i)).toBeInTheDocument();
    expect(screen.getByText(/Organization Management/i)).toBeInTheDocument();
    expect(screen.getByText(/Sri Lanka Payroll & Statutory/i)).toBeInTheDocument();
  });
});
