import React from 'react';
import { isBrowser } from 'react-device-detect';

import Visualizer from './Visualizer';
import Video from '../assets/Saron3.webm';

interface MainProps
{
  fastConnection: boolean,
  player: HTMLAudioElement,
  playing: boolean
}

const Main: React.FC<MainProps> = (MainProps) => {
  return (
    <main>
      <div className='under-header-content'>
        <h1 className='site-title'>Welcome to Code Radio.</h1>
        <h2 className='site-description'>24/7 music designed for coding.</h2>
      </div>
      {isBrowser && (
        <>
          <div className='animation'>
            <video
              aria-hidden={true}
              autoPlay={true}
              loop={true}
              muted={true}
              playsInline={true}
            >
              <source src={Video} type='video/webm' />
            </video>
          </div>
          <Visualizer player={MainProps.player} playing={MainProps.playing} />
          <details>
            <summary id='keyboard-controls'>Keyboard Controls</summary>
            <dl>
              <dt>Play/Pause:</dt>
              <dd>Spacebar or "k"</dd>
              <dt>Volume:</dt>
              <dd>Up Arrow / Down Arrow</dd>
            </dl>
          </details>
        </>
      )}
    </main>
  );
};

export default Main;
