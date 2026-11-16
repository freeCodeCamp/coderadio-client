import { useEffect, useRef, useState } from 'react';
import * as Sentry from '@sentry/react';
import { NOWPLAYING_SSE_URL, NOWPLAYING_URL } from '../config';
import { RETRY_DELAYS_MS } from '../lib/streams';
import { generatedAt, parseSseMessage, toNowPlaying } from '../lib/nowPlaying';

export default function useNowPlaying() {
  const [nowPlaying, setNowPlaying] = useState(null);
  const clockOffset = useRef(0);

  useEffect(() => {
    let source;
    let retryTimer;
    let attempts = 0;
    let cancelled = false;

    const update = (np, live) => {
      if (cancelled) return;
      const serverTime = generatedAt(np);
      if (live && serverTime) clockOffset.current = Date.now() - serverTime;
      setNowPlaying(toNowPlaying(np, clockOffset.current));
    };

    const fetchSnapshot = () =>
      fetch(NOWPLAYING_URL, { cache: 'no-store' })
        .then(res => (res.ok ? res.json() : Promise.reject(res.status)))
        .then(np => update(np, false))
        .catch(() => {});

    const connect = () => {
      let opened = false;
      source = new EventSource(NOWPLAYING_SSE_URL);

      source.onopen = () => {
        attempts = 0;
        if (opened) fetchSnapshot();
        opened = true;
      };

      source.onmessage = event => {
        const message = parseSseMessage(event.data);
        if (message) update(message.np, message.live);
      };

      source.onerror = () => {
        Sentry.addBreadcrumb({
          category: 'sse',
          message: 'Now playing connection error'
        });
        if (source.readyState !== EventSource.CLOSED) return;
        const delay =
          RETRY_DELAYS_MS[Math.min(attempts++, RETRY_DELAYS_MS.length - 1)];
        retryTimer = setTimeout(() => {
          fetchSnapshot();
          connect();
        }, delay);
      };
    };

    fetchSnapshot();
    connect();

    return () => {
      cancelled = true;
      clearTimeout(retryTimer);
      source?.close();
    };
  }, []);

  return nowPlaying;
}
