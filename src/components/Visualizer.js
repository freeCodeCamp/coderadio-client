import React from 'react';
import PropTypes from 'prop-types';
import PageVisibility from 'react-page-visibility';

const DELAY = 500;

export default class Visualizer extends React.PureComponent {
  rafId = null;
  timerId = null;

  constructor(props) {
    super(props);
    this.state = {
      eq: {},
      config: {
        baseColour: 'rgb(10, 10, 35)',
        translucent: 'rgba(10, 10, 35, 0.6)',
        multiplier: 0.7529
      },
      isTabVisible: true
    };
  }

  /**
   * In order to get around some mobile browser limitations,
   * we can only generate a lot of the audio context stuff AFTER
   * the audio has been triggered.
   * We can't see it until then anyway so it makes no difference to desktop.
   */
  componentDidUpdate(prevProps, prevState) {
    if (
      prevProps.playing === this.props.playing &&
      prevState.isTabVisible === this.state.isTabVisible
    ) {
      return;
    }

    /**
     * If the player is playing and the tab is being active,
     * draw the visualization.
     */
    if (this.props.playing && this.state.isTabVisible) {
      // Create a new audio context if there isn't one available
      if (!this.state.eq.context) {
        this.initiateEQ();
      }
      this.createVisualizer();
      this.startDrawing();
    } else {
      /**
       * If the player is not playing or the tab is running in the background,
       * stop the animation.
       */

      /**
       * Workaround for componentWillUnmount to delay the clean up and
       * achieve fadeout animation.
       */
      setTimeout(() => {
        // Note: Order matters.
        // Stop the drawing loop first (using this.rafId), then set the ID to null
        this.stopDrawing();
        this.reset();
      }, DELAY);
    }
  }

  initiateEQ() {
    let eq = this.state.eq;
    // Safari requires a webkit prefix to support AudioContext
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    // Create a new Audio Context element to read the samples from
    eq.context = new AudioContext();
    // Apply the audio element as the source where to pull all the data from
    eq.src = eq.context.createMediaElementSource(this.props.player);

    /**
     * Use some amazing trickery that allows javascript to
     * analyse the current state.
     */
    eq.analyser = eq.context.createAnalyser();
    eq.src.connect(eq.analyser);
    eq.analyser.connect(eq.context.destination);
    eq.analyser.fftSize = 256;

    /**
     * Create a buffer array for the number of frequencies available
     * (minus the high pitch useless ones that never really do anything anyway).
     */
    eq.bands = new Uint8Array(eq.analyser.frequencyBinCount - 32);

    this.setState({ eq });
  }

  reset = () => {
    this.rafId = null;
  };

  /**
   * The equalizer bands available need to be updated
   * constantly in order to ensure that the value for any
   * visualizer is up to date.
   */
  updateEQBands() {
    const newEQ = this.state.eq;
    // Populate the buffer with the audio source's current data
    newEQ.analyser.getByteFrequencyData(newEQ.bands);

    this.setState({ eq: { ...newEQ } });
  }

  /**
   * When starting the page, the visualizer dom is needed to be
   * created.
   */
  createVisualizer() {
    this._canvas.width = this._canvas.parentNode.offsetWidth;
    this._canvas.height = this._canvas.parentNode.offsetHeight;

    this.visualizer = {
      ctx: this._canvas.getContext('2d'),
      height: this._canvas.height,
      width: this._canvas.width,
      barWidth: this._canvas.width / this.state.eq.bands.length
    };
  }

  startDrawing = () => {
    if (!this.rafId) {
      this.rafId = window.requestAnimationFrame(this.drawingLoop);
    }
  };

  stopDrawing = () => {
    window.cancelAnimationFrame(this.rafId);
    clearTimeout(this.timerId);
  };

  drawingLoop = () => {
    const haveWaveform = this.state.eq.bands.reduce((a, b) => a + b, 0) !== 0;

    this.updateEQBands();
    this.drawVisualizer();

    /**
     * Because timeupdate events are not triggered at browser speed,
     * we use requestanimationframe for higher framerates
     */
    if (haveWaveform) {
      this.rafId = window.requestAnimationFrame(this.drawingLoop);
    }
    // If there is no music or audio in the song, then reduce the FPS
    else {
      this.timerId = setTimeout(this.drawingLoop, 250);
    }
  };

  /**
   * As a base visualizer, the equalizer bands are drawn using
   * canvas in the window directly above the song into.
   */
  drawVisualizer() {
    // Initial bar x coordinate
    let y,
      x = 0;

    // Clear the complete canvas
    this.visualizer.ctx.clearRect(
      0,
      0,
      this.visualizer.width,
      this.visualizer.height
    );
    /**
     * Set the primary colour of the brand
     * (probably moving to a higher object level variable soon)
     * Start creating a canvas polygon
     */
    this.visualizer.ctx.beginPath();
    // Start at the bottom left
    this.visualizer.ctx.moveTo(x, 0);
    this.visualizer.ctx.fillStyle = this.state.config.translucent;
    this.state.eq.bands.forEach(band => {
      /**
       * Get the overall hight associated to the current band and
       * convert that into a Y position on the canvas
       */
      y = this.state.config.multiplier * band;
      // Draw a line from the current position to the wherever the Y position is
      this.visualizer.ctx.lineTo(x, y);
      /**
       * Continue that line to meet the width of the bars
       * (canvas width ÷ bar count).
       */
      this.visualizer.ctx.lineTo(x + this.visualizer.barWidth, y);
      // Add pixels to the x for the next bar
      x += this.visualizer.barWidth;
    });
    // Bring the line back down to the bottom of the canvas
    this.visualizer.ctx.lineTo(x, 0);
    // Fill it
    this.visualizer.ctx.fill();
  }

  handleVisibilityChange = isTabVisible => {
    this.setState({ isTabVisible });
  };

  render() {
    return (
      <PageVisibility onChange={this.handleVisibilityChange}>
        <div className='visualizer'>
          <canvas aria-label='visualizer' ref={a => (this._canvas = a)} />
        </div>
      </PageVisibility>
    );
  }
}

Visualizer.propTypes = {
  player: PropTypes.object,
  playing: PropTypes.bool
};
