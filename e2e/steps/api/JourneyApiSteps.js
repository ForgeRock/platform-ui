/**
 * Copyright 2026 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

import {
  cloneTree,
  createJourney,
  deleteAMResource,
  deleteIDMResource,
  deleteTreeNode,
  getAMResource,
  getTreeForExport,
} from '@e2e/api/journeyApi.e2e';
import { deleteThemes } from '@e2e/utils/themeutils';
import { journeyCleanupManager } from '@e2e/utils/manageJourneys';
import { generateJourneyFileName } from '@e2e/utils/journeyUtils';

export default class JourneyApiSteps {
  static createdJourneyNames = [];

  static createdEmailTemplateIds = [];

  static createdThemeNames = [];

  static importJourney(journey) {
    const alreadyImported = journeyCleanupManager.getAll().find((j) => j.name === journey.name);
    if (!alreadyImported) {
      const fileName = generateJourneyFileName(journey.name);
      cy.importTreesViaAPI([fileName]).then(() => {
        journeyCleanupManager.add({ name: journey.name, fileName });
      });
    }
  }

  static deleteImportedJourneys() {
    journeyCleanupManager.cleanup();
  }

  static interceptCreatedJourney() {
    cy.intercept('PUT', '**/authenticationtrees/trees/*', (req) => {
      req.continue((res) => {
        if (res.statusCode === 201) {
          JourneyApiSteps.createdJourneyNames.push(res.body._id);
        }
      });
    }).as('putJourney');
  }

  static interceptDuplicatedJourney() {
    cy.intercept('PUT', '**/authenticationtrees/trees/*', (req) => {
      req.continue((res) => {
        if (res.statusCode === 200) {
          JourneyApiSteps.createdJourneyNames.push(res.body._id);
        }
      });
    }).as('putJourney');
  }

  static createJourney(name, categories = []) {
    const identityResource = Cypress.env('IS_FRAAS') ? 'managed/alpha_user' : 'managed/user';
    return createJourney(name, identityResource, categories).then((response) => {
      JourneyApiSteps.createdJourneyNames.push(name);
      return response;
    });
  }

  /**
   * Clones an existing journey via the AM `_action=clone` trees endpoint (the
   * same call the admin UI's duplicate-journey flow makes) and tracks the clone
   * for deletion by deleteCreatedJourneys(). Retries on 412 — AM config-store
   * replication intermittently rejects clone writes with "Precondition Failed".
   * @param {string} sourceJourneyName name of the journey to duplicate
   * @param {string} newJourneyName name for the cloned journey
   * @param {number} [maxRetries=2] number of 412 retries, 30s apart
   * @returns {Cypress.Chainable<Object>} the successful clone response
   */
  static cloneJourney(sourceJourneyName, newJourneyName, maxRetries = 2) {
    const attempt = (n) => cloneTree(sourceJourneyName, newJourneyName).then((response) => {
      if (response.status === 412 && n > 0) {
        // eslint-disable-next-line cypress/no-unnecessary-waiting
        return cy.wait(30000).then(() => attempt(n - 1));
      }
      return response;
    });
    return attempt(maxRetries).then((response) => {
      if (!JourneyApiSteps.createdJourneyNames.includes(newJourneyName)) {
        JourneyApiSteps.createdJourneyNames.push(newJourneyName);
      }
      expect(response.status).to.equal(200);
      return response;
    });
  }

  /**
   * Delete every tracked journey the same way the admin UI does — read the
   * tree config, DELETE the tree, then DELETE every inner node it referenced,
   * plus the child sub-nodes of PageNode/CustomPageNode containers (those are
   * NOT in the tree's `nodes` map — they are only reachable by GETting the
   * container node), mirroring `deleteTreeAndNodes` in TreeManagementMixin.vue
   * so afterEach leaves behind no orphan nodes that would poison later tests.
   */
  static deleteCreatedJourneys() {
    const realm = Cypress.env('IS_FRAAS') ? '/realms/root/realms/alpha/' : '/realms/root/';
    const resource = 'realm-config/authentication/authenticationtrees/trees';
    return cy.wrap(null).then(() => {
      if (!JourneyApiSteps.createdJourneyNames.length) return cy.wrap(null);
      const names = [...JourneyApiSteps.createdJourneyNames];
      JourneyApiSteps.createdJourneyNames = [];
      return cy.wrap(names).each((name) => (
        getTreeForExport(name).then((treeResponse) => {
          const nodes = treeResponse?.body?.nodes || {};
          const containerNodeIds = Object.keys(nodes).filter(
            (nodeId) => ['PageNode', 'CustomPageNode'].includes(nodes[nodeId].nodeType),
          );
          // Child sub-nodes must be fetched BEFORE the tree is deleted —
          // container nodes are unreachable once their tree is gone
          const containerRealm = Cypress.env('IS_FRAAS')
            ? '/realms/root/realms/alpha/realm-config/'
            : '/realms/root/realm-config/';
          return cy.wrap(containerNodeIds).each((containerId) => {
            const containerNode = nodes[containerId];
            return getAMResource(
              containerRealm,
              'authentication/authenticationtrees/nodes',
              `${containerNode.nodeType}/${containerId}`,
              { failOnStatusCode: false },
            ).then((containerResponse) => (
              cy.wrap(containerResponse?.body?.nodes || []).each((subNode) => (
                deleteTreeNode(subNode.nodeType, subNode.version, subNode._id)
              ))
            ));
          }).then(() => deleteAMResource(realm, resource, name).then(() => (
            cy.wrap(Object.keys(nodes)).each((nodeId) => {
              const node = nodes[nodeId];
              return deleteTreeNode(node.nodeType, node.version, nodeId);
            })
          )));
        })
      ));
    });
  }

  /**
   * Delete every email template id tracked in `createdEmailTemplateIds`. Each entry
   * should be the bare template id (e.g. 'iam10883C3193Welcome') — NOT the prefixed
   * form 'emailTemplate/...'. Used by tests that import a fixture which creates a
   * brand-new email template so afterEach can roll the tenant back to a clean state.
   */
  static deleteCreatedEmailTemplates() {
    return cy.wrap(null).then(() => {
      if (!JourneyApiSteps.createdEmailTemplateIds.length) return cy.wrap(null);
      const ids = [...JourneyApiSteps.createdEmailTemplateIds];
      JourneyApiSteps.createdEmailTemplateIds = [];
      return cy.wrap(ids).each((id) => deleteIDMResource('config', 'emailTemplate', id));
    });
  }

  /**
   * Delete every theme name tracked in `createdThemeNames`. Used by tests that
   * import a fixture which creates a brand-new hosted-pages theme so afterEach
   * can roll the tenant back to a clean state. Themes live inside the single
   * `/openidm/config/ui/themerealm` doc, so deletion happens via a filter+PUT.
   */
  static deleteCreatedThemes() {
    return cy.wrap(null).then(() => {
      if (!JourneyApiSteps.createdThemeNames.length) return cy.wrap(null);
      const names = [...JourneyApiSteps.createdThemeNames];
      JourneyApiSteps.createdThemeNames = [];
      return deleteThemes(names);
    });
  }
}
