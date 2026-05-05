import { describe, it, expect } from 'vitest';
import { buildSystemPrompt } from '../lib/prompts';

describe('buildSystemPrompt', () => {
  it('mentions the selected trade by name', () => {
    expect(buildSystemPrompt('hvac', 'cold')).toMatch(/HVAC/i);
    expect(buildSystemPrompt('plumbing', 'cold')).toMatch(/plumbing/i);
  });

  it('includes Sacramento MSA reference', () => {
    expect(buildSystemPrompt('hvac', 'cold')).toMatch(/Sacramento/);
  });

  it('includes labor rates from the pricing reference', () => {
    const prompt = buildSystemPrompt('hvac', 'cold');
    expect(prompt).toMatch(/145/); // service rate
  });

  it('uses past tense for cold mode', () => {
    const prompt = buildSystemPrompt('hvac', 'cold');
    expect(prompt).toMatch(/work that was done|completed/i);
  });

  it('includes the JSON output schema constraint with invoice fields', () => {
    const prompt = buildSystemPrompt('hvac', 'cold');
    expect(prompt).toMatch(/JSON/);
    expect(prompt).toMatch(/invoiceNumber/);
    expect(prompt).toMatch(/dueDate/);
    expect(prompt).toMatch(/status/);
    expect(prompt).toMatch(/paymentInstructions/);
  });

  it('instructs tax on materials only', () => {
    expect(buildSystemPrompt('hvac', 'cold')).toMatch(/materials only|materials, not labor/i);
  });

  it('forbids markdown code fences', () => {
    expect(buildSystemPrompt('hvac', 'cold')).toMatch(/no markdown code fences|no code fences/i);
  });

  it('delta mode adds preserve-source-quote instructions', () => {
    const prompt = buildSystemPrompt('hvac', 'delta');
    expect(prompt).toMatch(/preserve customer info and contractor info/i);
    expect(prompt).toMatch(/NEW invoice number/i);
  });

  it('cold mode does NOT include delta-specific instructions', () => {
    const prompt = buildSystemPrompt('hvac', 'cold');
    expect(prompt).not.toMatch(/source quote/i);
  });
});
