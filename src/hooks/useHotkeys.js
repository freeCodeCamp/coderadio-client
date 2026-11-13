import { useEffect, useRef } from 'react';

const NATIVE_ACTIVATION =
  'button, a, summary, select, input, textarea, [contenteditable="true"]';
const TEXT_ENTRY = 'select, input, textarea, [contenteditable="true"]';

export function hotkeyAction(event) {
  if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey)
    return null;

  const target = event.target instanceof Element ? event.target : null;
  switch (event.key) {
    case ' ':
    case 'k':
      return target?.closest(NATIVE_ACTIVATION) ? null : 'toggle';
    case 'ArrowUp':
      return target?.closest(TEXT_ENTRY) ? null : 'volumeUp';
    case 'ArrowDown':
      return target?.closest(TEXT_ENTRY) ? null : 'volumeDown';
    default:
      return null;
  }
}

export default function useHotkeys(handlers) {
  const handlersRef = useRef(handlers);

  useEffect(() => {
    handlersRef.current = handlers;
  });

  useEffect(() => {
    const onKeyDown = event => {
      const action = hotkeyAction(event);
      if (!action) return;
      event.preventDefault();
      handlersRef.current[action]();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);
}
