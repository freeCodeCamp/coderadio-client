import React, { ReactNode } from 'react';

const DEFAULT_ART =
  'https://cdn-media-1.freecodecamp.org/code-radio/cover_placeholder.gif';


interface SongProps {
  mountOptions: ReactNode;
  currentSong: SongDetails;
  fastConnection: boolean;
  listeners: number;
  playing: boolean;
  progressVal: number;
  songDuration: number;
}

const CurrentSong: React.FC<SongProps> = SongProps => (
  <div
    className={
      SongProps.playing
        ? 'meta-display thumb meta-display-visible'
        : 'meta-display thumb'
    }
  >
    <img
      alt='album art'
      data-meta='picture'
      src={SongProps.fastConnection ? SongProps.currentSong.art : DEFAULT_ART}
    />
    <div className='now-playing'>
      <div className='progress-container'>
        <progress
          aria-hidden='true'
          data-meta='duration'
          max={SongProps.songDuration}
          value={SongProps.progressVal}
        />
      </div>
      <div data-meta='title'>{SongProps.currentSong.title}</div>
      <div data-meta='artist'>{SongProps.currentSong.artist}</div>
      <div data-meta='album'>{SongProps.currentSong.album}</div>
      <div data-meta='listeners'>Listeners: {SongProps.listeners}</div>
      {SongProps.mountOptions}
    </div>
  </div>
);

export default CurrentSong;
