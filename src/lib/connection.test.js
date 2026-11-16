import { describe, expect, it } from 'vitest';
import { isLowBandwidth } from './connection';

describe('isLowBandwidth', () => {
  it('assumes a normal connection when the browser does not say', () => {
    expect(isLowBandwidth(undefined)).toBe(false);
  });

  it('detects slow or data-saving connections', () => {
    expect(isLowBandwidth({ saveData: true })).toBe(true);
    expect(isLowBandwidth({ effectiveType: '2g' })).toBe(true);
    expect(isLowBandwidth({ downlink: 0.3 })).toBe(true);
    expect(isLowBandwidth({ effectiveType: '4g', downlink: 1.2 })).toBe(false);
    expect(isLowBandwidth({ downlink: 0 })).toBe(false);
  });
});
