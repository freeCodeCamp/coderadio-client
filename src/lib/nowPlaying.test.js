import { describe, expect, it } from 'vitest';
import {
  elapsedSeconds,
  generatedAt,
  parseSseMessage,
  toNowPlaying
} from './nowPlaying';

const np = {
  now_playing: {
    played_at: 1000,
    elapsed: 30,
    duration: 200,
    song: { id: 'a', title: 'Song' }
  },
  listeners: { current: 33, unique: 29 },
  song_history: [{ song: { id: 'b' } }],
  station: { mounts: [{ url: 'm' }], remotes: [] }
};

describe('parseSseMessage', () => {
  it('reads live publications', () => {
    const raw = JSON.stringify({ pub: { data: { np } } });
    expect(parseSseMessage(raw)).toEqual({ np, live: true });
  });

  it('reads the latest publication from the connect message', () => {
    const raw = JSON.stringify({
      connect: {
        subs: {
          'station:coderadio': {
            publications: [{ data: { np: {} } }, { data: { np } }]
          }
        }
      }
    });
    expect(parseSseMessage(raw)).toEqual({ np, live: false });
  });

  it('ignores pings and invalid data', () => {
    expect(parseSseMessage('{}')).toBeNull();
    expect(parseSseMessage('not json')).toBeNull();
  });
});

describe('toNowPlaying', () => {
  it('uses unique listeners and applies the clock offset', () => {
    const result = toNowPlaying(np, 500);
    expect(result.listeners).toBe(29);
    expect(result.startedAt).toBe(1_000_500);
    expect(result.history).toEqual([{ id: 'b' }]);
  });

  it('computes when the payload was generated', () => {
    expect(generatedAt(np)).toBe(1_030_000);
  });
});

describe('elapsedSeconds', () => {
  it('clamps to the song duration', () => {
    expect(elapsedSeconds(0, 100, 50_000)).toBe(50);
    expect(elapsedSeconds(0, 100, 500_000)).toBe(100);
    expect(elapsedSeconds(10_000, 100, 0)).toBe(0);
  });
});
