import React from 'react';
import { render, screen } from '@testing-library/react';
import { test, expect, describe } from 'vitest';

import Nav from './Nav';

describe('<Nav />', () => {
  it('should render a link to the News page', () => {
    render(<Nav />);

    const newsLink = screen.getByRole('link', {
      name: /news opens in new window/i
    });

    expect(newsLink).toBeInTheDocument();

    expect(newsLink).toHaveAttribute(
      'href',
      'https://www.freecodecamp.org/news/'
    );
  });

  it('should render a link to the Forum page', () => {
    render(<Nav />);

    const forumLink = screen.getByRole('link', {
      name: /forum opens in new window/i
    });

    expect(forumLink).toBeInTheDocument();

    expect(forumLink).toHaveAttribute(
      'href',
      'https://www.freecodecamp.org/forum/'
    );
  });

  it('should render a link to the Learn page', () => {
    render(<Nav />);

    const learnLink = screen.getByRole('link', {
      name: /learn opens in new window/i
    });

    expect(learnLink).toBeInTheDocument();

    expect(learnLink).toHaveAttribute(
      'href',
      'https://www.freecodecamp.org/learn/'
    );
  });
});
