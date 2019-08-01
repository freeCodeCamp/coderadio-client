import React from "react";
import PropTypes from "prop-types";
import { isBrowser } from "react-device-detect";

import visualizer from "../scripts/visualizer";

export default class Main extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      visualizerRunning: false
    };
  }

  componentWillReceiveProps(nextProps) {
    if (
      !this.state.visualizerRunning &&
      nextProps.player &&
      this._visualizerContainer
    ) {
      this.setState({
        visualizerRunning: true
      });

      // eslint-disable-next-line no-new
      new visualizer(nextProps.player);
    }
  }

  toggleSidenav() {
    this.setState(prevState => ({
      navOpen: !prevState.navOpen
    }));
  }
  render() {
    let container =
      isBrowser && this.props.fastConnection ? (
        <div className="animation saron" id="container" />
      ) : (
        ""
      );

    let visualizer = isBrowser ? (
      <div id="visualizer" ref={a => (this._visualizerContainer = a)} />
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
        <div className="under-header-content jumbotron">
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
  player: PropTypes.object
};
