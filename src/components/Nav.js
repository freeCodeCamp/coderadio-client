import React from "react";

export default class Nav extends React.Component {
  state = {
    navOpen: false
  };

  toggleSidenav() {
    this.setState(prevState => ({
      navOpen: !prevState.navOpen
    }));
  }
  render() {
    return (
      <nav
        className={
          "site-nav nav-padding" + (this.state.navOpen ? " expand-nav" : "")
        }
        id="site-nav"
      >
        <div className="site-nav-left" />
        <div className="site-nav-middle">
          <a
            className="site-nav-logo"
            href="https://coderadio.freecodecamp.org/"
          >
            <img
              alt="Code Radio"
              src="https://cdn-media-1.freecodecamp.org/code-radio/FCC-logo.png"
            />
          </a>
        </div>
        <div className="site-nav-right main-nav">
          <div className="main-nav-group">
            <ul
              className={
                "nav" + (this.state.navOpen ? " show-main-nav-items" : "")
              }
              id="nav"
              role="menu"
            >
              <li className="nav-learn" role="menuitem">
                <a
                  href="https://www.freecodecamp.org/learn/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Learn
                </a>
              </li>
              <li className="nav-forum" role="menuitem">
                <a
                  href="https://www.freecodecamp.org/forum/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Forum
                </a>
              </li>
              <li className="nav-news nav-current" role="menuitem">
                <a
                  href="https://www.freecodecamp.org/news/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  News
                </a>
              </li>
            </ul>
          </div>
        </div>
        <button
          className={
            "site-nav-right toggle-button-nav" +
            (this.state.navOpen ? " reverse-toggle-color" : "")
          }
          id="toggle-button-nav"
          onClick={this.toggleSidenav.bind(this)}
        >
          Menu
        </button>
      </nav>
    );
  }
}
