/**
 * Copyright 2026 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

export default class PasswordPolicyModal {
  // The list container; the id suffix is the callback index, so match by prefix
  static get passwordPolicyList() {
    return cy.get('ul[id^="policy_panel_"]', { timeout: 10000 });
  }

  static passwordPolicyRule(policyText) {
    return cy.get(`.fr-policy-list-item:contains("${policyText}")`, { timeout: 10000 });
  }
}
