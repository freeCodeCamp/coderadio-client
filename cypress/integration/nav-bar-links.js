/* global cy */
describe('links on the nav-bar menu', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000');
  });
  it('Test the news page button', () => {
    cy.contains('a', 'News')
      .should('have.attr', 'href', 'https://www.freecodecamp.org/news/')
      .click()
      .then(link => {
        cy.request(link.prop('href'))
          .its('status')
          .should('eq', 200);
      });
  });
  it('Test the forum page button', () => {
    cy.contains('a', 'Forum')
      .should('have.attr', 'href', 'https://www.freecodecamp.org/forum/')
      .click()
      .then(link => {
        cy.request(link.prop('href'))
          .its('status')
          .should('eq', 200);
      });
  });
  it('Test the learn page button', () => {
    cy.contains('a', 'Learn')
      .should('have.attr', 'href', 'https://www.freecodecamp.org/learn/')
      .click()
      .then(link => {
        cy.request(link.prop('href'))
          .its('status')
          .should('eq', 200);
      });
  });
});
