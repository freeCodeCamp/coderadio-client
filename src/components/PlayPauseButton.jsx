import { useState } from 'react';
import Pause from '../assets/pause.svg?react';
import Play from '../assets/play.svg?react';
import Spinner from '../assets/spinner.svg?react';

export default function PlayPauseButton({ loading, playing, onToggle }) {
  const [hasPlayed, setHasPlayed] = useState(false);

  if (loading) {
    return <Spinner aria-hidden='true' className='loader-circle-notch' />;
  }

  return (
    <button
      aria-label={playing ? 'Pause' : 'Play'}
      className={
        hasPlayed ? 'play-container' : 'play-container-cta play-container'
      }
      id='toggle-play-pause'
      onClick={() => {
        setHasPlayed(true);
        onToggle();
      }}
    >
      {playing ? <Pause /> : <Play />}
    </button>
  );
}
