import React from "react";
import PropTypes from "prop-types";
import { isBrowser } from "react-device-detect";

import Visualizer from "./Visualizer";

const Main = props => {
  return (
    <main>
      <div className="under-header-content">
        <h1 className="site-title">Welcome to Code Radio.</h1>
        &nbsp; &nbsp;
        <h2 className="site-description">24/7 music designed for coding.</h2>
      </div>
      {isBrowser && (
        <>
          <div className="animation saron" id="container" />
          <Visualizer player={props.player} playing={props.playing} />
          <details>
            <summary>Keyboard Controls</summary>
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

Main.propTypes = {
  fastConnection: PropTypes.bool,
  player: PropTypes.object,
  playing: PropTypes.bool
};

export default Main;
