import React, { useState } from "react";

export default function Nav() {

  const [isOpen, setIsOpen] = useState(false);

  const toggleSidenav = () => {
    setIsOpen(!isOpen);
  }

  return (
    <nav
      className={
        "site-nav nav-padding" + (isOpen ? " expand-nav" : "")
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
              "nav" + (isOpen ? " show-main-nav-items" : "")
            }
            id="nav"
            role="menu"
          >
            <li className="nav-news nav-current" role="menuitem">
              <a
                href="https://www.freecodecamp.org/news/"
                rel="noopener noreferrer"
                target="_blank"
              >
                News
              </a>
            </li>
            <li className="nav-forum" role="menuitem">
              <a
                href="https://www.freecodecamp.org/forum/"
                rel="noopener noreferrer"
                target="_blank"
              >
                Forum
              </a>
            </li>
            <li className="nav-learn" role="menuitem">
              <a
                href="https://www.freecodecamp.org/learn/"
                rel="noopener noreferrer"
                target="_blank"
              >
                Learn
              </a>
            </li>
          </ul>
        </div>
      </div>
      <button
        className={
          "site-nav-right toggle-button-nav" +
          (isOpen ? " reverse-toggle-color" : "")
        }
        id="toggle-button-nav"
        onClick={toggleSidenav}
      >
        Menu
      </button>
    </nav>
  );
}
