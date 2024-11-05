import React from 'react';
import { isBrowser } from 'react-device-detect';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleNotch } from '@fortawesome/free-solid-svg-icons';

import Pause from '../assets/icons/pause';
import Play from '../assets/icons/play';

interface PlayButtonProps {
  playing: boolean;
  togglePlay: () => any;
  url: string;
}

interface PlayButtonState
{
  initialLoad: boolean; 
}


class PlayPauseButton extends React.Component<
  PlayButtonProps,
  PlayButtonState
> {
  state = {
    initialLoad: true
  };

  handleOnClick = () => isBrowser && this.props.togglePlay();

  handleOnTouchEnd = () => !isBrowser && this.props.togglePlay();

  static getDerivedStateFromProps(
    nextProps: PlayButtonProps,
    prevState: { initialLoad: any }
  ) {
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

export default PlayPauseButton;
