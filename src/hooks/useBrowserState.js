import { useEffect, useState, useSyncExternalStore } from 'react';

export function useMediaQuery(query) {
  return useSyncExternalStore(
    onChange => {
      const list = window.matchMedia(query);
      list.addEventListener('change', onChange);
      return () => list.removeEventListener('change', onChange);
    },
    () => window.matchMedia(query).matches,
    () => false
  );
}

export function usePageVisible() {
  return useSyncExternalStore(
    onChange => {
      document.addEventListener('visibilitychange', onChange);
      return () => document.removeEventListener('visibilitychange', onChange);
    },
    () => document.visibilityState === 'visible',
    () => true
  );
}

export function useNow(intervalMs, enabled) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!enabled) return;
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs, enabled]);

  return now;
}

// Delays a value so it lines up with the audio the listener actually hears.
export function useDelayedValue(value, getDelay) {
  const [delayed, setDelayed] = useState(null);

  useEffect(() => {
    if (!value) return;
    const delay = getDelay();
    const id = setTimeout(
      () => setDelayed({ ...value, startedAt: value.startedAt + delay }),
      delay
    );
    return () => clearTimeout(id);
  }, [value, getDelay]);

  return delayed;
}
