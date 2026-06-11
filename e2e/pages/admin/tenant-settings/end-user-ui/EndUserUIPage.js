/**
 * Copyright 2026 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

export default class EndUserUIPage {
  static hostedPageItem(pageType) {
    return cy.findByRole('heading', { name: pageType }).closest('.card-body');
  }

  static hostedPageStatus(pageType) {
    return EndUserUIPage.hostedPageItem(pageType).find('.badge');
  }

  static hostedPageToggleButton(pageType, action) {
    return EndUserUIPage.hostedPageItem(pageType).findByRole('button', { name: action });
  }
}
