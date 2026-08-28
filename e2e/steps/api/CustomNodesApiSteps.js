/**
 * Copyright 2026 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

// The node-designer/node-type endpoint is registered without a realm-config
// prefix in the Vue call site (packages/platform-admin/src/api/CustomNodesApi.js).
// AM routes it to the alpha realm on Cloud (or root on ForgeOps) via server-side
// resolution, so we hit the same path from the API steps.
const nodeTypeUrl = () => `https://${Cypress.env('FQDN')}/am/json/node-designer/node-type`;

const defaultHeaders = {
  'content-type': 'application/json',
  // Match the Accept-API-Version used by the Vue call site
  // (packages/platform-admin/src/api/CustomNodesApi.js). AM returns 400 with
  // "No values provided for a request parameter." when this is missing.
  'Accept-API-Version': 'resource=1.0',
};

export default class CustomNodesApiSteps {
  /**
   * Create a custom node via the AM node-designer API. Nodes are intentionally
   * NOT tracked or cleaned up — a direct `DELETE /am/json/node-designer/node-
   * type/{id}` leaves orphan entries in `authenticationtrees/nodes` that
   * corrupt the realm's node-type registry (subsequent `listLatestTypes`
   * calls return 500 "Could not get service schema"). The generated `_id`
   * (`e2e...`) and the `displayName` (which will be prefixed with `e2e ` by
   * callers) mark every node this suite creates so it can be located and
   * purged manually.
   * @param {string} displayName human-friendly node name
   * @param {object} overrides partial node body merged on top of the default template
   * @returns {Cypress.Chainable<string>} resolves to the generated node id
   */
  static createCustomNode(displayName, overrides = {}) {
    const nodeId = `e2e${Cypress._.random(Number.MAX_SAFE_INTEGER).toString(36)}`.toLowerCase();
    const body = {
      serviceName: nodeId,
      displayName,
      description: '',
      inputs: [],
      outputs: [],
      outcomes: ['outcome'],
      script: 'outcome="outcome";',
      tags: [],
      properties: {},
      ...overrides,
    };
    // Use POST to mirror what CreateEditCustomNode.vue does — this triggers
    // AM to register the new type in the authentication tree node registry
    // (listLatestTypes), making the node appear in the Journey editor sidebar.
    // PUT to node-designer/node-type/{id} only writes to the custom-node store,
    // not to the auth-tree registry, so the Journey editor never sees it.
    return cy.request({
      method: 'POST',
      url: nodeTypeUrl(),
      headers: defaultHeaders,
      body,
    }).then((response) => {
      expect(response.status).to.be.oneOf([200, 201]);
      return response.body._id || nodeId;
    });
  }
}
