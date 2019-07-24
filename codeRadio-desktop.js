import { CodeRadio } from './player.js';
import { Visualizer } from './visualizer.js';

if (!window.mobilecheck()) {
    //set up the footer
    const footer = document.createElement('footer'),
        visContainer = document.createElement('div'),
        details = document.createElement('details'),
        connectionSpeed = document.createElement('select'),
        speedOptions = [];
    connectionSpeed.addEventListener('change', evt => {
      fCC_Player.mount = connectionSpeed.value;
    });
    visContainer.id = 'visualizer';
    footer.innerHTML = `
      <div id="metaDisplay">
        <div data-meta="picture"></div>
        <div id="nowPlaying">
          <progress value="0" max="100" data-meta="duration"></progress>
          <div data-meta="title"></div>
          <div data-meta="artist"></div>
          <div data-meta="album"></div>
          <div data-meta="listeners"></div>
        </div>
      </div>
      <div id="playContainer">
        <img
          id="playButton"
          src="https://cdn-media-1.freecodecamp.org/code-radio/play.svg"
          alt="Play Pause Button"
        />
        </div>
      <div class="slider-container">
        <input id="slider" type="range" min="0" max="10" value="0">
      </div>
      `;
    //setup the info box for keyboard shortcuts

    details.innerHTML = `
      <summary>Keyboard Controls</summary>
      <dl>
        <dt>Play/Pause:</dt><dd>Spacebar or "k"</dd>
        <dt>Volume:</dt><dd>Up Arrow / Down Arrow</dd>
      </dl>`;
      
    document.body.appendChild(footer);
    document.querySelector('main').appendChild(visContainer);
    document.querySelector('main').appendChild(details);
    //start the show
    window.fCC_Player = new CodeRadio();
    window.fCC_Visualizer = new Visualizer(fCC_Player, visContainer);
    var playButton = document.getElementById("playButton"),
        slider = document.getElementById("slider"),
        playContainer = document.getElementById("playContainer"),
        progressInterval = false,
        meta = {
            container: document.getElementById("nowPlaying"),
            picture: document.querySelector('[data-meta="picture"]'),
            title: document.querySelector('[data-meta="title"]'),
            artist: document.querySelector('[data-meta="artist"]'),
            album: document.querySelector('[data-meta="album"]'),
            duration: document.querySelector('[data-meta="duration"]'),
            listeners: document.querySelector('[data-meta="listeners"]')
        };

    slider.addEventListener('input', () => fCC_Player.setTargetVolume(slider.value / 10));
    playContainer.addEventListener('click', () => fCC_Player.togglePlay());

    fCC_Player.on('play', () => playButton.src = "https://cdn-media-1.freecodecamp.org/code-radio/pause.svg");
    fCC_Player.on('pause', () => playButton.src = "https://cdn-media-1.freecodecamp.org/code-radio/play.svg");
    fCC_Player.on('volumeChange', (volume) => slider.value = Math.round(volume * 10));
    fCC_Player.on('listeners', (count) => document.querySelector('[data-meta="listeners"]').textContent = `Listeners: ${count}`);
    fCC_Player.on('newSong', (songData) => {
        if (speedOptions.length === 0) {
          fCC_Player.mounts.forEach(mount => {
            let option = document.createElement('option');
            option.value = mount.url;
            option.textContent = mount.name;
            if (fCC_Player.url === mount.url) option.selected = true;
            connectionSpeed.appendChild(option);
            speedOptions.push(option);
          });
          document.querySelector('.site-nav-left').appendChild(connectionSpeed);
        }
        meta.duration.value = 0;
        meta.duration.max = fCC_Player.duration;
        if (!!songData.art) {
            meta.picture.style.backgroundImage = `url(${songData.art})`;
            meta.container.classList.add("thumb");
        } else {
            meta.container.classList.remove("thumb");
            meta.picture.style.backgroundImage = "";
        }
        meta.title.textContent = songData.title;
        meta.artist.textContent = songData.artist;
        meta.album.textContent = songData.album;
        if (!progressInterval) progressInterval = setInterval(() => {
            meta.duration.value = (new Date().valueOf() - fCC_Player.playedAt) / 1000;
        }, 100);
    });

    container.classList.add("animation");
}