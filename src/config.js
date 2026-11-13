const API_ORIGIN = 'https://coderadio-admin-v2.freecodecamp.org';

const SSE_SUBSCRIPTION = encodeURIComponent(
  JSON.stringify({ subs: { 'station:coderadio': { recover: true } } })
);

export const NOWPLAYING_URL =
  import.meta.env.VITE_NOWPLAYING_URL ??
  `${API_ORIGIN}/api/nowplaying_static/coderadio.json`;

export const NOWPLAYING_SSE_URL = `${
  import.meta.env.VITE_NOWPLAYING_SSE_URL ??
  `${API_ORIGIN}/api/live/nowplaying/sse`
}?cf_connect=${SSE_SUBSCRIPTION}`;

export const SENTRY_DSN =
  import.meta.env.VITE_SENTRY_DSN ?? import.meta.env.REACT_APP_SENTRY_DSN;

export const DEFAULT_ART =
  'https://cdn-media-1.freecodecamp.org/code-radio/cover_placeholder.gif';
