/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

export default class CspPage {
  static get enforcedPolicyTab() {
    return cy.findByRole('tab', { name: 'Enforced Policy' });
  }

  static get reportOnlyPolicyTab() {
    return cy.findByRole('tab', { name: 'Report Only Policy' });
  }
}
