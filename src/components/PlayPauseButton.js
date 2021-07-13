import React from 'react';
import PropTypes from 'prop-types';
import { isBrowser } from 'react-device-detect';

import { ReactComponent as Pause } from '../assets/pause.svg';
import { ReactComponent as Play } from '../assets/play.svg';

class PlayPauseButton extends React.Component {
  state = {
    initialLoad: true
  };

  handleOnClick = () => isBrowser && this.props.togglePlay();

  handleOnTouchEnd = () => !isBrowser && this.props.togglePlay();

  handleKeyDown = event => {
    /**
     * Toggle play when user presses Enter.
     * The Space keypress event is ignored to avoid collision with the GlobalHotKeys.
     */
    if (event.keyCode === 13) {
      this.handleOnClick();
    }
  };

  static getDerivedStateFromProps(nextProps, prevState) {
    // Set initial load to render the initial message accordingly
    if (prevState.initialLoad && nextProps.playing) {
      return { initialLoad: false };
    }
    return null;
  }

  render() {
    return (
      <button
        aria-label={this.props.playing ? 'Pause' : 'Play'}
        className={
          this.state.initialLoad
            ? 'play-container-cta play-container'
            : 'play-container'
        }
        id='playContainer'
        onClick={this.handleOnClick}
        onKeyDown={this.handleKeyDown}
        onTouchEnd={this.handleOnTouchEnd}
      >
        {this.props.playing ? <Pause /> : <Play />}
      </button>
    );
  }
}

PlayPauseButton.propTypes = {
  playing: PropTypes.bool,
  togglePlay: PropTypes.func
};

export default PlayPauseButton;
