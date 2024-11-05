import React, { ReactNode } from 'react';
import PageVisibility from 'react-page-visibility';
import CurrentSong from './CurrentSong';
import Slider from './Slider';
import PlayPauseButton from './PlayPauseButton';
import SongHistory from './SongHistory';


interface Remote {
  url: string;
}


interface FooterProps {
  currentSong: SongDetails;
  currentVolume: number;
  fastConnection: boolean;
  listeners: number;
  mounts: Remote[];
  playing: boolean;
  remotes: Remote[];
  setTargetVolume: any;
  setUrl: (arg0: any) => void;
  songDuration: number;
  songHistory: SongEntry[];
  songStartedAt: number;
  togglePlay: any;
  url: string;
}

interface FooterState {
  progressVal: number;
  currentSong: SongDetails;
  progressInterval: any;
  alternativeMounts: any;
  isTabVisible: boolean;
}

export default class Footer extends React.PureComponent<FooterProps, FooterState> {
  constructor(props: FooterProps) {
    super(props);
    this.state = {
      progressVal: 0,
      currentSong: {
        art: undefined,
        title: '',
        artist: '',
        album: '',
        id: ""
      },
      progressInterval: null,
      alternativeMounts: null,
      isTabVisible: true
    };
    this.updateProgress = this.updateProgress.bind(this);
  }

  componentDidUpdate(prevProps: FooterProps)
  {
    /**
     * If the song is new and we have all required props,
     * reset setInterval and currentSong.
     */
    if (
      this.state.currentSong.id !== prevProps.currentSong.id &&
      this.props.songStartedAt &&
      this.props.playing
    ) {
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({
        currentSong: this.props.currentSong,
        alternativeMounts: Array<Remote>().concat(this.props.remotes, this.props.mounts)
      });
      this.toggleInterval();
    } else if (prevProps.playing !== this.props.playing) {
      this.toggleInterval();
    }
  }

  componentWillUnmount() {
    this.stopCurrentInterval();
  }

  startInterval() {
    this.stopCurrentInterval();
    this.setState({
      progressInterval: setInterval(this.updateProgress, 100)
    });
  }

  stopCurrentInterval() {
    if (this.state.progressInterval) {
      clearInterval(this.state.progressInterval);
    }
  }

  toggleInterval() {
    if (this.props.playing && this.state.isTabVisible) this.startInterval();
    else this.stopCurrentInterval();
  }

  updateProgress() {
    let progressVal = parseInt(
      ((new Date().valueOf() - this.props.songStartedAt) / 1000).toFixed(2),
      10
    );
    this.setState({ progressVal });
  }

  handleChange(event: { target: { value: any } }) {
    let { value } = event.target;
    this.props.setUrl(value);
  }

  handleVisibilityChange = (isTabVisible: any) => {
    this.setState({ isTabVisible }, () => {
      this.toggleInterval();
    });
  };

  getMountOptions() {
    let mountOptions: ReactNode;
    let { alternativeMounts } = this.state;
    if (alternativeMounts && this.props.url) {
      mountOptions = (
        <select
          aria-label='Select Stream'
          data-meta='stream-select'
          id='stream-select'
          onChange={this.handleChange.bind(this)}
          value={this.props.url}
        >
          {alternativeMounts.map(
            (
              mount: {
                url: string | number | readonly string[] | undefined;
                name:
                  | string
                  | number
                  | boolean
                  | React.ReactElement<
                      any,
                      string | React.JSXElementConstructor<any>
                    >
                  | Iterable<React.ReactNode>
                  | React.ReactPortal
                  | null
                  | undefined;
              },
              index: React.Key | null | undefined
            ) => (
              <option key={index} value={mount.url}>
                {mount.name}
              </option>
            )
          )}
        </select>
      );
    }
    return mountOptions;
  }

  render() {
    let { progressVal, currentSong, isTabVisible } = this.state;
    let {
      playing,
      songDuration,
      togglePlay,
      currentVolume,
      setTargetVolume,
      listeners,
      fastConnection,
      url
    } = this.props;

    return (
      <PageVisibility onChange={this.handleVisibilityChange}>
        <footer>
          {isTabVisible && (
            <SongHistory
              songHistory={this.props.songHistory}
              fastConnection={fastConnection}
            />
          )}
          <CurrentSong
            currentSong={currentSong}
            progressVal={progressVal}
            fastConnection={fastConnection}
            listeners={listeners}
            mountOptions={this.getMountOptions()}
            playing={playing}
            songDuration={songDuration}
          />
          <PlayPauseButton
            playing={playing}
            togglePlay={togglePlay}
            url={url}
          />
          <Slider
            currentVolume={currentVolume}
            setTargetVolume={setTargetVolume}
          />
        </footer>
      </PageVisibility>
    );
  }
}
