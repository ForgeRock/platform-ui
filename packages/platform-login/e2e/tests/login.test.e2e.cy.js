/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { retryableBeforeEach } from '@e2e/util';

describe('Login View', { tags: ['@forgeops', '@cloud'] }, () => {
  retryableBeforeEach(() => {
    cy.visit(`${Cypress.config().baseUrl}/am/XUI/?realm=/#/`);
  });

  it('[TC-12185] Should logout when using am/XUI/logout url', () => {
    cy.loginAsAdmin();
    cy.location().should((location) => {
      expect(location.href).to.not.eq(`${Cypress.config().baseUrl}/am/XUI/?realm=/#/`);
    });

    cy.intercept('GET', '/am/json/serverinfo/*').as('getServerInfo');
    cy.visit(`${Cypress.config().baseUrl}/am/XUI/?realm=/#/logout`);
    cy.wait('@getServerInfo');
    cy.location().should((location) => {
      expect(location.href).to.eq(`${Cypress.config().baseUrl}/am/XUI/?realm=/#/`);
    });
  });

  it('[TC-12186] When using am/UI/Logout url with goto query param, should navigate to am/XUI with goto param to allow am to validate url', () => {
    cy.loginAsAdmin();
    cy.location().should((location) => {
      expect(location.href).to.not.eq(`${Cypress.config().baseUrl}/am/XUI/?realm=/&goto=www.google.com#/`);
    });

    cy.intercept('GET', '/am/json/serverinfo/*').as('getServerInfo');
    cy.visit(`${Cypress.config().baseUrl}/am/UI/Logout?realm=/&goto=www.google.com`);
    cy.wait('@getServerInfo');
    // verify location is at /am/XUI/ with goto param, indicating we would then have goto url validated by am
    cy.location().should((location) => {
      expect(location.href).to.eq(`${Cypress.config().baseUrl}/am/XUI/?realm=/&goto=www.google.com#/`);
    });
  });
});
