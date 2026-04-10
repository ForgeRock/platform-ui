/**
 * Copyright 2026 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

import { generateJourneyURL } from '../../utils/journeyUtils';
import { JOURNEYS } from '../../support/constants';

export default class LoginSteps {
  static loginAsDefaultEnduser() {
    return cy.wrap(null).then(() => cy.loginAsEnduser(Cypress.env('endUserName'), Cypress.env('endUserPassword'), false));
  }

  static visitLoginJourney() {
    const url = generateJourneyURL(JOURNEYS.DEFAULT_LOGIN.name);
    cy.visit(url);
  }
}
