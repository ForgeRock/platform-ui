/**
 * Copyright 2026 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

import BaseAdminPage from '../BaseAdminPage';

export default class CustomDomainPage extends BaseAdminPage {
  static get addCustomDomainButton() {
    return cy.findByRole('button', { name: /add a custom domain/i });
  }

  static get noDomainMessage() {
    return cy.findByRole('heading', { name: /you haven't added a custom domain for this realm yet/i });
  }

  static domainRow(domainName) {
    return CustomDomainPage.pageTable.contains('tr', domainName);
  }

  static domainRowCell(domainName, cellName) {
    return CustomDomainPage.domainRow(domainName).contains('td', cellName);
  }

  static reverifyButton(domainName) {
    return CustomDomainPage.domainRow(domainName).findByRole('button', { name: /re-verify/i });
  }

  static deleteButton(domainName) {
    return CustomDomainPage.domainRow(domainName).findByRole('button', { name: /delete/i });
  }
}
