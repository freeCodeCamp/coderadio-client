describe('Landing page', () => {
  it('renders', () => {
    cy.visit('/');
    cy.title().should('eq', 'freeCodeCamp.org Code Radio');
  });
});
