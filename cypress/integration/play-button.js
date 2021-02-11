describe('Stop and play the music', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000');
  });
  it('first test case', () => {
    cy.get('#playContainer')
      .should('have.attr', 'aria-label', 'Play')
      .click()
      .should('have.attr', 'aria-label', 'Pause');
  });
});
