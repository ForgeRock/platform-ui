/**
 * Copyright 2026 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

export default class AdminsApiSteps {
  static interceptAdminsList(fixture = 'manage-admins-three-results.json') {
    cy.intercept('GET', '**/openidm/managed/teammember?**', { fixture }).as('adminsRequest');
  }

  static waitForAdminsList() {
    cy.wait('@adminsRequest');
  }

  static interceptAdminsListWithPages() {
    const adminsUrl = '**/openidm/managed/teammember?**_queryFilter=true**';
    const adminsPage2Url = '**/openidm/managed/teammember?**_pagedResultsOffset=10**';
    cy.intercept('GET', adminsUrl, { fixture: 'manage-admins-ten-with-two-page-results.json' }).as('getAdmins');
    cy.intercept('GET', adminsPage2Url, { fixture: 'manage-admins-ten-with-two-page-results-page-2.json' }).as('getAdminsPage2');
  }

  static waitForAdmins() {
    cy.wait('@getAdmins');
  }

  static waitForAdminsPage2() {
    cy.wait('@getAdminsPage2');
  }

  static interceptAdminsSearch() {
    const adminsUrl = '**/openidm/managed/teammember?**_queryFilter=true**';
    const searchUrl = '**/openidm/managed/teammember?**_queryFilter=*bill*';
    cy.intercept('GET', adminsUrl, { fixture: 'manage-admins-ten-with-two-page-results.json' }).as('getAdmins');
    cy.intercept('GET', searchUrl, { fixture: 'manage-admins-search-result.json' }).as('searchAdmins');
  }

  static waitForSearchResults() {
    cy.wait('@searchAdmins');
  }

  static interceptAdminDetail() {
    const adminsUrl = '**/openidm/managed/teammember?**';
    const adminDetailUrl = '**/openidm/managed/teammember/id1';
    cy.intercept('GET', adminsUrl, { fixture: 'manage-admins-search-result.json' }).as('getAdmins');
    cy.intercept('GET', adminDetailUrl, { fixture: 'manage-admins-detail.json' }).as('getAdminDetail');
  }

  static waitForAdminDetail() {
    cy.wait('@getAdminDetail');
  }
}
