import React from 'react';
import PropTypes from 'prop-types';
import { isBrowser } from 'react-device-detect';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleNotch } from '@fortawesome/free-solid-svg-icons';

import { ReactComponent as Pause } from '../assets/pause.svg';
import { ReactComponent as Play } from '../assets/play.svg';

class PlayPauseButton extends React.Component {
  state = {
    initialLoad: true
  };

  handleOnClick = () => isBrowser && this.props.togglePlay();

  handleOnTouchEnd = () => !isBrowser && this.props.togglePlay();

  static getDerivedStateFromProps(nextProps, prevState) {
    // Set initial load to render the initial message accordingly
    if (prevState.initialLoad && nextProps.playing) {
      return { initialLoad: false };
    }
    return null;
  }

  render() {
    return this.props.url ? (
      <button
        aria-label={this.props.playing ? 'Pause' : 'Play'}
        className={
          this.state.initialLoad
            ? 'play-container-cta play-container'
            : 'play-container'
        }
        id='toggle-play-pause'
        onClick={this.handleOnClick}
        onTouchEnd={this.handleOnTouchEnd}
      >
        {this.props.playing ? <Pause /> : <Play />}
      </button>
    ) : (
      <FontAwesomeIcon
        aria-hidden='true'
        className='loader-circle-notch'
        icon={faCircleNotch}
        spin={true}
      />
    );
  }
}

PlayPauseButton.propTypes = {
  playing: PropTypes.bool,
  togglePlay: PropTypes.func,
  url: PropTypes.string
};

export default PlayPauseButton;
