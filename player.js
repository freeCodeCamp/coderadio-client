const _events = Symbol('events'),
  _url = Symbol('url'),
  _player = Symbol('player'),
  _alternateMounts = Symbol('alternateMounts'),
  _currentSong = Symbol('currentSong'),
  _songStartedAt = Symbol('songStartedAt'),
  _songDuration = Symbol('songDuration'),
  _progressInterval = Symbol('progressInterval'),
  _listeners = Symbol('listeners'),
  _audioConfig = Symbol('audioConfig'),
  _fastConnection = Symbol('fastConnection');

export class CodeRadio {

  constructor() {
    /***
     * General configuration options
     */
    this.config = {
      metadataTimer: 2000
    };

    this[_fastConnection] = (!!navigator.connection) ? (navigator.connection.downlink > 1.5) : false;

    /***
     * The equalizer data is held as a seperate data set
     * to allow for easy implementation of visualizers.
     * With the ultimate goal of this allowing plug and
     * play visualizers.
     */
    this.eq = {};

    /***
     * Potentially removing the visualizer from this class
     * to build it as a stand alone element that can be
     * replaced by community submissions
     */
    this.visualizer = {};

    // Some basic configuration for nicer audio transitions
    // (Used in earlier projects and just maintained)
    this[_audioConfig] = {
      targetVolume: 0,
      maxVolume: 0.5,
      volumeSteps: 0.1,
      volumeTransitionSpeed: 100
    };

    /***
     * This is where all the audio is pumped through. Due
     * to it being a single audio element, there should be
     * no memory leaks of extra floating audio elements.
     */
    this[_url] = "";
    this[_alternateMounts] = [];
    this[_player] = new Audio();
    this[_player].volume = this[_audioConfig].maxVolume;
    this[_player].crossOrigin = "anonymous";
    // Note: the crossOrigin is needed to fix a CORS JavaScript requirement

    /***
     * There are a few *private* variables used
     */
    this[_currentSong] = {};
    this[_songStartedAt] = 0;
    this[_songDuration] = 0;
    this[_progressInterval] = false;
    this[_listeners] = 0;

    this.getNowPlaying();

    document.addEventListener("keydown", evt => this.keyboardControl(evt));
  }

  /***
   * If we ever change the URL, we need to update the player
   * and begin playing it again. This can happen if the server
   * resets the URL.
   */
  set url(url = false) {
    if (url) {
      let playing = this.playing;
      if (playing) this.pause();
      this[_url] = url;
      this[_player].src = url;
      if (playing) this.play();
    }
  }

  get url() {
    return this[_url];
  }

  get player() {
    return this[_player];
  }

  set player(v) {
    throw new Error('You cannot set the value of a readonly attribute');
  }

  set mounts(mounts) {
    throw new Error('You cannot set the value of a readonly attribute');
  }

  set mount(mount) {
    this.url = mount;
  }

  get mounts() {
    return this[_alternateMounts];
  }

  /***
   * The song data is always checked with the ID of the current
   * one. If it is not the same, the data is then updated and
   * the metadata is updated.
   */
  set currentSong(songData = {}) {
    throw new Error('You cannot set the value of a readonly attribute');
  }

  get currentSong() {
    return this[_currentSong];
  }

  /***
   * In order to get the constant durations, we simply take the
   * duration for the max of the meter and set the played at to 0
   */
  set playedAt(t = 0) {
    throw new Error('You cannot set the value of a readonly attribute');
  }

  get playedAt() {
    return this[_songStartedAt];
  }

  set duration(d = 0) {
    throw new Error('You cannot set the value of a readonly attribute');
  }

  get duration() {
    return this[_songDuration];
  }

  set listeners(v = 0) {
    throw new Error('You cannot set the value of a readonly attribute');
  }

  get listeners() {
    return this[_listeners];
  }

  get playing() {
    return !this[_player].paused;
  }

  get paused() {
    return this[_player].paused;
  }

  setMountToConnection() {
    this[_fastConnection] = (!!navigator.connection) ? (navigator.connection.downlink > 1.5) : false;
    if (this[_fastConnection]) {
      this.url = this.mounts.find(mount => !!mount.is_default).url;
    } else {
      this.url = this.mounts.find(mount => mount.bitrate < this.mounts.find(m => !!m.is_default).bitrate).url || this.mounts.find(mount => !!mount.is_default).url;
    }
  }

  getNowPlaying() {
    // To prevent browser based caching, we add the date to the request, it won't impact the response
    fetch(`/app/api/nowplaying?t=${new Date().valueOf()}`)
      .then(req => req.json())
      .then(np => {
        np = np[0]; // There is only ever 1 song "Now Playing" so let's simplify the response

        // We look through the available mounts to find the default mount (or just the listen_url)
        if (this.url === "") {
          this[_alternateMounts] = np.station.mounts;
          this.setMountToConnection();
        }

        // We only need to update th metadata if the song has been changed
        if (np.now_playing.song.id !== this.currentSong.id) {
          this[_currentSong] = np.now_playing.song;
          this[_songStartedAt] = np.now_playing.played_at * 1000;
          this[_songDuration] = np.now_playing.duration;
          if (this[_listeners] !== np.listeners.current) {
            this[_listeners] = np.listeners.current;
            this.emit('listeners', this[_listeners]);
          }
          this.emit('newSong', this[_currentSong]);
        }

        // Since the server doesn't have a socket connection (yet), we need to long poll it for the current song
        setTimeout(() => this.getNowPlaying(), this.config.metadataTimer);
      })
      .catch(err => {
        console.error(err);
        setTimeout(() => this.getNowPlaying(), this.config.metadataTimer * 3);
      });
  }

  keyboardControl(evt = {}) {
    // Quick note: if you're wanting to do similar in your projects, keyCode use to be the
    // standard however it is being depricated for the key attribute
    switch (evt.key) {
      case " ":
      case "k":
        this.togglePlay();
        break;
      case "ArrowUp":
        this.setTargetVolume(Math.min(this[_audioConfig].maxVolume + this[_audioConfig].volumeSteps, 1));
        break;
      case "ArrowDown":
        this.setTargetVolume(Math.max(this[_audioConfig].maxVolume - this[_audioConfig].volumeSteps, 0));
        break;
    }
  }

  play() {
    if (this[_player].paused) {
      this[_player].volume = 0;
      this[_player].play();
      this.emit('play');
      this.fadeUp();
      return this;
    }
  }

  pause() {
    this[_player].pause();
    this.emit('pause');
    return this;
  }

  /***
   * Very basic method that acts like the play/pause button
   * of a standard player. It loads in a new song if there
   * isn’t already one loaded.
   */
  togglePlay() {
    // If there already is a source, confirm it’s playing or not
    if (!!this[_player].src) {
      // If the player is paused, set the volume to 0 and fade up
      if (this[_player].paused) this.play();
        // if it is already playing, fade the music out (resulting in a pause)
      else this.fade();
    }

    return this;
  }

  setTargetVolume(v) {
    this[_audioConfig].maxVolume = parseFloat(Math.max(0, Math.min(1, v).toFixed(1)));
    this[_player].volume = this[_audioConfig].maxVolume;
    this.emit('volumeChange', this[_player].volume);
  }

  // Simple fade command to initiate the playing and pausing in a more fluid method
  fade(direction = "down") {
    this[_audioConfig].targetVolume = direction.toLowerCase() === "up" ? this[_audioConfig].maxVolume : 0;
    this.updateVolume();
    return this;
  }

  // Helper methods to simplify things
  fadeDown() {
    return this.fade("down");
  }
  fadeUp() {
    return this.fade("up");
  }

  // In order to have nice fading, this method adjusts the volume dynamically over time.
  updateVolume() {
    // In order to fix floating math issues, we set the toFixed in order to avoid 0.999999999999 increments
    let currentVolume = parseFloat(this[_player].volume.toFixed(1));

    // If the volume is correctly set to the target, no need to change it
    if (currentVolume === this[_audioConfig].targetVolume) {
      // If the audio is set to 0 and it’s been met, pause the audio
      if (this[_audioConfig].targetVolume === 0) this.pause();

      // Unmet audio volume settings require it to be changed
    } else {
      // We capture the value of the next increment by either the configuration or the difference between the current and target if it's smaller than the increment
      let volumeNextIncrement = Math.min(this[_audioConfig].volumeSteps, Math.abs(this[_audioConfig].targetVolume - this[_player].volume));

      // Adjust the audio based on if the target is higher or lower than the current
      this[_player].volume +=
        this[_audioConfig].targetVolume > this[_player].volume
          ? volumeNextIncrement
          : -volumeNextIncrement;
      
      this.emit('volumeChange', this[_player].volume);

      // The speed at which the audio lowers is also controlled.
      setTimeout(() => this.updateVolume(), this[_audioConfig].volumeTransitionSpeed);
    }
  }
    
  on(trigger, fn, once = false) {
    if (typeof fn != 'function') throw new Error(`Invalid Listener: ${trigger}. Must be a function`);
    if (!this[_events]) this[_events] = {};
    if (!this[_events][trigger]) this[_events][trigger] = new Array();
    this[_events][trigger].push({
      listener: fn,
      once: !!once
    });
  }

  once(trigger, fn) { 
    this.on(trigger, fn, true);
  }

  off(trigger, fn) {
    if (!this[_events] || !this[_events][trigger]) return;
    this[_events][trigger] = this[_events][trigger].map(evt => (evt !== fn));
  }

  emit(trigger, data) {
      return new Promise((resolve, reject) => {
        if (!this[_events] || !this[_events][trigger]) return;
        this[_events][trigger].forEach((evt, i) => {
          evt.listener(data);
          if (evt.once) this[_events][trigger].splice(i, 1);
        });
        resolve();
      });
  }
}
