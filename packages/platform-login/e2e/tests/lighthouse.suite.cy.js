import 'cypress-lighthouse';

describe.skip('login lighthouse report', { retries: 0 }, () => { // eslint-disable-line mocha/no-exclusive-tests
  const locationUrl = `${Cypress.config().baseUrl}/am/XUI`;
  const passThreshold = Cypress.env('lighthousePassThreshold');
  const auditResults = {};

  before(() => {
    cy.visit(locationUrl);
    cy.lighthouse(locationUrl).then((results) => {
      Object.assign(auditResults, results);
    });
  });

  it('should exceed performance threshold', () => {
    cy.wrap(auditResults.performance).should('be.gte', passThreshold.performance);
  });

  it('should exceed accessibility threshold', () => {
    cy.wrap(auditResults.accessibility).should('be.gte', passThreshold.accessibility);
  });

  it('should exceed best-practices threshold', () => {
    cy.wrap(auditResults['best-practices']).should('be.gte', passThreshold['best-practices']);
  });
});
