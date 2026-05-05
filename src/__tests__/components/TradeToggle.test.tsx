import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TradeToggle } from '../../components/TradeToggle';

describe('TradeToggle', () => {
  it('renders all 4 trade buttons', () => {
    render(<TradeToggle selected="hvac" onChange={() => {}} />);
    expect(screen.getByRole('button', { name: /HVAC/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Plumbing/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Electrical/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Roofing/i })).toBeInTheDocument();
  });

  it('marks the selected trade as pressed', () => {
    render(<TradeToggle selected="plumbing" onChange={() => {}} />);
    expect(screen.getByRole('button', { name: /Plumbing/i })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: /HVAC/i })).toHaveAttribute('aria-pressed', 'false');
  });

  it('calls onChange when a different trade is clicked', () => {
    const onChange = vi.fn();
    render(<TradeToggle selected="hvac" onChange={onChange} />);
    fireEvent.click(screen.getByRole('button', { name: /Electrical/i }));
    expect(onChange).toHaveBeenCalledWith('electrical');
  });
});
