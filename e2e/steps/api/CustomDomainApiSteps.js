/**
 * Copyright 2026 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

import {
  addCustomDomain, deleteCustomDomain, verifyCustomDomain,
} from '@e2e/api/customDomainApi.e2e';

export default class CustomDomainApiSteps {
  static createdDomains = [];

  static addCustomDomain(realm, domain) {
    return addCustomDomain(realm, domain).then((response) => {
      CustomDomainApiSteps.createdDomains.push({ realm, domain });
      return response;
    });
  }

  static verifyDomain(domain) {
    return verifyCustomDomain(domain);
  }

  static deleteCreatedDomains() {
    return cy.wrap(CustomDomainApiSteps.createdDomains).then((domains) => {
      if (!domains.length) return null;

      domains.forEach((item) => {
        deleteCustomDomain(item.realm, item.domain, undefined, { failOnStatusCode: false });
      });
      CustomDomainApiSteps.createdDomains = [];
      return null;
    });
  }
}
