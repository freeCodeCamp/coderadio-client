import React from 'react';
import NchanSubscriber from 'nchan';
import { GlobalHotKeys } from 'react-hotkeys';
import * as Sentry from '@sentry/react';
import store from 'store';
import { isIOS } from 'react-device-detect';

import Nav from './Nav';
import Main from './Main';
import Footer from './Footer';

import '../css/App.css';

const SUB = new NchanSubscriber(
  'wss://coderadio-admin.freecodecamp.org/api/live/nowplaying/coderadio'
);
const CODERADIO_VOLUME = 'coderadio-volume';

SUB.on('error', function(err, errDesc) {
  Sentry.addBreadcrumb({
    message: 'NchanSubscriber error: ' + errDesc
  });
  /**
   * I'm assuming captureException is appropriate here, I'm not sure what type
   * the first argument has.
   */
  Sentry.captureException(err);
});

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      // General configuration options
      config: {
        metadataTimer: 1000
      },
      fastConnection: navigator.connection
        ? navigator.connection.downlink > 1.5
        : false,

      /**
       * The equalizer data is held as a separate data set
       * to allow for easy implementation of visualizers.
       * With the ultimate goal of this allowing plug and
       * play visualizers.
       */
      eq: {},

      /**
       * Potentially removing the visualizer from this class
       * to build it as a stand alone element that can be
       * replaced by community submissions.
       */
      visualizer: {},

      /**
       * Some basic configuration for nicer audio transitions
       * (Used in earlier projects and just maintained).
       */
      audioConfig: {
        targetVolume: 0,
        maxVolume: 0.5,
        volumeSteps: 0.01,
        currentVolume: 0.5,
        volumeTransitionSpeed: 10
      },

      /**
       * This is where all the audio is pumped through. Due
       * to it being a single audio element, there should be
       * no memory leaks of extra floating audio elements.
       */
      url: '',
      mounts: [],
      remotes: [],
      playing: null,
      captions: null,
      pausing: null,
      pullMeta: false,
      erroredStreams: [],

      // Note: the crossOrigin is needed to fix a CORS JavaScript requirement

      // There are a few *private* variables used
      currentSong: {},
      songStartedAt: 0,
      songDuration: 0,
      listeners: 0,
      songHistory: []
    };

    // Keyboard shortcuts
    this.keyMap = {
      TOGGLE_PLAY: ['space', 'k'],
      INCREASE_VOLUME: 'up',
      DECREASE_VOLUME: 'down'
    };

    // Keyboard shortcut handlers
    this.handlers = {
      TOGGLE_PLAY: () => this.togglePlay(),
      INCREASE_VOLUME: () => this.increaseVolume(),
      DECREASE_VOLUME: () => this.decreaseVolume()
    };

    this.togglePlay = this.togglePlay.bind(this);
    this.setUrl = this.setUrl.bind(this);
    this.setTargetVolume = this.setTargetVolume.bind(this);
    this.getNowPlaying = this.getNowPlaying.bind(this);
    this.updateVolume = this.updateVolume.bind(this);
  }

  // Set the players initial vol and crossOrigin
  setPlayerInitial() {
    /**
     * Get user volume level from local storage
     * if not available set to default 0.5.
     */
    const maxVolume =
      store.get(CODERADIO_VOLUME) || this.state.audioConfig.maxVolume;
    this.setState(
      {
        audioConfig: {
          ...this.state.audioConfig,
          maxVolume,
          currentVolume: maxVolume
        }
      },
      () => {
        this._player.volume = maxVolume;
      }
    );
  }

  componentDidMount() {
    this.setPlayerInitial();
    this.getNowPlaying();
  }

  /**
   * If we ever change the URL, we need to update the player
   * and begin playing it again. This can happen if the server
   * resets the URL.
   */
  async setUrl(url = false) {
    if (!url) return;

    if (this.state.playing) await this.pause();

    this._player.src = url;
    this.setState({
      url
    });

    /**
     * Since the `playing` state is initially `null` when the app first loads
     * and is set to boolean when there is an user interaction,
     * we prevent the app from auto-playing the music
     * by only calling `this.play()` if the `playing` state is not `null`.
     */
    if (this.state.playing !== null) {
      this.play();
    }
  }

  play() {
    const { mounts, remotes, playing } = this.state;
    if (!playing) {
      if (!SUB.running) {
        SUB.start();
      }

      let streamUrls = Array.from(
        [...mounts, ...remotes],
        stream => stream.url
      );

      // Check if the url has been reset by pause
      if (!streamUrls.includes(this._player.src)) {
        this._player.src = this.state.url;
        this._player.load();
      }
      this._player.volume = 0;
      this._player.play().then(() => {
        this.setState(state => {
          return {
            audioConfig: { ...state.audioConfig, currentVolume: 0 },
            playing: true,
            pullMeta: true
          };
        });

        this.fadeUp();
      });
    }
  }

  pause() {
    // Completely stop the audio element
    if (!this.state.playing) return Promise.resolve();

    return new Promise(resolve => {
      this._player.pause();
      this._player.load();

      this.setState(
        {
          playing: false,
          pausing: false
        },
        () => {
          SUB.stop();
          resolve();
        }
      );
    });
  }

  /**
   * Very basic method that acts like the play/pause button
   * of a standard player. It loads in a new song if there
   * isn't already one loaded.
   */
  togglePlay() {
    // If there already is a source, confirm it's playing or not
    if (this._player.src) {
      // If the player is paused, set the volume to 0 and fade up
      if (!this.state.playing) {
        this.play();
      }
      // If it is already playing, fade the music out (resulting in a pause)
      else {
        this.fadeDown();
      }
    }
  }

  setTargetVolume(volume) {
    let audioConfig = { ...this.state.audioConfig };
    let maxVolume = parseFloat(Math.max(0, Math.min(1, volume).toFixed(2)));
    audioConfig.maxVolume = maxVolume;
    audioConfig.currentVolume = maxVolume;
    this._player.volume = audioConfig.maxVolume;
    this.setState(
      {
        audioConfig
      },
      () => {
        // Save user volume to local storage
        store.set(CODERADIO_VOLUME, maxVolume);
      }
    );
  }

  /**
   * Simple fade command to initiate the playing and pausing
   * in a more fluid method.
   */
  fade(direction) {
    let audioConfig = { ...this.state.audioConfig };
    audioConfig.targetVolume =
      direction.toLowerCase() === 'up' ? this.state.audioConfig.maxVolume : 0;
    this.setState(
      {
        audioConfig,
        pausing: direction === 'down'
      },
      this.updateVolume
    );
  }

  fadeUp() {
    this.fade('up');
  }

  fadeDown() {
    this.fade('down');
  }

  /**
   * In order to have nice fading,
   * this method adjusts the volume dynamically over time.
   */
  updateVolume() {
    /**
     * In order to fix floating math issues,
     * we set the toFixed in order to avoid 0.999999999999 increments.
     */
    let currentVolume = parseFloat(this._player.volume.toFixed(2));
    /**
     * If the volume is correctly set to the target, no need to change it
     *
     * Note: On iOS devices, volume level is totally under user's control and cannot be programmatically set.
     * We pause the music immediately in this case.
     * (https://developer.apple.com/library/archive/documentation/AudioVideo/Conceptual/Using_HTML5_Audio_Video/Device-SpecificConsiderations/Device-SpecificConsiderations.html)
     */
    if (currentVolume === this.state.audioConfig.targetVolume || isIOS) {
      // If the audio is set to 0 and it’s been met, pause the audio
      if (this.state.audioConfig.targetVolume === 0 && this.state.pausing)
        this.pause();

      // Unmet audio volume settings require it to be changed
    } else {
      /**
       * We capture the value of the next increment by either the configuration
       * or the difference between the current and target
       * if it's smaller than the increment.
       */
      let volumeNextIncrement = Math.min(
        this.state.audioConfig.volumeSteps,
        Math.abs(this.state.audioConfig.targetVolume - this._player.volume)
      );

      /**
       * Adjust the audio based on if the target is
       * higher or lower than the current.
       */
      let volumeAdjust =
        this.state.audioConfig.targetVolume > this._player.volume
          ? volumeNextIncrement
          : -volumeNextIncrement;

      this._player.volume += volumeAdjust;

      let audioConfig = this.state.audioConfig;
      audioConfig.currentVolume += volumeAdjust;

      this.setState({
        audioConfig
      });
      // The speed at which the audio lowers is also controlled.
      setTimeout(
        this.updateVolume,
        this.state.audioConfig.volumeTransitionSpeed
      );
    }
  }

  sortStreams = (streams, lowBitrate = false, shuffle = false) => {
    if (shuffle) {
      /**
       * Shuffling should only happen among streams with similar bitrates
       * since each relay displays listener numbers across relays. Shuffling
       * should be used to spread the load on initial stream selection.
       */
      let bitrates = streams.map(stream => stream.bitrate);
      let maxBitrate = Math.max(...bitrates);
      return streams
        .filter(stream => {
          if (!lowBitrate) return stream.bitrate === maxBitrate;
          else return stream.bitrate !== maxBitrate;
        })
        .sort(() => Math.random() - 0.5);
    } else {
      return streams.sort((a, b) => {
        if (lowBitrate) {
          // Sort by bitrate from low to high
          if (parseFloat(a.bitrate) < parseFloat(b.bitrate)) return -1;
          if (parseFloat(a.bitrate) > parseFloat(b.bitrate)) return 1;
        } else {
          // Sort by bitrate, from high to low
          if (parseFloat(a.bitrate) < parseFloat(b.bitrate)) return 1;
          if (parseFloat(a.bitrate) > parseFloat(b.bitrate)) return -1;
        }

        // If both items have the same bitrate, sort by listeners from low to high
        if (a.listeners.current < b.listeners.current) return -1;
        if (a.listeners.current > b.listeners.current) return 1;
        return 0;
      });
    }
  };

  getStreamUrl = (streams, lowBitrate) => {
    const sorted = this.sortStreams(streams, lowBitrate, true);
    return sorted[0].url;
  };

  // Choose the stream based on the connection and availability of relay(remotes)
  setMountToConnection(mounts = [], remotes = []) {
    let url = null;
    if (this.state.fastConnection === false && remotes.length > 0) {
      url = this.getStreamUrl(remotes, true);
    } else if (this.state.fastConnection && remotes.length > 0) {
      url = this.getStreamUrl(remotes);
    } else if (this.state.fastConnection === false) {
      url = this.getStreamUrl(mounts, true);
    } else {
      url = this.getStreamUrl(mounts);
    }
    this._player.src = url;
    this.setState({
      url
    });
  }

  getNowPlaying() {
    SUB.on('message', message => {
      let np = JSON.parse(message);

      // We look through the available mounts to find the default mount
      if (this.state.url === '') {
        this.setState({
          mounts: np.station.mounts,
          remotes: np.station.remotes
        });
        this.setMountToConnection(np.station.mounts, np.station.remotes);
      }

      if (this.state.listeners !== np.listeners.current) {
        this.setState({
          listeners: np.listeners.current
        });
      }

      // We only need to update the metadata if the song has been changed
      if (
        np.now_playing.song.id !== this.state.currentSong.id ||
        this.state.pullMeta
      ) {
        this.setState({
          currentSong: np.now_playing.song,
          songStartedAt: np.now_playing.played_at * 1000,
          songDuration: np.now_playing.duration,
          pullMeta: false,
          songHistory: np.song_history
        });
      }
    });
    SUB.reconnectTimeout = this.state.config.metadataTimer;
    SUB.start();
  }

  increaseVolume = () =>
    this.setTargetVolume(
      Math.min(
        this.state.audioConfig.maxVolume + this.state.audioConfig.volumeSteps,
        1
      )
    );

  decreaseVolume = () =>
    this.setTargetVolume(
      Math.max(
        this.state.audioConfig.maxVolume - this.state.audioConfig.volumeSteps,
        0
      )
    );

  onPlayerError = async () => {
    /**
     * This error handler works as follows:
     * - When the player cannot play the url:
     *   - If the player's src is falsy and the `playing` state is being false,
     *     return early. (It means the user has paused the player and
     *     the src has been reset to an empty string).
     *   - If the url is already in the `erroredStreams` list: Try another url.
     *   - If the url is not in `erroredStreams`: Add the url to the list and
     *     try another url.
     *   - If `erroredStreams` has as many items as the list of available streams:
     *     Pause the player because this means all of our urls are having issues.
     */
    if (!this.state.playing && !this._player.src) return;

    const { mounts, remotes, erroredStreams, url } = this.state;
    const sortedStreams = this.sortStreams([...remotes, ...mounts]);
    const currentStream = sortedStreams.find(stream => stream.url === url);
    const isStreamInErroredList = erroredStreams.some(
      stream => stream.url === url
    );
    const newErroredStreams = isStreamInErroredList
      ? erroredStreams
      : [...erroredStreams, currentStream];

    // Pause if all streams are in the errored list
    if (newErroredStreams.length === sortedStreams.length) {
      await this.pause();
      return;
    }

    /**
     * Available streams are those in `sortedStreams`
     * that don't exist in the errored list.
     */
    const availableUrls = sortedStreams
      .filter(
        stream =>
          !newErroredStreams.some(
            erroredStream => erroredStream.url === stream.url
          )
      )
      .map(({ url }) => url);

    // If the url is already in the errored list, use another url
    if (isStreamInErroredList) {
      this.setUrl(availableUrls[0]);
    } else {
      // Otherwise, add the url to the errored list, then use another url
      this.setState({ erroredStreams: newErroredStreams }, () =>
        this.setUrl(availableUrls[0])
      );
    }
  };

  render() {
    return (
      <GlobalHotKeys handlers={this.handlers} keyMap={this.keyMap}>
        <div className='App'>
          <Nav />
          <Main
            fastConnection={this.state.fastConnection}
            player={this._player}
            playing={this.state.playing}
          />
          <audio
            aria-label='audio'
            crossOrigin='anonymous'
            onError={this.onPlayerError}
            ref={a => (this._player = a)}
          >
            <track kind='captions' {...this.state.captions} />
          </audio>
          <Footer
            currentSong={this.state.currentSong}
            currentVolume={this.state.audioConfig.currentVolume}
            fastConnection={this.state.fastConnection}
            listeners={this.state.listeners}
            mounts={this.state.mounts}
            playing={this.state.playing}
            remotes={this.state.remotes}
            setTargetVolume={this.setTargetVolume}
            setUrl={this.setUrl}
            songDuration={this.state.songDuration}
            songHistory={this.state.songHistory}
            songStartedAt={this.state.songStartedAt}
            togglePlay={this.togglePlay}
            url={this.state.url}
          />
        </div>
      </GlobalHotKeys>
    );
  }
}
