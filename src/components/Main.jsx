import { useMediaQuery } from '../hooks/useBrowserState';
import Visualizer from './Visualizer';
import Video from '../assets/Saron3.webm';

export default function Main({ analyser, playing }) {
  const isDesktop = useMediaQuery('(hover: hover) and (pointer: fine)');
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  return (
    <main>
      <div className='under-header-content'>
        <h1 className='site-title'>Welcome to Code Radio.</h1>
        <h2 className='site-description'>24/7 music designed for coding.</h2>
      </div>
      {isDesktop && (
        <>
          {!reducedMotion && (
            <div className='animation'>
              <video aria-hidden autoPlay loop muted playsInline>
                <source src={Video} type='video/webm' />
              </video>
            </div>
          )}
          <Visualizer analyser={analyser} active={playing && !reducedMotion} />
          <details>
            <summary id='keyboard-controls'>Keyboard Controls</summary>
            <dl>
              <dt>Play/Pause:</dt>
              <dd>Spacebar or &quot;k&quot;</dd>
              <dt>Volume:</dt>
              <dd>Up Arrow / Down Arrow</dd>
            </dl>
          </details>
        </>
      )}
    </main>
  );
}
