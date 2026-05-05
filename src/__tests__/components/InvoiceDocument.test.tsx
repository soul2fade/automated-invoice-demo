import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { InvoiceDocument } from '../../components/InvoiceDocument';
import { cannedInvoices } from '../../data/canned-invoices';

describe('InvoiceDocument', () => {
  it('renders contractor name from invoice', () => {
    render(<InvoiceDocument invoice={cannedInvoices.hvac} />);
    expect(screen.getAllByText(/Your HVAC Company/i).length).toBeGreaterThanOrEqual(1);
  });

  it('renders all line items', () => {
    render(<InvoiceDocument invoice={cannedInvoices.hvac} />);
    for (const item of cannedInvoices.hvac.lineItems) {
      expect(screen.getByText(item.description)).toBeInTheDocument();
    }
  });

  it('renders subtotal, tax, and total labels', () => {
    render(<InvoiceDocument invoice={cannedInvoices.hvac} />);
    expect(screen.getByText(/Subtotal/i)).toBeInTheDocument();
    expect(screen.getByText(/Tax/i)).toBeInTheDocument();
    expect(screen.getAllByText(/^Total$/).length).toBeGreaterThanOrEqual(1);
  });

  it('renders status badge', () => {
    render(<InvoiceDocument invoice={cannedInvoices.hvac} />);
    expect(screen.getByText(/UNPAID/i)).toBeInTheDocument();
  });

  it('renders the Bill To label (not Prepared for)', () => {
    render(<InvoiceDocument invoice={cannedInvoices.hvac} />);
    expect(screen.getByText(/Bill to/i)).toBeInTheDocument();
    expect(screen.queryByText(/Prepared for/i)).not.toBeInTheDocument();
  });

  it('renders payment instructions block', () => {
    render(<InvoiceDocument invoice={cannedInvoices.hvac} />);
    expect(screen.getByText(/Pay by check/i)).toBeInTheDocument();
    expect(screen.getByText(/Pay by ACH/i)).toBeInTheDocument();
  });

  it('renders "Thank you" instead of signature block when status is paid', () => {
    render(<InvoiceDocument invoice={cannedInvoices.electrical} />);
    expect(screen.getByText(/Thank you for your business/i)).toBeInTheDocument();
    expect(screen.queryByText(/Customer payment \/ signature/i)).not.toBeInTheDocument();
  });

  it('renders past-due banner when status is overdue', () => {
    render(<InvoiceDocument invoice={cannedInvoices.roofing} />);
    expect(screen.getByText(/days past due/i)).toBeInTheDocument();
  });

  it('renders Amount Paid + Balance Due rows when status is paid', () => {
    render(<InvoiceDocument invoice={cannedInvoices.electrical} />);
    expect(screen.getByText(/Amount Paid/i)).toBeInTheDocument();
    expect(screen.getByText(/Balance Due/i)).toBeInTheDocument();
  });

  it('renders source quote reference when sourceQuoteNumber is present', () => {
    const withSource = { ...cannedInvoices.hvac, sourceQuoteNumber: 'Q-2026-0099' };
    render(<InvoiceDocument invoice={withSource} />);
    expect(screen.getByText(/Per quote Q-2026-0099/i)).toBeInTheDocument();
  });

  it('does not render source quote reference when sourceQuoteNumber is absent', () => {
    render(<InvoiceDocument invoice={cannedInvoices.hvac} />);
    expect(screen.queryByText(/Per quote/i)).not.toBeInTheDocument();
  });
});
