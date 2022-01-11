import React, { useState } from 'react';
import { ReactComponent as ExternalLink } from '../assets/external-link.svg';

export default function Nav() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidenav = () => {
    setIsOpen(!isOpen);
  };

  const links = [
    { href: 'https://www.freecodecamp.org/news/', text: 'News' },
    { href: 'https://www.freecodecamp.org/forum/', text: 'Forum' },
    { href: 'https://www.freecodecamp.org/learn/', text: 'Learn' }
  ];

  return (
    <nav className={'site-nav' + (isOpen ? ' expand-nav' : '')} id='site-nav'>
      <div className='site-nav-left' />
      <div className='site-nav-middle'>
        <a className='site-nav-logo' href='https://www.freecodecamp.org/'>
          <img
            alt=''
            src='https://cdn.freecodecamp.org/platform/universal/fcc_primary.svg'
          />
          <span className='sr-only'>freeCodeCamp.org home</span>
        </a>
      </div>
      <div className='site-nav-right main-nav'>
        <button
          aria-controls='nav'
          aria-expanded={isOpen}
          className={
            'site-nav-right toggle-button-nav' +
            (isOpen ? ' reverse-toggle-color' : '')
          }
          id='toggle-button-nav'
          onClick={toggleSidenav}
        >
          Menu
        </button>
        <div className='main-nav-group'>
          <ul
            className={'nav' + (isOpen ? ' show-main-nav-items' : '')}
            id='nav'
          >
            {links.map((link, index) => (
              <li key={index}>
                <a href={link.href} rel='noopener noreferrer' target='_blank'>
                  <span>
                    {link.text}{' '}
                    <span className='sr-only'>opens in new window</span>
                    <ExternalLink />
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </nav>
  );
}
