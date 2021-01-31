describe('Stop and play the music', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000');
  });
  it('Stop and play music', () => {
    cy.get('#playContainer')
      .should('have.attr', 'aria-label', 'Play')
      .click()
      .should('have.attr', 'aria-label', 'Pause');
  });
});
