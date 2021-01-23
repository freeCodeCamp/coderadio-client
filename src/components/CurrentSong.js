import React from 'react';
import PropTypes from 'prop-types';

const DEFAULT_ART =
  'https://cdn-media-1.freecodecamp.org/code-radio/cover_placeholder.gif';

const CurrentSong = props => (
  <div className={props.playing ? 'thumb shown' : 'thumb'} id='metaDisplay'>
    <img
      alt='album art'
      data-meta='picture'
      src={props.fastConnection ? props.currentSong.art : DEFAULT_ART}
    />
    <div id='nowPlaying'>
      <progress
        data-meta='duration'
        max={props.songDuration}
        value={props.progressVal}
      />
      <div data-meta='title'>{props.currentSong.title}</div>
      <div data-meta='artist'>{props.currentSong.artist}</div>
      <div data-meta='album'>{props.currentSong.album}</div>
      <div data-meta='listeners'>Listeners: {props.listeners}</div>
      {props.mountOptions}
    </div>
  </div>
);

CurrentSong.propTypes = {
  currentSong: PropTypes.object,
  progressVal: PropTypes.number,
  fastConnection: PropTypes.bool,
  listeners: PropTypes.number,
  mountOptions: PropTypes.node,
  playing: PropTypes.bool,
  songDuration: PropTypes.number
};

export default CurrentSong;
