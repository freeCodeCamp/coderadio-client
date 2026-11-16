import { DEFAULT_ART } from '../config';
import { useNow } from '../hooks/useBrowserState';
import { elapsedSeconds } from '../lib/nowPlaying';

export default function CurrentSong({
  nowPlaying,
  playing,
  reconnecting,
  showArt,
  ticking,
  children
}) {
  const now = useNow(1000, ticking);
  const song = nowPlaying?.song ?? {};
  const duration = nowPlaying?.duration ?? 0;
  const elapsed = nowPlaying
    ? elapsedSeconds(nowPlaying.startedAt, duration, now)
    : 0;

  return (
    <div
      className={
        playing
          ? 'meta-display thumb meta-display-visible'
          : 'meta-display thumb'
      }
    >
      <img
        alt='album art'
        data-meta='picture'
        src={showArt && song.art ? song.art : DEFAULT_ART}
      />
      <div className='now-playing'>
        <div className='progress-container'>
          <progress
            aria-hidden='true'
            data-meta='duration'
            max={duration}
            value={elapsed}
          />
        </div>
        <div data-meta='title'>{song.title}</div>
        <div data-meta='artist'>{song.artist}</div>
        <div data-meta='album'>{song.album}</div>
        <div aria-live='polite' data-meta='listeners'>
          Listeners: {nowPlaying?.listeners ?? 0}
        </div>
        <div aria-live='polite' className='connection-status' role='status'>
          {reconnecting && 'Reconnecting…'}
        </div>
        {children}
      </div>
    </div>
  );
}
