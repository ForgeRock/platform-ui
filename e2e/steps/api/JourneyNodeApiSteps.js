/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { getAMResource, putAMResource } from '@e2e/api/journeyApi.e2e';

const amRealmConfig = Cypress.env('IS_FRAAS')
  ? '/realms/root/realms/alpha/realm-config/'
  : '/realms/root/realm-config/';

export default class JourneyNodeApiSteps {
  /**
   * Toggles the "Validate username" (validateInput) setting on every Platform
   * Username (ValidatedUsernameNode) node inside a journey via the AM trees/
   * nodes config API. Requires an active admin session.
   * @param {String} journeyName name of the tree containing the nodes
   * @param {Boolean} validate whether username input validation is enabled
   */
  static setJourneyUsernameValidation(journeyName, validate) {
    return getAMResource(
      amRealmConfig,
      'authentication/authenticationtrees/trees',
      journeyName,
    ).then((treeResponse) => {
      const pageNodeIds = Object.entries(treeResponse.body.nodes)
        .filter(([, node]) => node.nodeType === 'PageNode')
        .map(([nodeId]) => nodeId);

      return cy.wrap(pageNodeIds).each((pageNodeId) => {
        getAMResource(
          amRealmConfig,
          'authentication/authenticationtrees/nodes/PageNode',
          pageNodeId,
        ).then((pageNodeResponse) => {
          (pageNodeResponse.body.nodes || [])
            .filter((childNode) => childNode.nodeType === 'ValidatedUsernameNode')
            .forEach((childNode) => {
              getAMResource(
                amRealmConfig,
                'authentication/authenticationtrees/nodes/ValidatedUsernameNode',
                childNode._id,
              ).then((usernameNodeResponse) => {
                const nodeConfig = {
                  ...usernameNodeResponse.body,
                  validateInput: validate,
                };
                delete nodeConfig._rev;
                putAMResource(
                  amRealmConfig,
                  'authentication/authenticationtrees/nodes/ValidatedUsernameNode',
                  childNode._id,
                  nodeConfig,
                );
              });
            });
        });
      });
    });
  }
}
