/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import PasswordPolicyModal from '@e2e/pages/login/PasswordPolicyModal';

export default class PasswordPolicySteps {
  /**
   * Intercepts the two validateOnly authenticate probes ('' and 'aaa') that
   * build the password policy panel
   */
  static interceptPasswordProbes() {
    cy.intercept(
      {
        url: '**/am/json/**/authenticate',
        method: 'POST',
        times: 2,
      },
    ).as('passwordPolicyProbe');
  }

  // Waits for both probes to complete and the merged policy list to render.
  static waitForPoliciesLoad() {
    cy.wait('@passwordPolicyProbe');
    cy.wait('@passwordPolicyProbe');
    PasswordPolicyModal.passwordPolicyList.children('li').should('have.length.greaterThan', 0);
  }

  /**
   * @param {String[]} policies policy texts as shown in the panel
   */
  static assertPoliciesVisibleAndUnique(policies) {
    policies.forEach((policy) => {
      // The merged probe union must render each policy exactly once.
      // scrollIntoView also puts the panel in frame for failure screenshots
      PasswordPolicyModal.passwordPolicyRule(policy)
        .scrollIntoView()
        .should('have.length', 1)
        .and('be.visible');
    });
  }
}
