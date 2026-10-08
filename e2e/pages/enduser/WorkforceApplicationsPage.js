/**
 * Copyright 2026 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

import BaseEnduserPage from './BaseEnduserPage';

/**
 * POM for the enduser app's Applications page — the tile grid of workforce
 * applications assigned to the logged-in user.
 */
export default class WorkforceApplicationsPage extends BaseEnduserPage {
  /**
   * Navigate to Applications through the sidebar — the enduser SPA finishes its
   * OAuth redirect asynchronously after login, so a direct cy.visit can race it;
   * clicking the nav link only works once the app has mounted.
   */
  static visit() {
    BaseEnduserPage.applicationsNavLink.click();
  }

  /**
   * The application tile — an anchor with class card whose title is the app name.
   * @param {string} appName - Name of the application tile to select
   */
  static applicationTile(appName) {
    return cy.contains('a.card', appName, { timeout: 15000 });
  }
}
