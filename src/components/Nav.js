import React, { useState } from "react";

export default function Nav() {

  const [isOpen, setIsOpen] = useState(false);

  const toggleSidenav = () => {
    setIsOpen(!isOpen);
  }

  const links = [
    { href: "https://www.freecodecamp.org/news/", text: "News" },
    { href: "https://www.freecodecamp.org/forum/", text: "Forum" },
    { href: "https://www.freecodecamp.org/learn/", text: "Learn" }
  ];

  return (
    <nav
      className={
        "site-nav" + (isOpen ? " expand-nav" : "")
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
            {links.map((link, index) => (
              <li key={index} role="menuitem">
                <a
                  href={link.href}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  {link.text}
                </a>
              </li>
            ))}
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
