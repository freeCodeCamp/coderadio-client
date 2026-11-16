import { useRef } from 'react';
import useAudioPlayer from '../hooks/useAudioPlayer';
import useHotkeys from '../hooks/useHotkeys';
import useMediaSession from '../hooks/useMediaSession';
import useNowPlaying from '../hooks/useNowPlaying';
import { useDelayedValue } from '../hooks/useBrowserState';
import Nav from './Nav';
import Main from './Main';
import Footer from './Footer';

import '../css/App.css';

const VOLUME_STEP = 0.05;
const NO_STREAMS = [];

export default function App() {
  const audioRef = useRef(null);
  const live = useNowPlaying();
  const player = useAudioPlayer(audioRef, {
    mounts: live?.mounts ?? NO_STREAMS,
    remotes: live?.remotes ?? NO_STREAMS
  });
  const nowPlaying = useDelayedValue(live, player.getLatencyMs);

  useHotkeys({
    toggle: player.toggle,
    volumeUp: () => player.setVolume(player.volume + VOLUME_STEP),
    volumeDown: () => player.setVolume(player.volume - VOLUME_STEP)
  });

  useMediaSession({
    song: nowPlaying?.song,
    playing: player.playing,
    onPlay: player.play,
    onPause: player.pause
  });

  return (
    <div className='App'>
      <Nav />
      <Main analyser={player.analyser} playing={player.playing} />
      {/* crossOrigin lets the visualizer read the audio data. */}
      <audio aria-label='audio' crossOrigin='anonymous' ref={audioRef} />
      <Footer nowPlaying={nowPlaying} player={player} />
    </div>
  );
}
