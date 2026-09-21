/**
 * Copyright 2026 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

import BaseEnduserPage from './BaseEnduserPage';

// 16x16 solid blue SVG served for the test's synthetic logo URLs — the tests
// enter unique example.com URLs the browser cannot load, so the imgs would
// otherwise render the broken-image placeholder instead of the picture.
// A string body is used because Cypress mangles Buffer bodies in intercept
// stubs (the img never decodes), while an SVG string renders correctly.
const STUBBED_SVG = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"><rect width="16" height="16" fill="#00f"/></svg>';

/**
 * POM for the enduser app's side menu branding. The SideMenu always renders
 * both logo <img> elements (CSS toggles only their display), so the expanded
 * horizontal and collapsed square logos are assertable without depending on
 * the sidebar collapse state — same mechanics as the legacy "the logo in
 * navigation bar is" step.
 */
export default class EnduserSideMenuPage extends BaseEnduserPage {
  /**
   * Serves a real image for the test's synthetic logo URLs. Must be
   * registered before the enduser login so the side-menu logo <img> requests
   * are fulfilled by it.
   * @param {String} urlFragment fragment common to the logo URLs to stub
   */
  static stubLogoImages(urlFragment) {
    cy.intercept(`**/*${urlFragment}*`, {
      statusCode: 200,
      headers: { 'content-type': 'image/svg+xml' },
      body: STUBBED_SVG,
    });
  }

  static get horizontalLogo() {
    return EnduserSideMenuPage.sidebarNav.find('img.fr-company-logo-horizontal');
  }

  static get squareLogo() {
    return EnduserSideMenuPage.sidebarNav.find('img.fr-company-logo-square');
  }
}
