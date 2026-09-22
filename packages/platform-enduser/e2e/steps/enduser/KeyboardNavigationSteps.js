/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import KeyboardNavigationPage from '@e2e/pages/enduser/KeyboardNavigationPage';
import BaseEnduserPage from '@e2e/pages/enduser/BaseEnduserPage';

export default class KeyboardNavigationSteps {
  /**
   * Wait for the sidebar menu items to be rendered (they load asynchronously
   * from the menus config; Tab pressed before that lands on the sidebar
   * toggle button instead of the nav links).
   */
  static assertSidebarMenuRendered() {
    BaseEnduserPage.dashboardNavLink.should('be.visible');
  }

  static pressTab() {
    KeyboardNavigationPage.pressTab();
  }

  static pressEnter() {
    KeyboardNavigationPage.pressEnter();
  }

  static resetFocusToBody() {
    KeyboardNavigationPage.resetFocusToBody();
  }

  /**
   * Click a sidebar navigation link via mouse (no keyboard interaction).
   */
  static clickNavLink(name) {
    cy.findByRole('link', { name }).click();
  }

  /**
   * Assert focus sits on the skip link ("Skip to main content").
   */
  static assertFocusOnSkipLink() {
    KeyboardNavigationPage.skipLink
      .should('have.attr', 'data-testid', 'link-skip-to-main-content')
      .and('contain.text', 'Skip to main content');
  }

  /**
   * Assert focus sits on the sidebar link with the given accessible text
   * (e.g. 'Dashboard').
   */
  static assertFocusOnNavLink(name) {
    cy.focused().should('contain.text', name);
  }

  /**
   * Assert focus sits on #appContent with the visible keyboard-focus
   * indicator applied by useRouteFocus.
   */
  static assertFocusOnAppContent() {
    KeyboardNavigationPage.appContent.should('have.class', 'fr-auto-focused');
    cy.focused().should('have.attr', 'id', 'appContent');
  }

  static assertAppContentNotFocused() {
    KeyboardNavigationPage.appContent.should('not.have.class', 'fr-auto-focused');
  }

  /**
   * Assert focus sits on the element with the given accessible name.
   */
  static assertFocusOnElement(name) {
    cy.focused().should('contain.text', name);
  }

  /**
   * Assert focus sits on the profile image button (aria-label "Update
   * Profile Picture", see EditProfile/index.vue).
   */
  static assertFocusOnProfileImage() {
    cy.focused().should('have.attr', 'aria-label', 'Update Profile Picture');
  }
}
