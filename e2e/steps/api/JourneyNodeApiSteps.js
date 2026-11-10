/**
 * Copyright 2026 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

import { getAMResource, putAMResource, putTreeNode } from '@e2e/api/journeyApi.e2e';

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

  /**
   * Adds a managed-user property to every Attribute Collector node in a
   * journey (top level and inside PageNodes), marked required so the UI
   * renders the asterisk. Only use on throwaway/cloned journeys — the nodes
   * are not restored; cleanup deletes the whole tree via
   * JourneyApiSteps.deleteCreatedJourneys().
   * @param {string} journeyName name of the tree containing the nodes
   * @param {string} propertyName managed object property to collect as required
   */
  static addRequiredAttributeCollectorProperty(journeyName, propertyName) {
    return getAMResource(
      amRealmConfig,
      'authentication/authenticationtrees/trees',
      journeyName,
    ).then((treeResponse) => {
      const { nodes } = treeResponse.body;
      const directAcnIds = Object.entries(nodes)
        .filter(([, node]) => node.nodeType === 'AttributeCollectorNode')
        .map(([nodeId]) => nodeId);
      const pageNodeIds = Object.entries(nodes)
        .filter(([, node]) => node.nodeType === 'PageNode')
        .map(([nodeId]) => nodeId);

      return cy.wrap(pageNodeIds).each((pageNodeId) => {
        getAMResource(
          amRealmConfig,
          'authentication/authenticationtrees/nodes/PageNode',
          pageNodeId,
        ).then((pageNodeResponse) => {
          const childAcnIds = (pageNodeResponse.body.nodes || [])
            .filter((childNode) => childNode.nodeType === 'AttributeCollectorNode')
            .map((childNode) => childNode._id);
          return cy.wrap(childAcnIds).each((acnId) => {
            JourneyNodeApiSteps.updateAttributeCollectorNode(acnId, propertyName);
          });
        });
      }).then(() => cy.wrap(directAcnIds).each((acnId) => {
        JourneyNodeApiSteps.updateAttributeCollectorNode(acnId, propertyName);
      })).then(() => {
        // Re-save the tree — the journey engine otherwise rejects node-only
        // edits with 401 "Login failure" at start
        const treeBody = { ...treeResponse.body };
        delete treeBody._rev;
        putAMResource(
          amRealmConfig,
          'authentication/authenticationtrees/trees',
          journeyName,
          treeBody,
        );
      });
    });
  }

  /**
   * PUTs a single Attribute Collector node with propertyName appended to
   * `attributesToCollect` and `required` set to true, via the v3 nodes API
   * (putTreeNode).
   * @param {string} acnId Attribute Collector node id
   * @param {string} propertyName managed object property to collect as required
   */
  static updateAttributeCollectorNode(acnId, propertyName) {
    return getAMResource(
      amRealmConfig,
      'authentication/authenticationtrees/nodes/AttributeCollectorNode',
      acnId,
    ).then((acnResponse) => {
      if ((acnResponse.body.attributesToCollect || []).includes(propertyName)) {
        // Already collected — keeps the outer retry idempotent
        return null;
      }
      const nodeConfig = {
        ...acnResponse.body,
        attributesToCollect: [
          ...(acnResponse.body.attributesToCollect || []),
          propertyName,
        ],
        required: true,
      };
      delete nodeConfig._rev;
      const nodeVersion = acnResponse.body._type?.version || '1.0';
      return putTreeNode('AttributeCollectorNode', nodeVersion, acnId, nodeConfig);
    });
  }

  /**
   * Polls the anonymous authenticate endpoint until the journey actually
   * starts: a freshly created managed property can 401 "Login failure" until
   * AM's IDM schema cache refreshes. Returns the probe chain and fails when
   * retries are exhausted instead of silently passing.
   * @param {string} journeyName name of the journey to probe
   * @param {number} maxRetries probe attempts (default 30, 10s apart)
   * @param {string} expectedProperty optional managed property to wait for in AM callbacks
   */
  static waitForJourneyReady(journeyName, maxRetries = 30, expectedProperty) {
    const realmPath = Cypress.env('IS_FRAAS') ? '/realms/root/realms/alpha' : '/realms/root';
    const authUrl = `https://${Cypress.env('FQDN')}/am/json${realmPath}/authenticate?authIndexType=service&authIndexValue=${encodeURIComponent(journeyName)}`;
    const probe = (retries) => cy.request({
      method: 'POST',
      url: authUrl,
      headers: {
        'content-type': 'application/json',
        'Accept-API-Version': 'protocol=1.0,resource=2.0',
      },
      body: {},
      failOnStatusCode: false,
    }).then((response) => {
      const expectedPropertyPresent = !expectedProperty || (response.body?.callbacks || []).some((callback) => (
        (callback.output || []).some(({ name, value }) => name === 'name' && value === expectedProperty)
      ));
      const journeyStarted = response.status === 200 && !!response.body?.authId && expectedPropertyPresent;
      if (journeyStarted) return response;
      if (retries <= 0) {
        throw new Error(`Journey ${journeyName} did not start after ${maxRetries} probes (last HTTP ${response.status}: ${String(response.body?.message || '')})`);
      }
      // eslint-disable-next-line cypress/no-unnecessary-waiting
      return cy.wait(10000).then(() => probe(retries - 1));
    });
    return probe(maxRetries);
  }
}
