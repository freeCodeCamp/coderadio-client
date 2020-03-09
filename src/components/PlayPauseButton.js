import React from "react";
import PropTypes from "prop-types";
import { isBrowser } from "react-device-detect";

import { ReactComponent as Pause } from "../assets/pause.svg";
import { ReactComponent as Play } from "../assets/play.svg";

class PlayPauseButton extends React.Component {
  state = {
    initialLoad: true
  };

  handleOnClick = () => isBrowser && this.props.togglePlay();

  handleOnTouchStart = () => !isBrowser && this.props.togglePlay();

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
        className={this.state.initialLoad ? "cta" : ""}
        id="playContainer"
        onClick={this.handleOnClick}
        onTouchStart={this.handleOnTouchStart}
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
