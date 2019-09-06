import React from "react";
import PropTypes from "prop-types";
import { isBrowser } from "react-device-detect";

import Visualizer from "./Visualizer";

export default class Main extends React.Component {
  render() {
    // dispaly background and animation for all browsers
    let container = isBrowser ? (
      <div className="animation saron" id="container" />
    ) : (
      ""
    );

    let visualizer = isBrowser ? (
      <Visualizer player={this.props.player} playing={this.props.playing} />
    ) : (
      ""
    );
    let details = isBrowser ? (
      <details>
        <summary>Keyboard Controls</summary>
        <dl>
          <dt>Play/Pause:</dt>
          <dd>Spacebar or "k"</dd>
          <dt>Volume:</dt>
          <dd>Up Arrow / Down Arrow</dd>
        </dl>
      </details>
    ) : (
      ""
    );

    return (
      <main>
        <div className="under-header-content">
          <h1 className="site-title">Welcome to Code Radio.</h1>
          &nbsp; &nbsp;
          <h2 className="site-description">24/7 music designed for coding.</h2>
        </div>
        {container}
        {visualizer}
        {details}
      </main>
    );
  }
}

Main.propTypes = {
  fastConnection: PropTypes.bool,
  player: PropTypes.object,
  playing: PropTypes.bool
};
