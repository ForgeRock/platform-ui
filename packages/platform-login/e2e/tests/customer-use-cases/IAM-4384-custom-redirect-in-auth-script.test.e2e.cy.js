/**
 * Copyright (c) 2023-2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { filterTests } from '../../../../../e2e/util';

const realm = Cypress.env('IS_FRAAS') ? 'alpha' : '/';

// TODO: Investigate and re-enable why this test is failing with 'forgeops'
filterTests(['@cloud'], () => {
  describe('IAM-4383 Login supports custom redirects in auth scripts', () => {
    const testTreeUrl = `${Cypress.config().baseUrl}/am/XUI/?realm=${realm}&authIndexType=service&authIndexValue=IAM-4384`;

    before(() => {
      // Login as admin and import test Journey with scripts
      cy.importTreesViaAPI(['IAM-4384.json']);
      cy.logout();
    });

    after(() => {
      // Login as admin and delete test Journey with scripts
      cy.deleteTreesViaAPI(['IAM-4384.json']);
    });

    it('IAM-4383 should resume trees using custom redirect flows correctly following a custom redirect where the tracking cookie is present', () => {
      cy.visit(testTreeUrl);

      cy.log('Check that the initial platform username node is shown and proceed');
      cy.findByLabelText('User Name', { timeout: 20000 }).should('exist');
      cy.findByRole('button', { name: 'Next' }).click();

      cy.log('Check URL to see that the UI has been redirected to an external site');
      cy.url().should('contain', 'nonce');
      cy.location().then((location) => {
        expect(location.origin).to.contain('webhook.site');
        expect(location.search).to.contain('nonce');

        const nonceValue = location.search.substring(1);
        const resumeUrl = `${testTreeUrl}&comingback=true&${nonceValue}`;
        cy.log(`Resuming original session at URL: ${resumeUrl}`);
        cy.visit(resumeUrl);

        cy.contains('Made it to true! No bug here').should('exist');
        cy.log('Tree resumed with the correct information!');
      });
    });
  });
});
