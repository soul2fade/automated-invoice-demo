import { describe, it, expect } from 'vitest';
import { quoteToInvoice } from '../lib/quoteToInvoice';
import type { Quote } from '../types';

const sourceQuote: Quote = {
  trade: 'hvac',
  quoteNumber: 'Q-SAMPLE-HVAC',
  dateIssued: '2026-05-04',
  validUntil: '2026-06-03',
  contractor: {
    name: 'Your HVAC Company',
    license: 'CSLB Lic. #SAMPLE',
    address: '1234 Sample St, Sacramento, CA 95814',
    phone: '(916) 555-0100',
    email: 'hello@yourhvac.example',
    website: 'yourhvac.example',
  },
  customer: {
    name: 'Diana Chen',
    address: '4421 J St, Sacramento, CA 95819',
    email: 'diana.chen@example.com',
    phone: '(916) 555-0142',
  },
  summary: 'Replace existing 14-year-old gas furnace and 3-ton AC condenser. Will install new programmable thermostat.',
  lineItems: [
    { category: 'labor', description: 'Install', qty: 4, unit: 'hr', unitPrice: 110, total: 440 },
    { category: 'materials', description: 'Furnace', qty: 1, unit: 'ea', unitPrice: 2730, total: 2730 },
  ],
  subtotal: 3170,
  tax: 212,
  total: 3382,
  terms: ['Old quote terms'],
};

describe('quoteToInvoice', () => {
  it('preserves contractor and customer', () => {
    const inv = quoteToInvoice(sourceQuote);
    expect(inv.contractor).toEqual(sourceQuote.contractor);
    expect(inv.customer).toEqual(sourceQuote.customer);
  });

  it('preserves trade, line items, subtotal, tax, total', () => {
    const inv = quoteToInvoice(sourceQuote);
    expect(inv.trade).toBe(sourceQuote.trade);
    expect(inv.lineItems).toEqual(sourceQuote.lineItems);
    expect(inv.subtotal).toBe(sourceQuote.subtotal);
    expect(inv.tax).toBe(sourceQuote.tax);
    expect(inv.total).toBe(sourceQuote.total);
  });

  it('produces an invoice number starting with INV-', () => {
    expect(quoteToInvoice(sourceQuote).invoiceNumber).toMatch(/^INV-/);
  });

  it('records the source quote number', () => {
    expect(quoteToInvoice(sourceQuote).sourceQuoteNumber).toBe('Q-SAMPLE-HVAC');
  });

  it('sets status to unpaid', () => {
    expect(quoteToInvoice(sourceQuote).status).toBe('unpaid');
  });

  it('sets dueDate to today + 30 days (ISO date)', () => {
    const inv = quoteToInvoice(sourceQuote);
    const issued = new Date(inv.dateIssued);
    const due = new Date(inv.dueDate);
    const diffDays = Math.round((due.getTime() - issued.getTime()) / (1000 * 60 * 60 * 24));
    expect(diffDays).toBe(30);
  });

  it('uses standard invoice terms (5 lines, payment timing language)', () => {
    const inv = quoteToInvoice(sourceQuote);
    expect(inv.terms.length).toBe(5);
    expect(inv.terms[0]).toMatch(/Payment due/i);
  });

  it('payment instructions reference the contractor name and ACH placeholder', () => {
    const inv = quoteToInvoice(sourceQuote);
    expect(inv.paymentInstructions.check.payeeName).toBe('Your HVAC Company');
    expect(inv.paymentInstructions.ach.routing).toBe('SAMPLE');
    expect(inv.paymentInstructions.ach.account).toBe('SAMPLE');
    expect(inv.paymentInstructions.ach.memo).toBe(inv.invoiceNumber);
  });

  it('rephrases summary to past tense for canned-style sentences', () => {
    const inv = quoteToInvoice(sourceQuote);
    expect(inv.summary).not.toMatch(/Replace existing/);
    expect(inv.summary).toMatch(/Replaced existing/);
    expect(inv.summary).toMatch(/Installed new/);
  });
});
