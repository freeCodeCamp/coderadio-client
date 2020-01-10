/* eslint-disable react/jsx-sort-props */
import React from 'react';
import PropTypes from 'prop-types';
import PageVisibility from 'react-page-visibility';
import CurrentSong from './CurrentSong';
import Slider from './Slider';
import PlayPauseButton from './PlayPauseButton';
import SongHistory from './SongHistory';

export default class Footer extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      progressVal: 0,
      currentSong: {},
      progressInterval: null,
      alternativeMounts: null,
      isTabVisible: true
    };
    this.updateProgress = this.updateProgress.bind(this);
  }

  componentDidUpdate(prevProps) {
    // if the song is new and we have all required props,
    // reset setInterval and currentSong
    if (
      this.state.currentSong.id !== prevProps.currentSong.id &&
      this.props.songStartedAt &&
      this.props.playing
    ) {
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({
        currentSong: this.props.currentSong,
        alternativeMounts: [].concat(this.props.remotes, this.props.mounts)
      });
      this.toggleIntterval();
    } else if (prevProps.playing !== this.props.playing) {
      this.toggleIntterval();
    }
  }

  startInterval() {
    this.stopCurrenttInterval();
    this.setState({
      progressInterval: setInterval(this.updateProgress, 100)
    });
  }

  stopCurrenttInterval() {
    if (this.state.progressInterval) {
      clearInterval(this.state.progressInterval);
    }
  }

  toggleIntterval() {
    if (this.props.playing && this.state.isTabVisible) this.startInterval();
    else this.stopCurrenttInterval();
  }

  updateProgress() {
    let progressVal = parseInt(
      ((new Date().valueOf() - this.props.songStartedAt) / 1000).toFixed(2),
      10
    );
    this.setState({ progressVal });
  }

  handleChange(e) {
    let { value } = e.target;
    this.props.setUrl(value);
  }

  handleVisibilityChange = isTabVisible => {
    this.setState({ isTabVisible }, () => {
      this.toggleIntterval();
    });
  };

  getMountOptions() {
    let mountOptions = '';
    let { alternativeMounts } = this.state;
    if (alternativeMounts && this.props.url) {
      mountOptions = (
        <select
          data-meta='stream-select'
          onChange={this.handleChange.bind(this)}
          value={this.props.url}
        >
          {alternativeMounts.map((mount, index) => (
            <option key={index} value={mount.url}>
              {mount.name}
            </option>
          ))}
        </select>
      );
    }
    return mountOptions;
  }

  render() {
    let { progressVal, currentSong } = this.state;
    let {
      playing,
      songDuration,
      togglePlay,
      currentVolume,
      setTargetVolume,
      listeners,
      fastConnection
    } = this.props;

    return (
      <PageVisibility onChange={this.handleVisibilityChange}>
        <footer>
          <SongHistory songHistory={this.props.songHistory} />
          <CurrentSong
            currentSong={currentSong}
            progressVal={progressVal}
            fastConnection={fastConnection}
            listeners={listeners}
            mountOptions={this.getMountOptions()}
            playing={playing}
            songDuration={songDuration}
          />
          <PlayPauseButton playing={playing} togglePlay={togglePlay} />
          <Slider
            currentVolume={currentVolume}
            setTargetVolume={setTargetVolume}
          />
        </footer>
      </PageVisibility>
    );
  }
}

Footer.propTypes = {
  currentSong: PropTypes.object,
  currentVolume: PropTypes.number,
  fastConnection: PropTypes.bool,
  listeners: PropTypes.number,
  mounts: PropTypes.array,
  playing: PropTypes.bool,
  remotes: PropTypes.array,
  setTargetVolume: PropTypes.func,
  setUrl: PropTypes.func,
  songDuration: PropTypes.number,
  songHistory: PropTypes.any,
  songStartedAt: PropTypes.number,
  togglePlay: PropTypes.func,
  url: PropTypes.string
};
