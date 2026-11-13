// About 4x the 128kbps stream, since Chrome's estimate is coarse.
const MIN_DOWNLINK_MBPS = 0.5;

// Only Chromium has navigator.connection; if it's missing, assume a normal connection.
export function isLowBandwidth(connection = navigator.connection) {
  if (!connection) return false;
  if (connection.saveData) return true;
  if (['slow-2g', '2g'].includes(connection.effectiveType)) return true;
  return (
    typeof connection.downlink === 'number' &&
    connection.downlink > 0 &&
    connection.downlink < MIN_DOWNLINK_MBPS
  );
}
