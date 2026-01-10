import { describe, it, expect } from 'vitest';
import { parseOpeningHours } from '../public/js/validation.js'

describe('parseOpeningHours', () => {
  it('returns ok for valid opening hours', () => {
    const result = parseOpeningHours('10:00 - 22:00');
    expect(result.ok).toBe(true);
  });

  it('fails for invalid format', () => {
    const result = parseOpeningHours('10am - 10pm');
    expect(result.ok).toBe(false);
    expect(result.message).toBe(
      'Opening Hours must be in format HH:MM - HH:MM (e.g. 10:00 - 22:00)'
    );
  });

  it('fails for invalid time values', () => {
    const result = parseOpeningHours('24:00 - 10:00');
    expect(result.ok).toBe(false);
    expect(result.message).toBe(
      'Opening Hours has invalid time values (00:00 to 23:59 only)'
    );
  });

  it('fails when start time is later than end time', () => {
    const result = parseOpeningHours('22:00 - 10:00');
    expect(result.ok).toBe(false);
    expect(result.message).toBe(
      'Opening Hours start time must be earlier than end time'
    );
  });
});
