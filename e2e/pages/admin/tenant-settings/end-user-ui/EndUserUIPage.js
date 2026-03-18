/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

export default class EndUserUIPage {
  static hostedPageItem(pageType) {
    return cy.findByRole('heading', { name: pageType }).closest('.list-group-item');
  }

  static hostedPageStatus(pageType) {
    return EndUserUIPage.hostedPageItem(pageType).findByText(/(Active|Inactive)/);
  }

  static hostedPageToggleButton(pageType, action) {
    return EndUserUIPage.hostedPageItem(pageType).findByRole('button', { name: action });
  }
}
