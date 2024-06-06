/* global cy */
describe('Landing page', () => {
  it('Should render', () => {
    cy.visit('http://localhost:3001');
    cy.title().should('eq', 'freeCodeCamp.org Code Radio');
  });
});
