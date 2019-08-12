import React from "react";
import PropTypes from "prop-types";

import { isBrowser } from "react-device-detect";

const DEFAULT_ART = "https://cdn-media-1.freecodecamp.org/code-radio/cover_placeholder.gif";
const PAUSE_IMAGE = "https://cdn-media-1.freecodecamp.org/code-radio/pause.svg";
const PLAY_IMAGE = "https://cdn-media-1.freecodecamp.org/code-radio/play.svg";

export default class Footer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      sliderVal: 5,
      initialLoad: true,
      durationVal: 0,
      currentSong: this.props.currentSong,
      progressInterval: null,
      alternativeMounts: null
    };
    this.updateProgress = this.updateProgress.bind(this);
  }
  componentWillReceiveProps(nextProps) {
    // set initial load to render the initial message accordingly
    if (this.state.initialLoad && nextProps.playing) {
      this.setState({ initialLoad: false });
    }

    // if the song is new and we have all required props, reset setInterval
    if (
      this.state.currentSong.id !== nextProps.currentSong.id &&
      nextProps.songStartedAt
    ) {
      this.setState({
        progressInterval: setInterval(this.updateProgress, 100),
        alternativeMounts: [].concat(nextProps.remotes, nextProps.mounts)
      });
    }

    // if the keyboards are changing the volume, adjust slider accordingly
    if (nextProps.currentVolume * 10 !== this.state.sliderVal) {
      this.setState({
        sliderVal: nextProps.currentVolume * 10
      });
    }
  }

  updateProgress() {
    this.setState({
      durationVal: (new Date().valueOf() - this.props.songStartedAt) / 1000
    });
  }

  handlePlay() {
    this.props.togglePlay();
  }

  handleChange(e) {
    let { value } = e.target;
    this.props.setUrl(value);
  }

  handleSliderChange(e) {
    let { value } = e.target;
    this.props.setTargetVolume(value / 10);
    this.setState({ sliderVal: e.target.value });
  }

  render() {
    let { alternativeMounts } = this.state;
    let mountOptions = "";

    if (alternativeMounts && this.props.url) {
      mountOptions = (
        <select
          data-meta="stream-select"
          defaultValue={this.props.url}
          onChange={this.handleChange.bind(this)}
        >
          {alternativeMounts.map((mount, index) => (
            <option key={index} value={mount.url}>
              {mount.name}
            </option>
          ))}
        </select>
      );
    }
    return (
      <footer>
        <div
          className={this.props.playing ? "thumb shown" : "thumb"}
          id="metaDisplay"
        >
          <img
            alt="album art"
            data-meta="picture"
            src={
              this.props.fastConnection
                ? this.props.currentSong.art
                : DEFAULT_ART
            }
          />
          <div id="nowPlaying">
            <progress
              data-meta="duration"
              max={this.props.songDuration}
              value={this.state.durationVal.toFixed(2)}
            />
            <div data-meta="title">{this.props.currentSong.title}</div>
            <div data-meta="artist">{this.props.currentSong.artist}</div>
            <div data-meta="album">{this.props.currentSong.album}</div>
            <div data-meta="listeners">Listeners: {this.props.listeners}</div>
            {mountOptions}
          </div>
        </div>
        <div
          className={this.state.initialLoad ? "cta" : ""}
          id="playContainer"
          onClick={isBrowser ? this.handlePlay.bind(this) : null}
          onTouchStart={!isBrowser ? this.handlePlay.bind(this) : null}
        >
          <img
            alt="Play Pause Button"
            id="playButton"
            src={this.props.playing ? PAUSE_IMAGE : PLAY_IMAGE}
          />
        </div>
        <div className="slider-container">
          <input
            id="slider"
            max="10"
            min="0"
            onChange={this.handleSliderChange.bind(this)}
            type="range"
            value={this.state.sliderVal}
          />
        </div>
      </footer>
    );
  }
}

Footer.propTypes = {
  currentSong: PropTypes.object,
  currentVolume: PropTypes.number,
  fastConnection: PropTypes.bool,
  listeners: PropTypes.number,
  mounts: PropTypes.array,
  player: PropTypes.object,
  playing: PropTypes.bool,
  remotes: PropTypes.array,
  setTargetVolume: PropTypes.func,
  setUrl: PropTypes.func,
  songDuration: PropTypes.number,
  songStartedAt: PropTypes.number,
  togglePlay: PropTypes.func,
  url: PropTypes.string
};
