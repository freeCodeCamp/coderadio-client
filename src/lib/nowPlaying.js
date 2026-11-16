// Only live `pub` messages are fresh enough to estimate the server clock offset.
export function parseSseMessage(raw) {
  let data;
  try {
    data = JSON.parse(raw);
  } catch {
    return null;
  }

  if (data?.pub?.data?.np) return { np: data.pub.data.np, live: true };

  const subs = data?.connect?.subs ?? {};
  const publications = Object.values(subs).flatMap(s => s.publications ?? []);
  const latest = publications.at(-1)?.data?.np;
  return latest ? { np: latest, live: false } : null;
}

// Server time in ms when the payload was generated.
export function generatedAt(np) {
  const { played_at: playedAt, elapsed } = np.now_playing ?? {};
  if (typeof playedAt !== 'number' || typeof elapsed !== 'number') return null;
  return (playedAt + elapsed) * 1000;
}

export function toNowPlaying(np, clockOffset = 0) {
  return {
    song: np.now_playing?.song ?? {},
    duration: np.now_playing?.duration ?? 0,
    startedAt: (np.now_playing?.played_at ?? 0) * 1000 + clockOffset,
    listeners: np.listeners?.unique ?? np.listeners?.current ?? 0,
    history: (np.song_history ?? []).map(entry => entry.song),
    mounts: np.station?.mounts ?? [],
    remotes: np.station?.remotes ?? []
  };
}

export function elapsedSeconds(startedAt, duration, now = Date.now()) {
  const elapsed = Math.floor((now - startedAt) / 1000);
  return Math.min(Math.max(elapsed, 0), duration || elapsed);
}
