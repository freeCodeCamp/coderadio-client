import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';

const np = {
  now_playing: {
    played_at: Date.now() / 1000,
    elapsed: 0,
    duration: 180,
    song: { id: '1', title: 'Test Song', artist: 'Test Artist', art: '' }
  },
  listeners: { current: 12, unique: 10 },
  song_history: [],
  station: {
    mounts: [
      { name: '128kbps MP3', url: 'https://radio/radio.mp3', bitrate: 128 }
    ],
    remotes: []
  }
};

class FakeEventSource {
  static CLOSED = 2;
  close() {}
}

beforeEach(() => {
  vi.stubGlobal('EventSource', FakeEventSource);
  vi.stubGlobal(
    'fetch',
    vi.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve(np) }))
  );
  vi.stubGlobal('matchMedia', () => ({
    matches: false,
    addEventListener() {},
    removeEventListener() {}
  }));
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('<App />', () => {
  it('shows the current song and the play button', async () => {
    render(<App />);

    expect(await screen.findByText('Test Song')).toBeInTheDocument();
    expect(screen.getByText('Listeners: 10')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Play' })).toBeInTheDocument();
  });
});
