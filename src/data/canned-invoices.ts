import type { Invoice, PaymentInstructions, Trade } from '../types';

const SAMPLE_CUSTOMER = {
  name: 'Diana Chen',
  address: '4421 J St, Sacramento, CA 95819',
  email: 'diana.chen@example.com',
  phone: '(916) 555-0142',
};

const today = new Date();
const fmt = (d: Date) => d.toISOString().slice(0, 10);
const addDays = (d: Date, n: number) => {
  const copy = new Date(d.getTime());
  copy.setDate(copy.getDate() + n);
  return copy;
};

const CONTRACTORS: Record<Trade, Invoice['contractor']> = {
  hvac: {
    name: 'Your HVAC Company',
    license: 'CSLB Lic. #SAMPLE',
    address: '1234 Sample St, Sacramento, CA 95814',
    phone: '(916) 555-0100',
    email: 'hello@yourhvac.example',
    website: 'yourhvac.example',
  },
  plumbing: {
    name: 'Your Plumbing Company',
    license: 'CSLB Lic. #SAMPLE',
    address: '1234 Sample St, Sacramento, CA 95814',
    phone: '(916) 555-0100',
    email: 'hello@yourplumbing.example',
    website: 'yourplumbing.example',
  },
  electrical: {
    name: 'Your Electrical Company',
    license: 'CSLB Lic. #SAMPLE',
    address: '1234 Sample St, Sacramento, CA 95814',
    phone: '(916) 555-0100',
    email: 'hello@yourelectric.example',
    website: 'yourelectric.example',
  },
  roofing: {
    name: 'Your Roofing Company',
    license: 'CSLB Lic. #SAMPLE',
    address: '1234 Sample St, Sacramento, CA 95814',
    phone: '(916) 555-0100',
    email: 'hello@yourroofing.example',
    website: 'yourroofing.example',
  },
};

function paymentInstructionsFor(trade: Trade, invoiceNumber: string): PaymentInstructions {
  const c = CONTRACTORS[trade];
  return {
    check: { payeeName: c.name, address: c.address },
    ach: { routing: 'SAMPLE', account: 'SAMPLE', memo: invoiceNumber },
  };
}

const STANDARD_INVOICE_TERMS = [
  'Payment due within 30 days of invoice date.',
  'Late payments accrue 1.5% interest per month.',
  'Returned check fee: $35.',
  'Disputes must be raised within 7 days of invoice date.',
  'By paying this invoice, customer acknowledges work was completed satisfactorily.',
];

export const cannedInvoices: Record<Trade, Invoice> = {
  hvac: {
    trade: 'hvac',
    invoiceNumber: 'INV-SAMPLE-HVAC',
    dateIssued: fmt(today),
    dueDate: fmt(addDays(today, 30)),
    status: 'unpaid',
    contractor: CONTRACTORS.hvac,
    customer: SAMPLE_CUSTOMER,
    summary: 'Replaced 14-year-old gas furnace and 3-ton AC condenser with high-efficiency equivalents. Installed new programmable thermostat. 2,200 sq ft single-story ranch home. Refrigerant charge, equipment haul-away, and full system commissioning completed.',
    lineItems: [
      { category: 'labor', description: 'System removal and disposal', qty: 4, unit: 'hr', unitPrice: 110, total: 440 },
      { category: 'labor', description: 'New system installation', qty: 12, unit: 'hr', unitPrice: 110, total: 1320 },
      { category: 'labor', description: 'Refrigerant charge & system commissioning', qty: 2, unit: 'hr', unitPrice: 145, total: 290 },
      { category: 'materials', description: 'Condensing unit (3-ton, 16 SEER2)', qty: 1, unit: 'ea', unitPrice: 3120, total: 3120 },
      { category: 'materials', description: 'Air handler (3-ton)', qty: 1, unit: 'ea', unitPrice: 2405, total: 2405 },
      { category: 'materials', description: 'High-efficiency gas furnace (80k BTU)', qty: 1, unit: 'ea', unitPrice: 2730, total: 2730 },
      { category: 'materials', description: 'Programmable thermostat', qty: 1, unit: 'ea', unitPrice: 308, total: 308 },
      { category: 'materials', description: 'Refrigerant R-410A', qty: 8, unit: 'lb', unitPrice: 133, total: 1064 },
    ],
    subtotal: 11677,
    tax: 746,
    total: 12423,
    paymentInstructions: paymentInstructionsFor('hvac', 'INV-SAMPLE-HVAC'),
    terms: STANDARD_INVOICE_TERMS,
    acceptanceLine: 'Customer payment / signature',
  },
  plumbing: {
    trade: 'plumbing',
    invoiceNumber: 'INV-SAMPLE-PLU',
    dateIssued: fmt(today),
    dueDate: fmt(addDays(today, 30)),
    status: 'unpaid',
    contractor: CONTRACTORS.plumbing,
    customer: SAMPLE_CUSTOMER,
    summary: 'Replaced 12-year-old 50-gallon tank water heater with new tankless unit in garage. Gas line resize, new venting, condensate drain, and removal of old equipment completed.',
    lineItems: [
      { category: 'labor', description: 'Water heater removal and disposal', qty: 2, unit: 'hr', unitPrice: 105, total: 210 },
      { category: 'labor', description: 'Tankless installation including gas line resize', qty: 6, unit: 'hr', unitPrice: 105, total: 630 },
      { category: 'labor', description: 'Venting and condensate drain', qty: 3, unit: 'hr', unitPrice: 105, total: 315 },
      { category: 'materials', description: 'Tankless water heater', qty: 1, unit: 'ea', unitPrice: 2080, total: 2080 },
      { category: 'materials', description: 'Stainless steel vent kit', qty: 1, unit: 'ea', unitPrice: 320, total: 320 },
      { category: 'materials', description: 'Gas line and fittings (3/4")', qty: 12, unit: 'lf', unitPrice: 7.5, total: 90 },
    ],
    subtotal: 3645,
    tax: 193,
    total: 3838,
    paymentInstructions: paymentInstructionsFor('plumbing', 'INV-SAMPLE-PLU'),
    terms: STANDARD_INVOICE_TERMS,
    acceptanceLine: 'Customer payment / signature',
  },
  electrical: {
    trade: 'electrical',
    invoiceNumber: 'INV-SAMPLE-ELEC',
    dateIssued: fmt(addDays(today, -7)),    // PAID — issued a week ago
    dueDate: fmt(addDays(today, 23)),       // would have been due in 23 more days
    status: 'paid',
    contractor: CONTRACTORS.electrical,
    customer: SAMPLE_CUSTOMER,
    summary: 'Installed Level 2 EV charging circuit (240V, 50A) in garage. New dedicated breaker in main panel, 35 ft of conduit run, and final inspection coordination completed. Existing panel had capacity (verified 200A). Sample invoice — not a real bill.',
    lineItems: [
      { category: 'labor', description: 'Panel work and breaker install', qty: 2, unit: 'hr', unitPrice: 140, total: 280 },
      { category: 'labor', description: 'Conduit run and wire pull', qty: 3, unit: 'hr', unitPrice: 110, total: 330 },
      { category: 'labor', description: 'Outlet install and final testing', qty: 2, unit: 'hr', unitPrice: 110, total: 220 },
      { category: 'materials', description: 'EV charging circuit kit (240V)', qty: 1, unit: 'ea', unitPrice: 513, total: 513 },
      { category: 'materials', description: '50A double-pole breaker', qty: 1, unit: 'ea', unitPrice: 65, total: 65 },
      { category: 'materials', description: '6 AWG wire (35 ft)', qty: 35, unit: 'lf', unitPrice: 4.2, total: 147 },
      { category: 'materials', description: 'EMT conduit and fittings', qty: 1, unit: 'set', unitPrice: 95, total: 95 },
    ],
    subtotal: 1650,
    tax: 64,
    total: 1714,
    paymentInstructions: paymentInstructionsFor('electrical', 'INV-SAMPLE-ELEC'),
    terms: STANDARD_INVOICE_TERMS,
    acceptanceLine: 'Customer payment / signature',
  },
  roofing: {
    trade: 'roofing',
    invoiceNumber: 'INV-SAMPLE-ROOF',
    dateIssued: fmt(addDays(today, -45)),  // OVERDUE — issued 45 days ago
    dueDate: fmt(addDays(today, -15)),     // due 15 days ago
    status: 'overdue',
    contractor: CONTRACTORS.roofing,
    customer: SAMPLE_CUSTOMER,
    summary: 'Full asphalt shingle roof replacement on 22-square (2,200 sq ft) single-story home. Tear-off of existing shingles, new synthetic underlayment, drip edge, ridge cap, and 30-year architectural shingles installed. Disposal included. Sample invoice — not a real bill.',
    lineItems: [
      { category: 'labor', description: 'Underlayment and shingle installation', qty: 36, unit: 'hr', unitPrice: 85, total: 3060 },
      { category: 'labor', description: 'Flashing, drip edge, ridge cap installation', qty: 8, unit: 'hr', unitPrice: 85, total: 680 },
      { category: 'materials', description: 'Tear-off and disposal', qty: 22, unit: 'sq', unitPrice: 58.5, total: 1287 },
      { category: 'materials', description: 'Asphalt shingle (30-year architectural)', qty: 22, unit: 'sq', unitPrice: 154, total: 3388 },
      { category: 'materials', description: 'Synthetic underlayment', qty: 22, unit: 'sq', unitPrice: 41, total: 902 },
      { category: 'materials', description: 'Drip edge', qty: 180, unit: 'lf', unitPrice: 3.6, total: 648 },
      { category: 'materials', description: 'Ridge cap', qty: 50, unit: 'lf', unitPrice: 8.7, total: 435 },
    ],
    subtotal: 10400,
    tax: 516,
    total: 10916,
    paymentInstructions: paymentInstructionsFor('roofing', 'INV-SAMPLE-ROOF'),
    terms: STANDARD_INVOICE_TERMS,
    acceptanceLine: 'Customer payment / signature',
  },
};
