import React from 'react';
import * as Sentry from '@sentry/react';
import App from './components/App';
import { createRoot } from 'react-dom/client';

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  integrations: [Sentry.browserTracingIntegration()],

  // We recommend adjusting this value in production, or using tracesSampler
  // for finer control
  tracesSampleRate: 1.0
});

const container = document.getElementById('app');
const root = createRoot(container!);
root.render(<App/>)
