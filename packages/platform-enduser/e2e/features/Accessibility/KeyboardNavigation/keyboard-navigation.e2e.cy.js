/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { retryableBeforeEach } from '@e2e/util';
import apiSteps from '@e2e/steps/apiSteps';
import enduser from '../../../persona/enduserSteps';

/**
 * Covers TC-12998 / IAM-10141: after any page navigation in the enduser
 * platform via keyboard (Tab to reach a menu option/button/link + Enter to
 * load the page), focus automatically moves to the main content element
 * (#appContent) with a visible focus indicator (fr-auto-focused class, see
 * packages/platform-shared/src/composables/useRouteFocus.js). Opening a page
 * via mouse click must not show the visible focus indicator.
 */
describe('Enduser navigates to different pages via keyboard and sees initial focus set on the content of the page', { tags: ['@cloud', '@forgeops', '@vpat'] }, () => {
  retryableBeforeEach(() => {
    // Create the test enduser via API using an admin access token, then
    // login as enduser. Dashboard page is loaded by default with no visible
    // focus set on the content of the page. Each call is chained onto the
    // previous one so a login/token failure skips the rest of the setup.
    cy.loginAsAdminCached()
      .then(() => apiSteps.endUser.createEndUser())
      .then(() => cy.logout())
      .then(() => apiSteps.endUser.loginAsEndUser())
      .then(() => enduser.keyboardNavigation.assertAppContentNotFocused());
  });

  afterEach(() => {
    cy.logout();
    apiSteps.endUser.deleteRegisteredUser();
  });

  it('[TC-12998] Enduser navigates to different pages via keyboard and sees initial focus set on the content of the page', () => {
    // Press TAB for the first time, focus moves to the 'Skip to main
    // content' link. Reset focus to the document body first so the tab
    // sequence starts from the top of the page, and wait for the sidebar
    // menu items to render (they load asynchronously from the menus config).
    enduser.keyboardNavigation.assertSidebarMenuRendered();
    enduser.keyboardNavigation.resetFocusToBody();
    enduser.keyboardNavigation.pressTab();
    enduser.keyboardNavigation.assertFocusOnSkipLink();

    // Press TAB the second time, focus moves to the Dashboard menu option
    enduser.keyboardNavigation.pressTab();
    enduser.keyboardNavigation.assertFocusOnNavLink('Dashboard');

    // Press ENTER to load the Dashboard page, focus moves to the content of
    // the Dashboard page (element main) with visible focus indicator
    enduser.keyboardNavigation.pressEnter();
    enduser.keyboardNavigation.assertFocusOnAppContent();

    // Press TAB, focus moves to the first accessible element on the
    // Dashboard page ('Edit Your Profile' button)
    enduser.keyboardNavigation.pressTab();
    enduser.keyboardNavigation.assertFocusOnElement('Edit Your Profile');

    // Press ENTER to click 'Edit Your Profile', enduser navigates to the
    // Profile page and focus moves to the content of the page (element main)
    enduser.keyboardNavigation.pressEnter();
    enduser.keyboardNavigation.assertFocusOnAppContent();

    // Press TAB, focus moves to the first accessible element on the Profile
    // page (the profile image button)
    enduser.keyboardNavigation.pressTab();
    enduser.keyboardNavigation.assertFocusOnProfileImage();

    // Click the Dashboard menu option manually via mouse, enduser navigates
    // to the Dashboard page with no visible focus set on the content
    enduser.keyboardNavigation.clickNavLink('Dashboard');
    enduser.keyboardNavigation.assertAppContentNotFocused();
  });
});
