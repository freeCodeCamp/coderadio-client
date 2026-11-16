import { useEffect, useRef } from 'react';

export default function useMediaSession({ song, playing, onPlay, onPause }) {
  const handlers = useRef({ onPlay, onPause });

  useEffect(() => {
    handlers.current = { onPlay, onPause };
  });

  useEffect(() => {
    if (!('mediaSession' in navigator)) return;
    const session = navigator.mediaSession;
    session.setActionHandler('play', () => handlers.current.onPlay());
    session.setActionHandler('pause', () => handlers.current.onPause());
    session.setActionHandler('stop', () => handlers.current.onPause());
    return () => {
      for (const action of ['play', 'pause', 'stop']) {
        session.setActionHandler(action, null);
      }
    };
  }, []);

  useEffect(() => {
    if (!('mediaSession' in navigator) || !song?.title) return;
    navigator.mediaSession.metadata = new window.MediaMetadata({
      title: song.title,
      artist: song.artist,
      album: song.album || 'freeCodeCamp.org Code Radio',
      artwork: song.art ? [{ src: song.art }] : []
    });
  }, [song?.title, song?.artist, song?.album, song?.art]);

  useEffect(() => {
    if (!('mediaSession' in navigator)) return;
    navigator.mediaSession.playbackState = playing ? 'playing' : 'paused';
  }, [playing]);
}
