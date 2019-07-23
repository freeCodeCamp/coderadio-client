class CodeRadio {
  constructor() {
    /***
     * General configuration options
     */
    this.config = {
      baseColour: "rgb(10, 10, 35)",
      translucent: "rgba(10, 10, 35, 0.6)",
      multiplier: 0.7529,
      metadataTimer: 2000
    };

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
    this.audioConfig = {
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
    this._url = "";
    this._player = new Audio();
    this._player.volume = this.audioConfig.maxVolume;
    this._player.crossOrigin = "anonymous";
    // Note: the crossOrigin is needed to fix a CORS JavaScript requirement

    /***
     * There are a few *private* variables used
     */
    this._currentSong = {};
    this._songStartedAt = 0;
    this._songDuration = 0;
    this._progressInterval = false;

    this.getNowPlaying();

    this.meta = {
      container: document.getElementById("nowPlaying"),
      picture: document.querySelector('[data-meta="picture"]'),
      title: document.querySelector('[data-meta="title"]'),
      artist: document.querySelector('[data-meta="artist"]'),
      album: document.querySelector('[data-meta="album"]'),
      duration: document.querySelector('[data-meta="duration"]'),
      listeners: document.querySelector('[data-meta="listeners"]')
    };

    this.setupEventListeners();
  }

  /***
   * If we ever change the URL, we need to update the player
   * and begin playing it again. This can happen if the server
   * resets the URL.
   */
  set url(url = false) {
    if (url && this._url === "") {
      this._url = url;
      this._player.src = url;
      this._player.play();
    }
  }

  get url() {
    return this._url;
  }

  /***
   * The song data is always checked with the ID of the current
   * one. If it is not the same, the data is then updated and
   * the metadata is updated.
   */
  set currentSong(songData = {}) {
    this._currentSong = songData;
    this.renderMetadata();
  }

  get currentSong() {
    return this._currentSong;
  }

  /***
   * In order to get the constant durations, we simply take the
   * duration for the max of the meter and set the played at to 0
   */
  set played_at(t = 0) {
    this._songStartedAt = t * 1000; // Time comes in a seconds so we multiply by 1000 to set millis
    this.meta.duration.value = 0;
  }

  get played_at() {
    return this._songStartedAt;
  }

  set duration(d = 0) {
    this._songDuration = d;
    this.meta.duration.max = this._songDuration;
  }

  get duration() {
    return this._songDuration;
  }

  getNowPlaying() {
    // To prevent browser based caching, we add the date to the request, it won't impact the response
    fetch(`/app/api/nowplaying?t=${new Date().valueOf()}`)
      .then(req => req.json())
      .then(np => {
        np = np[0]; // There is only ever 1 song "Now Playing" so let's simplify the response

        // We look through the available mounts to find the default mount (or just the listen_url)
        if (this.url === "")
          this.url = np.station.mounts.find(mount => !!mount.is_default).url;

        // We only need to update th metadata if the song has been changed
        if (
          !this.currentSong.id ||
          np.now_playing.song.id !== this.currentSong.id
        ) {
          this.currentSong = np.now_playing.song;
          this.played_at = np.now_playing.played_at;
          this.duration = np.now_playing.duration;
          this.meta.listeners.textContent = `coders listening right now: ${
            np.listeners.current
          }`;
          if (!this._progressInterval) {
            this._progressInterval = setInterval(
              () => this.updateProgress(),
              100
            );
          }
        }

        // Since the server doesn't have a socket connection (yet), we need to long poll it for the current song
        setTimeout(() => this.getNowPlaying(), this.config.metadataTimer);
      })
      .catch(err => {
        console.error(err);
        setTimeout(() => this.getNowPlaying(), this.config.metadataTimer * 3);
      });
  }

  /***
   * Yay, let's get some keyboard shortcuts in this tool
   */
  setupEventListeners() {
    document.addEventListener("keydown", evt => this.keyboardControl(evt));

    // In order to get around some mobile browser limitations, we can only generate a lot
    // of the audio context stuff AFTER the audio has been triggered. We can't see it until
    // then anyway so it makes no difference to desktop.
    this._player.addEventListener("play", () => {
      if (!this.eq.context) {
        this.initiateEQ();
        this.createVisualizer();
      }
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
        this.setTargetVolume(
          Math.min(this.audioConfig.maxVolume + this.audioConfig.volumeSteps, 1)
        );
        break;
      case "ArrowDown":
        this.setTargetVolume(
          Math.max(this.audioConfig.maxVolume - this.audioConfig.volumeSteps, 0)
        );
        break;
    }
  }

  initiateEQ() {
    // Create a new Audio Context element to read the samples from
    this.eq.context = new AudioContext();

    // Apply the audio element as the source where to pull all the data from
    this.eq.src = this.eq.context.createMediaElementSource(this._player);

    // Use some amazing trickery that allows javascript to analyse the current state
    this.eq.analyser = this.eq.context.createAnalyser();
    this.eq.src.connect(this.eq.analyser);
    this.eq.analyser.connect(this.eq.context.destination);
    this.eq.analyser.fftSize = 256;

    // Create a buffer array for the number of frequencies available (minus the high pitch useless ones that never really do anything anyway)
    this.eq.bands = new Uint8Array(this.eq.analyser.frequencyBinCount - 32);
    this.updateEQBands();
  }

  /***
   * The equalizer bands available need to be updated
   * constantly in order to ensure that the value for any
   * visualizer is up to date.
   */
  updateEQBands() {
    // Populate the buffer with the audio source’s current data
    this.eq.analyser.getByteFrequencyData(this.eq.bands);

    // Can’t stop, won’t stop
    requestAnimationFrame(() => this.updateEQBands());
  }

  /***
   * When starting the page, the visualizer dom is needed to be
   * created.
   */
  createVisualizer() {
    let container = document.createElement("canvas");
    document.getElementById("visualizer").appendChild(container);
    container.width = container.parentNode.offsetWidth;
    container.height = container.parentNode.offsetHeight;

    this.visualizer = {
      ctx: container.getContext("2d"),
      height: container.height,
      width: container.width,
      barWidth: container.width / this.eq.bands.length
    };

    this.drawVisualizer();
  }

  /***
   * As a base visualizer, the equalizer bands are drawn using
   * canvas in the window directly above the song into.
   */
  drawVisualizer() {
    if (this.eq.bands.reduce((a, b) => a + b, 0) !== 0)
      requestAnimationFrame(() => this.drawVisualizer());
    // Because timeupdate events are not triggered at browser speed, we use requestanimationframe for higher framerates
    else setTimeout(() => this.drawVisualizer(), 250); // If there is no music or audio in the song, then reduce the FPS

    let y,
      x = 0; // Intial bar x coordinate
    this.visualizer.ctx.clearRect(
      0,
      0,
      this.visualizer.width,
      this.visualizer.height
    ); // Clear the complete canvas
    this.visualizer.ctx.fillStyle = this.config.translucent; // Set the primary colour of the brand (probably moving to a higher object level variable soon)
    this.visualizer.ctx.beginPath(); // Start creating a canvas polygon
    this.visualizer.ctx.moveTo(x, 0); // Start at the bottom left
    this.eq.bands.forEach(band => {
      y = this.config.multiplier * band; // Get the overall hight associated to the current band and convert that into a Y position on the canvas
      this.visualizer.ctx.lineTo(x, y); // Draw a line from the current position to the wherever the Y position is
      this.visualizer.ctx.lineTo(x + this.visualizer.barWidth, y); // Continue that line to meet the width of the bars (canvas width ÷ bar count)
      x += this.visualizer.barWidth; // Add pixels to the x for the next bar
    });
    this.visualizer.ctx.lineTo(x, 0); // Bring the line back down to the bottom of the canvas
    this.visualizer.ctx.fill(); // Fill it
  }

  play() {
    if (this._player.paused) {
      this._player.volume = 0;
      this._player.play();
      this.fadeUp();
      return this;
    }
  }

  pause() {
    this._player.pause();
    return this;
  }

  /***
   * Very basic method that acts like the play/pause button
   * of a standard player. It loads in a new song if there
   * isn’t already one loaded.
   */
  togglePlay() {
    // If there already is a source, confirm it’s playing or not
    if (!!this._player.src) {
      // If the player is paused, set the volume to 0 and fade up
      if (this._player.paused) {
        this._player.volume = 0;
        this._player.play();
        this.fadeUp();

        // if it is already playing, fade the music out (resulting in a pause)
      } else this.fade();
    }

    return this;
  }

  setTargetVolume(v) {
    this.audioConfig.maxVolume = parseFloat(
      Math.max(0, Math.min(1, v).toFixed(1))
    );
    this._player.volume = this.audioConfig.maxVolume;
  }

  // Simple fade command to initiate the playing and pausing in a more fluid method
  fade(direction = "down") {
    this.audioConfig.targetVolume =
      direction.toLowerCase() === "up" ? this.audioConfig.maxVolume : 0;
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
    let currentVolume = parseFloat(this._player.volume.toFixed(1));

    // If the volume is correctly set to the target, no need to change it
    if (currentVolume === this.audioConfig.targetVolume) {
      // If the audio is set to 0 and it’s been met, pause the audio
      if (this.audioConfig.targetVolume === 0) this._player.pause();

      // Unmet audio volume settings require it to be changed
    } else {
      // We capture the value of the next increment by either the configuration or the difference between the current and target if it's smaller than the increment
      let volumeNextIncrement = Math.min(
        this.audioConfig.volumeSteps,
        Math.abs(this.audioConfig.targetVolume - this._player.volume)
      );

      // Adjust the audio based on if the target is higher or lower than the current
      this._player.volume +=
        this.audioConfig.targetVolume > this._player.volume
          ? volumeNextIncrement
          : -volumeNextIncrement;

      // The speed at which the audio lowers is also controlled.
      setTimeout(
        () => this.updateVolume(),
        this.audioConfig.volumeTransitionSpeed
      );
    }
  }

  renderMetadata() {
    if (!!this._currentSong.art) {
      this.meta.picture.style.backgroundImage = `url(${this._currentSong.art})`;
      this.meta.container.classList.add("thumb");
    } else {
      this.meta.container.classList.remove("thumb");
      this.meta.picture.style.backgroundImage = "";
    }
    this.meta.title.textContent = this._currentSong.title;
    this.meta.artist.textContent = this._currentSong.artist;
    this.meta.album.textContent = this._currentSong.album;
  }

  updateProgress() {
    this.meta.duration.value =
      (new Date().valueOf() - this._songStartedAt) / 1000;
  }
}
