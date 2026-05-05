import { describe, it, expect } from 'vitest';
import { sacramentoPricing } from '../pricing/sacramento';
import { TRADES } from '../types';

describe('sacramentoPricing', () => {
  it('has an entry for every supported trade', () => {
    for (const { id } of TRADES) {
      expect(sacramentoPricing[id]).toBeDefined();
    }
  });

  it('uses Sacramento County sales tax rate (7.75%)', () => {
    for (const { id } of TRADES) {
      expect(sacramentoPricing[id].salesTaxRate).toBe(0.0775);
    }
  });

  it('has at least one labor rate per trade', () => {
    for (const { id } of TRADES) {
      const rates = Object.values(sacramentoPricing[id].laborRates);
      expect(rates.length).toBeGreaterThan(0);
      for (const rate of rates) expect(rate).toBeGreaterThan(0);
    }
  });

  it('typical job size ranges are ascending and non-overlapping', () => {
    for (const { id } of TRADES) {
      const { small, medium, large } = sacramentoPricing[id].typicalJobSizes;
      expect(small[0]).toBeLessThan(small[1]);
      expect(small[1]).toBeLessThanOrEqual(medium[0]);
      expect(medium[0]).toBeLessThan(medium[1]);
      expect(medium[1]).toBeLessThanOrEqual(large[0]);
      expect(large[0]).toBeLessThan(large[1]);
    }
  });
});
