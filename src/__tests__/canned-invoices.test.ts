import { describe, it, expect } from 'vitest';
import { cannedInvoices } from '../data/canned-invoices';
import { TRADES } from '../types';

describe('cannedInvoices', () => {
  it('has an invoice for every trade', () => {
    for (const { id } of TRADES) {
      expect(cannedInvoices[id]).toBeDefined();
    }
  });

  it('trade field on each invoice matches its record key', () => {
    for (const { id } of TRADES) {
      expect(cannedInvoices[id].trade).toBe(id);
    }
  });

  it('subtotals match the sum of line items', () => {
    for (const { id } of TRADES) {
      const inv = cannedInvoices[id];
      const computed = inv.lineItems.reduce((s, li) => s + li.total, 0);
      expect(Math.abs(computed - inv.subtotal)).toBeLessThan(1);
    }
  });

  it('tax applies to materials only at 7.75%', () => {
    for (const { id } of TRADES) {
      const inv = cannedInvoices[id];
      const materials = inv.lineItems.filter((li) => li.category === 'materials').reduce((s, li) => s + li.total, 0);
      const expectedTax = Math.round(materials * 0.0775);
      expect(Math.abs(inv.tax - expectedTax)).toBeLessThan(2);
    }
  });

  it('totals = subtotal + tax', () => {
    for (const { id } of TRADES) {
      const inv = cannedInvoices[id];
      expect(Math.abs(inv.subtotal + inv.tax - inv.total)).toBeLessThan(1);
    }
  });

  it('status mix matches spec: HVAC unpaid, plumbing unpaid, electrical paid, roofing overdue', () => {
    expect(cannedInvoices.hvac.status).toBe('unpaid');
    expect(cannedInvoices.plumbing.status).toBe('unpaid');
    expect(cannedInvoices.electrical.status).toBe('paid');
    expect(cannedInvoices.roofing.status).toBe('overdue');
  });

  it('paid and overdue summaries include the demo disclaimer', () => {
    expect(cannedInvoices.electrical.summary).toMatch(/Sample invoice/i);
    expect(cannedInvoices.roofing.summary).toMatch(/Sample invoice/i);
  });

  it('invoice numbers all start with INV-', () => {
    for (const { id } of TRADES) {
      expect(cannedInvoices[id].invoiceNumber).toMatch(/^INV-/);
    }
  });

  it('every invoice has placeholder ACH bank details', () => {
    for (const { id } of TRADES) {
      expect(cannedInvoices[id].paymentInstructions.ach.routing).toBe('SAMPLE');
      expect(cannedInvoices[id].paymentInstructions.ach.account).toBe('SAMPLE');
    }
  });
});
