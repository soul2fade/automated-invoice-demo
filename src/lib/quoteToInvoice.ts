import type { Invoice, Quote } from '../types';

const STANDARD_INVOICE_TERMS = [
  'Payment due within 30 days of invoice date.',
  'Late payments accrue 1.5% interest per month.',
  'Returned check fee: $35.',
  'Disputes must be raised within 7 days of invoice date.',
  'By paying this invoice, customer acknowledges work was completed satisfactorily.',
];

const PAST_TENSE_REPLACEMENTS: [RegExp, string][] = [
  [/\bWill replace\b/g, 'Replaced'],
  [/\bWill install\b/g, 'Installed'],
  [/\bwill replace\b/g, 'replaced'],
  [/\bwill install\b/g, 'installed'],
  [/\bReplace existing\b/g, 'Replaced existing'],
  [/\bInstall new\b/g, 'Installed new'],
  [/\breplace\b/g, 'replaced'],
  [/\binstall\b/g, 'installed'],
  [/\bis to be installed\b/g, 'was installed'],
  [/\bare to be installed\b/g, 'were installed'],
  [/\bIncludes\b/g, 'Included'],
  [/\bincludes\b/g, 'included'],
];

function rephraseToCompletedTense(summary: string): string {
  let result = summary;
  for (const [pattern, replacement] of PAST_TENSE_REPLACEMENTS) {
    result = result.replace(pattern, replacement);
  }
  return result;
}

function randomDigits(n: number): string {
  let s = '';
  for (let i = 0; i < n; i++) s += Math.floor(Math.random() * 10).toString();
  return s;
}

function fmtDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function addDays(d: Date, n: number): Date {
  const copy = new Date(d.getTime());
  copy.setDate(copy.getDate() + n);
  return copy;
}

export function quoteToInvoice(quote: Quote): Invoice {
  const today = new Date();
  const invoiceNumber = `INV-${today.getFullYear()}-${randomDigits(4)}`;

  return {
    trade: quote.trade,
    invoiceNumber,
    dateIssued: fmtDate(today),
    dueDate: fmtDate(addDays(today, 30)),
    status: 'unpaid',
    contractor: quote.contractor,
    customer: quote.customer,
    sourceQuoteNumber: quote.quoteNumber,
    summary: rephraseToCompletedTense(quote.summary),
    lineItems: quote.lineItems,
    subtotal: quote.subtotal,
    tax: quote.tax,
    total: quote.total,
    paymentInstructions: {
      check: { payeeName: quote.contractor.name, address: quote.contractor.address },
      ach: { routing: 'SAMPLE', account: 'SAMPLE', memo: invoiceNumber },
    },
    terms: STANDARD_INVOICE_TERMS,
    acceptanceLine: 'Customer payment / signature',
  };
}
