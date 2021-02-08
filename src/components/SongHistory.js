import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { faHistory } from '@fortawesome/free-solid-svg-icons';

class SongHistory extends Component {
  constructor(props) {
    super(props);
    this.state = {
      displayList: true
    };
  }

  toggleDisplay = () => {
    this.setState({
      displayList: !this.state.displayList
    });
  };

  render() {
    const { songHistory } = this.props;
    const songs = songHistory.map(song => song.song).reverse();
    return (
      <button id='recent-song-history' onClick={this.toggleDisplay}>
        {this.state.displayList && (
          <div id='recent-song-list'>
            {songs.map(song => (
              <div className='recent-song-info' key={song.id}>
                <img alt={`Album Title: ${song.album}`} src={song.art} />
                <div className='recent-song-meta'>
                  <b>{song.title}</b>
                  <p> {song.artist}</p>
                  <p> {song.album}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        <FontAwesomeIcon
          icon={faHistory}
          id='recently-played-icon'
          style={{ color: 'white' }}
        />
      </button>
    );
  }
}

SongHistory.propTypes = {
  songHistory: PropTypes.array
};

export default SongHistory;
