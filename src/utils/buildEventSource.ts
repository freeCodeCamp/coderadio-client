export function buildEventSource(/** @type {string | URL} */ url: string | URL) {
  return new EventSource(url);
}
