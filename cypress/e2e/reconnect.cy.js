describe('Stream recovery', () => {
  it('retries and then falls back to the other stream on errors', () => {
    cy.intercept('GET', '**/api/nowplaying_static/coderadio.json', {
      fixture: 'nowplaying.json'
    });
    cy.intercept('GET', '**/api/live/nowplaying/sse*', { statusCode: 204 });
    cy.intercept('GET', '**/listen/coderadio/radio.mp3*', {
      statusCode: 503
    }).as('high');
    cy.intercept('GET', '**/listen/coderadio/low.mp3*', {
      statusCode: 503
    }).as('low');

    cy.visit('/');
    cy.get('#toggle-play-pause').click();
    cy.wait('@high');
    cy.contains('Reconnecting…');
    cy.wait('@high');
    cy.wait('@low', { timeout: 10000 });
  });

  it('recovers when the stream stalls without an error', () => {
    cy.intercept('GET', '**/listen/coderadio/radio.mp3*', req => {
      req.on('response', res => res.setThrottle(1));
    });

    cy.visit('/');
    cy.get('#toggle-play-pause').click();
    cy.contains('Reconnecting…', { timeout: 20000 });
    cy.get('audio', { timeout: 60000 }).should($audio => {
      expect($audio[0].src).to.contain('low.mp3');
      expect($audio[0].currentTime).to.be.greaterThan(2);
    });
    cy.get('.connection-status').should('have.text', '');
  });
});
