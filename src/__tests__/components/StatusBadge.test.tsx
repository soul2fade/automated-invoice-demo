import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatusBadge } from '../../components/StatusBadge';

describe('StatusBadge', () => {
  it('renders UNPAID label', () => {
    render(<StatusBadge status="unpaid" dueDate="2026-06-04" />);
    expect(screen.getByText(/UNPAID/i)).toBeInTheDocument();
  });

  it('renders PAID label with a checkmark for paid status', () => {
    render(<StatusBadge status="paid" dueDate="2026-06-04" />);
    expect(screen.getByText(/PAID/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/paid/i)).toBeInTheDocument();
  });

  it('renders OVERDUE label', () => {
    render(<StatusBadge status="overdue" dueDate="2026-04-01" />);
    expect(screen.getByText(/OVERDUE/i)).toBeInTheDocument();
  });

  it('applies green color classes for paid', () => {
    const { container } = render(<StatusBadge status="paid" dueDate="2026-06-04" />);
    const pill = container.querySelector('[data-status="paid"]');
    expect(pill?.className).toMatch(/emerald/);
  });

  it('applies red color classes for overdue', () => {
    const { container } = render(<StatusBadge status="overdue" dueDate="2026-04-01" />);
    const pill = container.querySelector('[data-status="overdue"]');
    expect(pill?.className).toMatch(/rose/);
  });

  it('applies neutral color classes for unpaid', () => {
    const { container } = render(<StatusBadge status="unpaid" dueDate="2026-06-04" />);
    const pill = container.querySelector('[data-status="unpaid"]');
    expect(pill?.className).toMatch(/slate/);
  });
});
