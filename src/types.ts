export type Trade = 'hvac' | 'plumbing' | 'electrical' | 'roofing';

export const TRADES: { id: Trade; label: string }[] = [
  { id: 'hvac', label: 'HVAC' },
  { id: 'plumbing', label: 'Plumbing' },
  { id: 'electrical', label: 'Electrical' },
  { id: 'roofing', label: 'Roofing' },
];

export interface LineItem {
  description: string;
  qty: number;
  unit: string;
  unitPrice: number;
  total: number;
  category: 'labor' | 'materials';
}

export interface CustomerInfo {
  name: string;
  address: string;
  email: string;
  phone: string;
}

export interface ContractorInfo {
  name: string;
  license: string;
  address: string;
  phone: string;
  email: string;
  website: string;
}

// Quote shape — used here for decoding the deep-link payload.
// Mirrors the shape from automated-quotes-demo.
export interface Quote {
  trade: Trade;
  quoteNumber: string;
  dateIssued: string;
  validUntil: string;
  contractor: ContractorInfo;
  customer: CustomerInfo;
  summary: string;
  lineItems: LineItem[];
  subtotal: number;
  tax: number;
  total: number;
  terms: string[];
}

export type InvoiceStatus = 'unpaid' | 'paid' | 'overdue';

export interface PaymentInstructions {
  check: {
    payeeName: string;
    address: string;
  };
  ach: {
    routing: string;
    account: string;
    memo: string;
  };
}

export interface Invoice {
  trade: Trade;
  invoiceNumber: string;
  dateIssued: string;
  dueDate: string;
  status: InvoiceStatus;
  contractor: ContractorInfo;
  customer: CustomerInfo;
  sourceQuoteNumber?: string; // present only when invoice was converted from a quote
  summary: string;
  lineItems: LineItem[];
  subtotal: number;
  tax: number;
  total: number;
  paymentInstructions: PaymentInstructions;
  terms: string[];
  acceptanceLine: string;
}
