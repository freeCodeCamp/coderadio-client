describe('Stop and play the music', () => {
  it('Click play button', function () {

    // Endless test trying to load the Discord integration 
    // https://stackoverflow.com/questions/64673128/cypress-iframe-function-works-on-chrome-but-not-firefox
    if (Cypress.browser.name === 'firefox') {
      this.skip();
    }

    cy.visit('http://localhost:3001');
    cy.get('audio')
      .invoke('attr', 'src')
      .should('contain', '.mp3')
      .then(() => {
        cy.get('#toggle-play-pause').should('be.visible').click();
        cy.get('audio').should(audioElements => {
          const audioIsPaused = audioElements[0].paused;
          expect(audioIsPaused).to.eq(false);
        });
      });
  });
});
