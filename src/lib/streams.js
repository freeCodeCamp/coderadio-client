export const RETRY_DELAYS_MS = [1000, 2000, 4000, 8000, 15000, 30000];

export function shuffle(items, random = Math.random) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

const byBitrateDesc = (a, b) => Number(b.bitrate) - Number(a.bitrate);

// Relays first, preferred bitrate first, equal bitrates shuffled to spread load.
export function orderStreams(
  { mounts = [], remotes = [] },
  { lowBandwidth = false, random = Math.random } = {}
) {
  const order = streams => {
    const bitrates = [...new Set(streams.map(s => Number(s.bitrate)))].sort(
      (a, b) => (lowBandwidth ? a - b : b - a)
    );
    return bitrates.flatMap(rate =>
      shuffle(
        streams.filter(s => Number(s.bitrate) === rate),
        random
      )
    );
  };
  return [...order(remotes), ...order(mounts)];
}

export function streamOptions({ mounts = [], remotes = [] }) {
  return [...remotes, ...mounts].sort(byBitrateDesc);
}

// Retry the same stream first since most drops are blips, then rotate.
export function nextAttempt(failures, streams, currentUrl) {
  const urls = streams.map(s => s.url);
  const start = Math.max(0, urls.indexOf(currentUrl));
  const rotated = [...urls.slice(start), ...urls.slice(0, start)];
  return {
    url: rotated[failures % rotated.length] ?? currentUrl,
    delay: RETRY_DELAYS_MS[Math.min(failures, RETRY_DELAYS_MS.length - 1)]
  };
}

export function withCacheBuster(url, now = Date.now()) {
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}t=${now}`;
}
