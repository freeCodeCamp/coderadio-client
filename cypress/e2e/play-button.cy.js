describe('Play button', () => {
  it('starts the stream', () => {
    cy.visit('/');
    cy.get('#toggle-play-pause').should('be.visible').click();
    cy.get('audio').should($audio => {
      expect($audio[0].paused).to.eq(false);
      expect($audio[0].src).to.contain('.mp3');
    });
  });
});
