/**
 * Sacramento MSA pricing reference data.
 *
 * Source date: 2026-05-04
 * Sources: BLS California regional labor data, RSMeans regional indices,
 *          local trade association posts.
 *
 * Review cadence: re-check labor rates annually, sales tax on any CA/county
 * rate change, and material prices opportunistically. These values do not
 * need to be perfect — they exist to give the LLM a defensible regional
 * anchor when generating quotes.
 *
 * `markup` is the multiplier applied on top of wholesale `unitPrice` to reach
 * the customer-facing price (e.g., markup: 0.4 → customer price = unitPrice * 1.4).
 */
import type { Trade } from '../types';

export interface TradePricing {
  laborRates: Record<string, number>;
  materials: Record<string, { unit: string; unitPrice: number; markup: number }>;
  typicalJobSizes: { small: [number, number]; medium: [number, number]; large: [number, number] };
  salesTaxRate: number;
  regionalNotes: string;
}

export const sacramentoPricing: Record<Trade, TradePricing> = {
  hvac: {
    laborRates: { service: 145, install: 110, helper: 75 },
    materials: {
      'Refrigerant R-410A': { unit: 'lb', unitPrice: 95, markup: 0.4 },
      'Heat exchanger (mid-tier)': { unit: 'ea', unitPrice: 850, markup: 0.35 },
      'Programmable thermostat': { unit: 'ea', unitPrice: 220, markup: 0.4 },
      'Ductwork (rigid, per linear foot)': { unit: 'lf', unitPrice: 18, markup: 0.4 },
      'Condensing unit (3-ton, 16 SEER2)': { unit: 'ea', unitPrice: 2400, markup: 0.3 },
      'Air handler (3-ton)': { unit: 'ea', unitPrice: 1850, markup: 0.3 },
      'High-efficiency gas furnace (80k BTU)': { unit: 'ea', unitPrice: 2100, markup: 0.3 },
    },
    typicalJobSizes: { small: [400, 1500], medium: [1500, 6000], large: [6000, 18000] },
    salesTaxRate: 0.0775,
    regionalNotes: 'Sacramento Valley summer heat (95-105°F May-Sept) drives high HVAC service demand. AC replacements peak May-July; furnace work peaks Oct-Feb.',
  },
  plumbing: {
    laborRates: { service: 135, install: 105, apprentice: 75 },
    materials: {
      'Standard toilet (1.28 GPF)': { unit: 'ea', unitPrice: 280, markup: 0.4 },
      'Tank water heater (50-gal gas)': { unit: 'ea', unitPrice: 1100, markup: 0.3 },
      'Tankless water heater': { unit: 'ea', unitPrice: 1600, markup: 0.3 },
      'PEX tubing (per linear foot)': { unit: 'lf', unitPrice: 1.4, markup: 0.5 },
      'Copper pipe 3/4" (per linear foot)': { unit: 'lf', unitPrice: 6.5, markup: 0.5 },
      'Standard faucet': { unit: 'ea', unitPrice: 180, markup: 0.4 },
      'Garbage disposal (1/2 HP)': { unit: 'ea', unitPrice: 165, markup: 0.4 },
    },
    typicalJobSizes: { small: [250, 1200], medium: [1200, 5000], large: [5000, 15000] },
    salesTaxRate: 0.0775,
    regionalNotes: 'Older Sacramento neighborhoods (East Sac, Curtis Park, Land Park) have galvanized pipe replacement demand. New construction in Roseville/Folsom/Elk Grove drives install volume.',
  },
  electrical: {
    laborRates: { service: 140, install: 110, apprentice: 80 },
    materials: {
      '200A main panel': { unit: 'ea', unitPrice: 650, markup: 0.35 },
      '20A circuit breaker': { unit: 'ea', unitPrice: 22, markup: 0.5 },
      '12 AWG Romex (per 250 ft roll)': { unit: 'roll', unitPrice: 95, markup: 0.4 },
      'Standard duplex outlet': { unit: 'ea', unitPrice: 4, markup: 0.6 },
      'GFCI outlet': { unit: 'ea', unitPrice: 22, markup: 0.5 },
      'Recessed LED can (6 in)': { unit: 'ea', unitPrice: 28, markup: 0.5 },
      'EV charging circuit (240V)': { unit: 'ea', unitPrice: 380, markup: 0.35 },
    },
    typicalJobSizes: { small: [300, 1500], medium: [1500, 6000], large: [6000, 14000] },
    salesTaxRate: 0.0775,
    regionalNotes: 'Sacramento area has rising EV adoption — Level 2 charger installs are a growth segment. Title 24 (CA energy code) compliance drives demand for LED retrofits.',
  },
  roofing: {
    laborRates: { service: 95, install: 85, helper: 65 },
    materials: {
      'Asphalt shingle (per square / 100 sq ft)': { unit: 'sq', unitPrice: 110, markup: 0.4 },
      'Synthetic underlayment (per square)': { unit: 'sq', unitPrice: 28, markup: 0.45 },
      'Ice & water shield (per square)': { unit: 'sq', unitPrice: 65, markup: 0.4 },
      'Drip edge (per linear foot)': { unit: 'lf', unitPrice: 2.4, markup: 0.5 },
      'Ridge cap (per linear foot)': { unit: 'lf', unitPrice: 6, markup: 0.45 },
      'Tear-off and disposal (per square)': { unit: 'sq', unitPrice: 45, markup: 0.3 },
      'Tile roof (per square, concrete)': { unit: 'sq', unitPrice: 320, markup: 0.35 },
    },
    typicalJobSizes: { small: [800, 4000], medium: [4000, 14000], large: [14000, 35000] },
    salesTaxRate: 0.0775,
    regionalNotes: 'Sacramento summer hailstorms (rare but common in foothills) drive insurance work. Tile roofs common in older suburbs; asphalt shingle dominates new construction.',
  },
};
