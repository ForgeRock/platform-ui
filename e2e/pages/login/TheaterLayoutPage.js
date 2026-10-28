/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

/**
 * POM for the theater-mode branch of the login journey layout
 * (Login/index.vue renders `main#callbacksPanel` containing
 * `.journey-card` when a theme sets `journeyTheaterMode: true` with a
 * non-card `journeyLayout`).
 * Selectors and raw scoping only — no assertions live here.
 */
export default class TheaterLayoutPage {
  static get callbacksPanel() {
    return cy.get('main#callbacksPanel');
  }

  static get journeyCard() {
    return cy.get('.journey-card');
  }
}
