import 'cypress-lighthouse';

describe('platform-enduser lighthouse suite', () => {
  const passThreshold = Cypress.env('lighthousePassThreshold');
  const adminUserName = Cypress.env('AM_USERNAME');
  const adminPassword = Cypress.env('AM_PASSWORD');
  const retries = 0;

  describe('/enduser/profile', { retries }, () => {
    const locationUrl = `${Cypress.config().baseUrl}/enduser#/profile`;
    const auditResults = {};

    before(() => {
      cy.login(adminUserName, adminPassword, locationUrl);
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

  describe('/enduser/dashboard', { retries }, () => {
    const locationUrl = `${Cypress.config().baseUrl}/enduser#/dashboard`;
    const auditResults = {};

    before(() => {
      cy.login(adminUserName, adminPassword, locationUrl);
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
});
