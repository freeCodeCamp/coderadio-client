import React from "react";
import PropTypes from "prop-types";
import { isBrowser } from "react-device-detect";

import Visualizer from "./Visualizer";
import OfflineBanner from "./OfflineBanner";

const Main = ({ player, playing }) => (
  <main>
    <div className="under-header-content">
      <div className="title-wrapper">
        <h1 className="site-title">Welcome to Code Radio.</h1>
        &nbsp; &nbsp;
        <h2 className="site-description">24/7 music designed for coding.</h2>
      </div>
      <OfflineBanner />
    </div>
    {isBrowser && (
      <>
        <div className="animation saron" id="container" />
        <Visualizer player={player} playing={playing} />
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

Main.propTypes = {
  player: PropTypes.object,
  playing: PropTypes.bool
};

export default Main;
