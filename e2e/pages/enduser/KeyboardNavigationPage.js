/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

/**
 * Selectors and raw keyboard interactions for keyboard-navigation testing of
 * the enduser layout (see packages/platform-shared/src/composables/useRouteFocus.js).
 * Focus assertions live in the spec.
 */
export default class KeyboardNavigationPage {
  static get appContent() {
    return cy.get('main#appContent');
  }

  static get skipLink() {
    return cy.get('[data-testid="link-skip-to-main-content"]');
  }

  static pressTab() {
    return cy.realPress('Tab');
  }

  static pressEnter() {
    return cy.realPress('Enter');
  }

  /**
   * Blur the active element so the next Tab starts from the top of the page
   * (without pointer events, which would suppress the visible focus indicator).
   */
  static resetFocusToBody() {
    return cy.document().then((doc) => {
      if (doc.activeElement && doc.activeElement !== doc.body) {
        doc.activeElement.blur();
      }
    });
  }
}
