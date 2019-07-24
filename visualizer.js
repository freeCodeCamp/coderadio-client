const _player = Symbol('player')

export class Visualizer {

    constructor(fCC_Player, container = false) {
        this[_player] = fCC_Player.player;
        this.eq = {};
        this.config = {
            baseColour: "rgb(10, 10, 35)",
            translucent: "rgba(10, 10, 35, 0.6)",
            multiplier: 0.7529,
        };
        this.container = container || document.getElementById("visualizer");

        // In order to get around some mobile browser limitations, we can only generate a lot
        // of the audio context stuff AFTER the audio has been triggered. We can't see it until
        // then anyway so it makes no difference to desktop.
        fCC_Player.player.addEventListener('play', () => {
            if (!this.eq.context) {
                this.initiateEQ();
                this.createVisualizer();
            }
        })

    }

    initiateEQ() {
        // Create a new Audio Context element to read the samples from
        this.eq.context = new AudioContext();
        // Apply the audio element as the source where to pull all the data from
        this.eq.src = this.eq.context.createMediaElementSource(this[_player]);

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
        this.container.appendChild(container);
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
        if (this.eq.bands.reduce((a, b) => a + b, 0) !== 0) requestAnimationFrame(() => this.drawVisualizer());
        // Because timeupdate events are not triggered at browser speed, we use requestanimationframe for higher framerates
        else setTimeout(() => this.drawVisualizer(), 250); // If there is no music or audio in the song, then reduce the FPS

        let y,
            x = 0; // Intial bar x coordinate
        this.visualizer.ctx.clearRect(0, 0, this.visualizer.width, this.visualizer.height); // Clear the complete canvas
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

}