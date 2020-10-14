Cypress.Commands.add('login', (userName, password = 'Welcome1', loginUrl = `${Cypress.config().baseUrl}/enduser/`) => {
  indexedDB.deleteDatabase('appAuth');
  cy.visit(loginUrl);
  cy.get('[placeholder="User Name:"]').type(userName);
  cy.get('[placeholder="Password:"]').type(password, { force: true });
  cy.get('.btn-primary').click();
  cy.get('h1', { timeout: 20000 });
});

Cypress.Commands.add('logout', () => {
  cy.clearCookies();
});
