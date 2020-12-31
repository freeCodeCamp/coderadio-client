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

  handleKeyDown = e => {
    // Toggle play when user presses Enter
    // The Space keypress event is ignored to avoid collision with the GlobalHotKeys
    if (e.keyCode === 13) {
      this.handleOnClick();
    }
  };

  static getDerivedStateFromProps(nextProps, prevState) {
    // set initial load to render the initial message accordingly
    if (prevState.initialLoad && nextProps.playing) {
      return { initialLoad: false };
    }
    return null;
  }

  render() {
    return (
      <div
        aria-label={this.props.playing ? 'Pause' : 'Play'}
        className={this.state.initialLoad ? 'cta' : ''}
        id='playContainer'
        onClick={this.handleOnClick}
        onKeyDown={this.handleKeyDown}
        onTouchEnd={this.handleOnTouchEnd}
        role='button'
        tabIndex={0}
      >
        {this.props.playing ? <Pause /> : <Play />}
      </div>
    );
  }
}

PlayPauseButton.propTypes = {
  playing: PropTypes.bool,
  togglePlay: PropTypes.func
};

export default PlayPauseButton;
