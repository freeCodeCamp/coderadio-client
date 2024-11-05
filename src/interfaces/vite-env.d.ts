/// <reference types="vite/client" />
declare module '*.webp' {
  const value: any;
}

interface Window {
  webkitAudioContext: typeof AudioContext;
}

interface ImportMetaEnv {
  readonly VITE_SENTRY_DSN: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
