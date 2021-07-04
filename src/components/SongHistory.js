import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { faHistory } from '@fortawesome/free-solid-svg-icons';

const DEFAULT_ART =
  'https://cdn-media-1.freecodecamp.org/code-radio/cover_placeholder.gif';
class SongHistory extends Component {
  constructor(props) {
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
    const songs = songHistory.map(song => song.song).reverse();
    return (
      <button
        aria-label='Recent Song History'
        className='recent-song-history'
        onClick={this.toggleDisplay}
      >
        {this.state.displayList && (
          <div className='recent-song-list'>
            {songs.map(song => (
              <div className='recent-song-info' key={song.id}>
                <img
                  alt=''
                  role='presentation'
                  src={fastConnection ? song.art : DEFAULT_ART}
                />
                <div className='recent-song-meta'>
                  <p>{song.title}</p>
                  <p> {song.artist}</p>
                  <p> {song.album}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        <FontAwesomeIcon
          className='recently-played-icon'
          icon={faHistory}
          style={{ color: 'white' }}
        />
      </button>
    );
  }
}

SongHistory.propTypes = {
  fastConnection: PropTypes.bool,
  songHistory: PropTypes.array
};

export default SongHistory;
