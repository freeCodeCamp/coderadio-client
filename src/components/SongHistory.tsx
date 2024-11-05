import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { faHistory } from '@fortawesome/free-solid-svg-icons';

const DEFAULT_ART =
  'https://cdn-media-1.freecodecamp.org/code-radio/cover_placeholder.gif';



interface SongHistoryProps {
  fastConnection: boolean;
  songHistory: SongEntry[];
}

interface SongHistoryState {
  displayList: boolean; 
}



class SongHistory extends Component<SongHistoryProps,SongHistoryState> {
  constructor(props: SongHistoryProps) {
    super(props);
    this.state = {
      displayList: false
    };
  }

  toggleDisplay = () => {
    this.setState({
      displayList: !this.state.displayList
    });
  };

  render() {
    const { songHistory, fastConnection } = this.props;
    // Don't reverse song list, we want most recent song first.
    const songs = songHistory.map((song: SongEntry) => song.song);
    return (
      <>
        <button
          aria-controls='song-history'
          aria-expanded={this.state.displayList}
          aria-label='Recent Song History'
          className='recent-song-history'
          id='recent-song-history'
          onClick={this.toggleDisplay}
        >
          <FontAwesomeIcon
            aria-hidden='true'
            className='recently-played-icon'
            icon={faHistory}
          />
        </button>
        <ol
          aria-hidden={!this.state.displayList}
          className='recent-song-list'
          id='song-history'
        >
          {songs.map((song: SongDetails,index: number) => (
            <li className='recent-song-info' key={song.id}>
              <img
                alt=''
                role='presentation'
                src={fastConnection ? song.art : DEFAULT_ART}
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
}

export default SongHistory;
