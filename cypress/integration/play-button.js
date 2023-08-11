describe('Stop and play the music', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000');
  });

  it('Click play button', () => {
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
