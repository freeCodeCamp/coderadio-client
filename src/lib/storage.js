const VOLUME_KEY = 'coderadio-volume';
export const DEFAULT_VOLUME = 0.5;

export function getStoredVolume() {
  try {
    const value = JSON.parse(localStorage.getItem(VOLUME_KEY));
    return typeof value === 'number' && value >= 0 && value <= 1
      ? value
      : DEFAULT_VOLUME;
  } catch {
    return DEFAULT_VOLUME;
  }
}

export function storeVolume(volume) {
  try {
    localStorage.setItem(VOLUME_KEY, JSON.stringify(volume));
  } catch {
    // Storage can be blocked in private browsing.
  }
}
