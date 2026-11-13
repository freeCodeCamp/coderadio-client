import { describe, expect, it } from 'vitest';
import {
  RETRY_DELAYS_MS,
  nextAttempt,
  orderStreams,
  shuffle,
  withCacheBuster
} from './streams';

const high = { url: 'https://radio/radio.mp3', bitrate: 128 };
const low = { url: 'https://radio/low.mp3', bitrate: 64 };
const relay = { url: 'https://relay/radio.mp3', bitrate: 128 };

describe('orderStreams', () => {
  it('prefers the highest bitrate by default', () => {
    expect(orderStreams({ mounts: [low, high] })[0]).toBe(high);
  });

  it('prefers the lowest bitrate on slow connections', () => {
    const ordered = orderStreams(
      { mounts: [high, low] },
      { lowBandwidth: true }
    );
    expect(ordered[0]).toBe(low);
  });

  it('puts relays before local mounts', () => {
    expect(orderStreams({ mounts: [high, low], remotes: [relay] })[0]).toBe(
      relay
    );
  });
});

describe('shuffle', () => {
  it('keeps every item', () => {
    expect(shuffle([1, 2, 3, 4]).sort()).toEqual([1, 2, 3, 4]);
  });
});

describe('nextAttempt', () => {
  const streams = [high, low];

  it('retries the same stream first', () => {
    expect(nextAttempt(0, streams, high.url)).toEqual({
      url: high.url,
      delay: RETRY_DELAYS_MS[0]
    });
  });

  it('then rotates to the other streams', () => {
    expect(nextAttempt(1, streams, high.url).url).toBe(low.url);
    expect(nextAttempt(2, streams, high.url).url).toBe(high.url);
  });

  it('caps the delay', () => {
    expect(nextAttempt(99, streams, high.url).delay).toBe(
      RETRY_DELAYS_MS.at(-1)
    );
  });
});

describe('withCacheBuster', () => {
  it('adds a timestamp parameter', () => {
    expect(withCacheBuster('https://radio/radio.mp3', 42)).toBe(
      'https://radio/radio.mp3?t=42'
    );
    expect(withCacheBuster('https://radio/radio.mp3?a=1', 42)).toBe(
      'https://radio/radio.mp3?a=1&t=42'
    );
  });
});
