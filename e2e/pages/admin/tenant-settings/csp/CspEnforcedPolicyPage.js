/**
 * Copyright 2026 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

import BaseAdminPage from '../../BaseAdminPage';

export default class CspEnforcedPolicyPage extends BaseAdminPage {
  static get tabpanel() {
    return cy.findByRole('tabpanel', { name: 'Enforced Policy' });
  }

  static get policyStatus() {
    return CspEnforcedPolicyPage.tabpanel.find('.badge');
  }

  static get addDirectiveButton() {
    return CspEnforcedPolicyPage.tabpanel.findByRole('button', { name: 'Add Directive' });
  }

  static get noDirectivesMessage() {
    return CspEnforcedPolicyPage.tabpanel.findByText(/you haven't added any directives yet/i);
  }

  static get publishChangesButton() {
    return cy.findByRole('button', { name: 'Publish' });
  }

  static get table() {
    return CspEnforcedPolicyPage.tabpanel.findByRole('table');
  }

  static directiveRow(directiveName) {
    return CspEnforcedPolicyPage.table
      .findByRole('cell', { name: directiveName })
      .closest('tr');
  }

  static directiveRowCell(directiveName, cellName) {
    return CspEnforcedPolicyPage.directiveRow(directiveName).findByRole('cell', { name: cellName });
  }

  static get directiveColumnHeader() {
    return CspEnforcedPolicyPage.table.findByRole('columnheader', { name: /directive/i });
  }

  static get firstDirectiveCell() {
    return CspEnforcedPolicyPage.table.find('tbody tr:first-child td.directive-column');
  }
}
