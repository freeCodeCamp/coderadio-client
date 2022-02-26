import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import Nav from './Nav';

describe('<Nav />', () => {
  it('should render a link to the News page', () => {
    // Render the Nav component
    render(<Nav />);

    // Find a link with the text 'News' in the component - I'll explain more
    const newsLink = screen.getByRole('link', {
      name: /news opens in new window/i
    });
    // Assert that the link exists
    expect(newsLink).toBeInTheDocument();
    // Assert that the link points to the correct page
    expect(newsLink).toHaveAttribute(
      'href',
      'https://www.freecodecamp.org/news/'
    );
  });

  it('should render a link to the Forum page', () => {
    // Render the Nav component
    render(<Nav />);

    // Find a link with the text 'Forum' in the component
    const forumLink = screen.getByRole('link', {
      name: /forum opens in new window/i
    });

    // Assert that the link exists
    expect(forumLink).toBeInTheDocument();

    // Assert that the link points to the correct page
    expect(forumLink).toHaveAttribute(
      'href',
      'https://www.freecodecamp.org/forum/'
    );
  });

  it('should render a link to the Learn page', () => {
    // Render the Nav component
    render(<Nav />);

    // Find a link with the text 'Learn' in the component
    const learnLink = screen.getByRole('link', {
      name: /learn opens in new window/i
    });

    // Assert that the link exists
    expect(learnLink).toBeInTheDocument();

    // Assert that the link points to the correct page
    expect(learnLink).toHaveAttribute(
      'href',
      'https://www.freecodecamp.org/learn/'
    );
  });
});
