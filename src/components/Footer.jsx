import { usePageVisible } from '../hooks/useBrowserState';
import { isLowBandwidth } from '../lib/connection';
import { streamOptions } from '../lib/streams';
import CurrentSong from './CurrentSong';
import PlayPauseButton from './PlayPauseButton';
import Slider from './Slider';
import SongHistory from './SongHistory';

export default function Footer({ nowPlaying, player }) {
  const visible = usePageVisible();
  const showArt = !isLowBandwidth();
  const options = nowPlaying ? streamOptions(nowPlaying) : [];

  return (
    <footer>
      {visible && (
        <SongHistory songs={nowPlaying?.history ?? []} showArt={showArt} />
      )}
      <CurrentSong
        nowPlaying={nowPlaying}
        playing={player.playing}
        reconnecting={player.status === 'reconnecting'}
        showArt={showArt}
        ticking={player.playing && visible}
      >
        {options.length > 0 && player.url && (
          <select
            aria-label='Select Stream'
            data-meta='stream-select'
            id='stream-select'
            onChange={event => player.selectStream(event.target.value)}
            value={player.url}
          >
            {options.map(stream => (
              <option key={stream.url} value={stream.url}>
                {stream.name}
              </option>
            ))}
          </select>
        )}
      </CurrentSong>
      <PlayPauseButton
        loading={!player.url}
        onToggle={player.toggle}
        playing={player.playing}
      />
      <Slider onChange={player.setVolume} volume={player.volume} />
    </footer>
  );
}
