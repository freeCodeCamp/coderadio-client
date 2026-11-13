import { useState } from 'react';
import { DEFAULT_ART } from '../config';
import HistoryIcon from '../assets/history.svg?react';

export default function SongHistory({ songs, showArt }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        aria-controls='song-history'
        aria-expanded={open}
        aria-label='Recent Song History'
        className='recent-song-history'
        id='recent-song-history'
        onClick={() => setOpen(!open)}
      >
        <HistoryIcon aria-hidden='true' className='recently-played-icon' />
      </button>
      <ol aria-hidden={!open} className='recent-song-list' id='song-history'>
        {songs.map((song, index) => (
          <li className='recent-song-info' key={`${song.id}-${index}`}>
            <img
              alt=''
              role='presentation'
              src={showArt && song.art ? song.art : DEFAULT_ART}
            />
            <p className='recent-song-meta'>
              <span>
                <span className='sr-only'>Song {index + 1}:</span>
                {song.title}
              </span>
              <span>
                <span className='sr-only'>, Artist:</span> {song.artist}
              </span>
              <span>
                <span className='sr-only'>, Album:</span> {song.album}
              </span>
            </p>
          </li>
        ))}
      </ol>
    </>
  );
}
