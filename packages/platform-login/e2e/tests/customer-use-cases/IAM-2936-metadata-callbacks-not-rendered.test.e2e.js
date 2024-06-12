/**
 * Copyright (c) 2023-2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { filterTests } from '../../../../../e2e/util';

const realm = Cypress.env('IS_FRAAS') ? 'alpha' : '/';

filterTests(['@forgeops', '@cloud'], () => {
  describe('IAM-2936 Metadata callbacks are not rendered', () => {
    const testTreeUrl = `${Cypress.config().baseUrl}/am/XUI/?realm=${realm}&authIndexType=service&authIndexValue=IAM-2936`;

    before(() => {
      // Login as admin and import the test Journey with scripts
      cy.importTreesViaAPI(['IAM-2936.json']);
      cy.logout();
    });

    after(() => {
      // Login as admin and delete test Journey with scripts
      cy.deleteTreesViaAPI(['IAM-2936.json']);
    });

    it('IAM-2936 other callbacks still render in a page node with a metadata callback', () => {
      cy.visit(testTreeUrl);

      cy.log('Check that TextOuput callback is still rendered');
      cy.findAllByText('Message Node Text', { timeout: 20000 }).should('exist');
    });
  });
});
