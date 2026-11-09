/**
 * Copyright 2025 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

/**
 * Creates a new application via API
 * @param {Object} applicationData - The application data to be created
 * @param {string} accessToken - Optional access token, defaults to environment ACCESS_TOKEN
 * @returns {Cypress.Chainable} The response from the create application request
 */

export default function createApplication(applicationData, accessToken = Cypress.env('ACCESS_TOKEN').access_token) {
  const applicationResource = Cypress.env('IS_FRAAS') ? 'alpha_application' : 'application';
  return cy.request({
    method: 'POST',
    url: `https://${Cypress.env('FQDN')}/openidm/managed/${applicationResource}?_action=create`,
    headers: {
      authorization: `Bearer ${accessToken}`,
      'content-type': 'application/json',
    },
    body: applicationData,
  });
}

/**
 * Deletes an application via API
 * @param {string} applicationId - The application ID to delete
 * @param {string} accessToken - Optional access token, defaults to environment ACCESS_TOKEN
 * @returns {Cypress.Chainable} The response from the delete application request
 */
export function deleteApplication(applicationId, accessToken = Cypress.env('ACCESS_TOKEN').access_token) {
  const applicationResource = Cypress.env('IS_FRAAS') ? 'alpha_application' : 'application';
  return cy.request({
    method: 'DELETE',
    url: `https://${Cypress.env('FQDN')}/openidm/managed/${applicationResource}/${applicationId}`,
    headers: {
      authorization: `Bearer ${accessToken}`,
      'content-type': 'application/json',
    },
    failOnStatusCode: false,
  });
}

/**
 * Gets an application via API
 * @param {string} applicationId - The application ID to get
 * @param {string} accessToken - Optional access token, defaults to environment ACCESS_TOKEN
 * @returns {Cypress.Chainable} The response from the get application request
 */
export function getApplication(applicationId, accessToken = Cypress.env('ACCESS_TOKEN').access_token) {
  const applicationResource = Cypress.env('IS_FRAAS') ? 'alpha_application' : 'application';
  return cy.request({
    method: 'GET',
    url: `https://${Cypress.env('FQDN')}/openidm/managed/${applicationResource}/${applicationId}`,
    headers: {
      authorization: `Bearer ${accessToken}`,
      'content-type': 'application/json',
    },
    failOnStatusCode: false,
  });
}

/**
 * Creates an OAuth2 client in AM
 * @param {string} clientId - The OAuth2 client ID
 * @param {string} clientName - The display name for the client
 * @returns {Cypress.Chainable} The response from the create OAuth2 client request
 */
export function createOAuth2Client(clientId, clientName) {
  const realm = Cypress.env('IS_FRAAS') ? '/realms/alpha' : '';
  return cy.request({
    method: 'PUT',
    url: `https://${Cypress.env('FQDN')}/am/json/realms/root${realm}/realm-config/agents/OAuth2Client/${clientId}`,
    headers: {
      'content-type': 'application/json',
      'Accept-API-Version': 'protocol=2.1,resource=1.0',
    },
    body: {
      coreOAuth2ClientConfig: {
        redirectionUris: [],
        scopes: ['openid'],
        defaultScopes: [],
        clientType: 'Public',
        authorizationCodeLifetime: 120,
        accessTokenLifetime: 3600,
        refreshTokenLifetime: 604800,
        clientName: [clientName],
      },
      advancedOAuth2ClientConfig: {
        grantTypes: ['authorization_code', 'refresh_token'],
        responseTypes: ['code', 'token', 'id_token'],
        treeName: '[Empty]',
        tokenEndpointAuthMethod: 'client_secret_basic',
        isConsentImplied: true,
        subjectType: 'public',
      },
      coreOpenIDClientConfig: {
        defaultMaxAge: 600,
        jwtTokenLifetime: 3600,
      },
      signEncOAuth2ClientConfig: {
        userinfoResponseFormat: 'JSON',
        tokenIntrospectionResponseFormat: 'JSON',
        publicKeyLocation: 'jwks_uri',
      },
    },
  });
}

/**
 * Patches an application via API with an if-match revision guard
 * @param {string} applicationId - The application ID to patch
 * @param {Array} body - The JSON patch operations
 * @param {string} ifMatchRev - The _rev the patch applies to
 * @param {Object} [options]
 * @param {boolean} [options.failOnStatusCode] - Whether non-2xx responses fail the test (default true)
 * @returns {Cypress.Chainable} The response from the patch application request
 */
export function patchApplication(applicationId, body, ifMatchRev, { failOnStatusCode = true } = {}) {
  const applicationResource = Cypress.env('IS_FRAAS') ? 'alpha_application' : 'application';
  return cy.request({
    method: 'PATCH',
    url: `https://${Cypress.env('FQDN')}/openidm/managed/${applicationResource}/${applicationId}`,
    headers: {
      authorization: `Bearer ${Cypress.env('ACCESS_TOKEN').access_token}`,
      'content-type': 'application/json',
      'if-match': ifMatchRev,
    },
    body,
    failOnStatusCode,
  });
}

/**
 * Lists an application's owners — the owners relationship sub-resource the UI
 * also reads (the plain application GET does not return relationship fields).
 * @param {string} applicationId - The application ID
 * @returns {Cypress.Chainable} The response from the owners list request
 */
export function getApplicationOwners(applicationId) {
  const applicationResource = Cypress.env('IS_FRAAS') ? 'alpha_application' : 'application';
  return cy.request({
    method: 'GET',
    url: `https://${Cypress.env('FQDN')}/openidm/managed/${applicationResource}/${applicationId}/owners?_queryFilter=true`,
    headers: {
      authorization: `Bearer ${Cypress.env('ACCESS_TOKEN').access_token}`,
      'content-type': 'application/json',
    },
  });
}

/**
 * Gets an OAuth2 client from AM
 * @param {string} clientId - The OAuth2 client ID
 * @returns {Cypress.Chainable} The response from the get OAuth2 client request
 */
export function getOAuth2Client(clientId) {
  const realm = Cypress.env('IS_FRAAS') ? '/realms/alpha' : '';
  return cy.request({
    method: 'GET',
    url: `https://${Cypress.env('FQDN')}/am/json/realms/root${realm}/realm-config/agents/OAuth2Client/${clientId}`,
    headers: {
      'content-type': 'application/json',
      'Accept-API-Version': 'protocol=2.1,resource=1.0',
    },
    failOnStatusCode: false,
  });
}

/**
 * Deletes an OAuth2 client in AM
 * @param {string} clientId - The OAuth2 client ID to delete
 * @returns {Cypress.Chainable} The response from the delete OAuth2 client request
 */
export function deleteOAuth2Client(clientId) {
  const realm = Cypress.env('IS_FRAAS') ? '/realms/alpha' : '';
  return cy.request({
    method: 'DELETE',
    url: `https://${Cypress.env('FQDN')}/am/json/realms/root${realm}/realm-config/agents/OAuth2Client/${clientId}`,
    headers: {
      'content-type': 'application/json',
      'Accept-API-Version': 'protocol=2.1,resource=1.0',
    },
    failOnStatusCode: false,
  });
}

/**
 * Lists the scheduled reconciliation jobs derived from an application name — the same
 * query the Jobs page issues for a provisioner-created app. Connecting a provisioner
 * creates schedules named <ConnectorName>FullRecon / <...>IncrementalRecon, where the
 * connector name derives from the application name with [\s-_] stripped, so the filter
 * matches jobs whose id CONTAINS the application name.
 * @param {string} appName - The application name the provisioner was created from
 * @param {string} accessToken - Optional access token, defaults to environment ACCESS_TOKEN
 * @returns {Cypress.Chainable} The response with `result` array of scheduled jobs
 */
export function getReconJobsForApp(appName, accessToken = Cypress.env('ACCESS_TOKEN').access_token) {
  // Provisioner schedules are named <ConnectorName>FullRecon / <...>IncrementalRecon,
  // where the connector name derives from the app name (ScheduleEditorModal.getScheduleName),
  // so match jobs CONTAINING the app name rather than prefix-matching it
  const queryFilter = `(_id co '${appName}') and persisted eq true and (schedule pr or type eq 'simple') and (invokeContext/action/ eq 'liveSync' or invokeContext/action/ eq 'reconcile')`;
  return cy.request({
    method: 'GET',
    url: `https://${Cypress.env('FQDN')}/openidm/scheduler/job?_queryFilter=${encodeURIComponent(queryFilter)}`,
    headers: {
      authorization: `Bearer ${accessToken}`,
    },
  });
}

/**
 * Deletes the provisioner connector config (config/system/<connectorName>) and the
 * mappings (config/mapping/...) created by connecting an application's provisioner —
 * artifacts the UI's own delete flows never remove. The connector name derives from
 * the application name with [\s-_] stripped (configurePageName in Provisioning/index.vue).
 * @param {string} appName - Name of the application the provisioner was created from
 * @param {string} accessToken - Optional access token, defaults to environment ACCESS_TOKEN
 * @returns {Cypress.Chainable} The responses of the delete requests
 */
export function deleteProvisionerConfig(appName, accessToken = Cypress.env('ACCESS_TOKEN').access_token) {
  const connectorPrefix = appName.replace(/[\s-_]/g, '');
  return cy.request({
    method: 'GET',
    url: `https://${Cypress.env('FQDN')}/openidm/config`,
    headers: {
      authorization: `Bearer ${accessToken}`,
    },
  }).then((response) => {
    const pids = (response.body.configurations ?? []).map((configuration) => configuration.pid);
    const connectorPids = pids.filter((pid) => pid.startsWith('system/') && pid.includes(connectorPrefix));
    // Mappings are named system<Connector><ObjectType>_managed<Resource> /
    // managed<Resource>_system<Connector><ObjectType> (getMappingNames in
    // defaultAccountNaoMappings.js) — both contain the connector name
    const mappingPids = connectorPids.flatMap((connectorPid) => {
      const connectorName = connectorPid.slice('system/'.length);
      return pids.filter((pid) => pid.startsWith('mapping/') && pid.includes(`system${connectorName}`));
    });
    return cy.wrap([...connectorPids, ...mappingPids]).each((pid) => cy.request({
      method: 'DELETE',
      url: `https://${Cypress.env('FQDN')}/openidm/config/${pid}`,
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
      failOnStatusCode: false,
    }));
  });
}

/**
 * Creates an AIC (AdvancedIdentityCloud) catalog application, the same way the UI's
 * catalog wizard saves it: templateName is the template's id ('aic'), and no
 * provisioning fields — those derive from the template on the edit page.
 * @param {Object} applicationData
 * @param {string} applicationData.name - Application name
 * @param {string} applicationData.ownerId - User id set as the application owner
 * @param {string} accessToken - Optional access token, defaults to environment ACCESS_TOKEN
 * @returns {Cypress.Chainable} The response with the created application (body._id)
 */
export function createAicApplication({ name, ownerId }, accessToken = Cypress.env('ACCESS_TOKEN').access_token) {
  const applicationResource = Cypress.env('IS_FRAAS') ? 'alpha_application' : 'application';
  const userResource = Cypress.env('IS_FRAAS') ? 'alpha_user' : 'user';
  return cy.request({
    method: 'POST',
    url: `https://${Cypress.env('FQDN')}/openidm/managed/${applicationResource}?_action=create`,
    headers: {
      authorization: `Bearer ${accessToken}`,
      'content-type': 'application/json',
    },
    body: {
      name,
      description: `E2E ${name}`,
      owners: [{ _ref: `managed/${userResource}/${ownerId}`, _refProperties: {} }],
      templateName: 'aic',
      templateVersion: '1.0',
      authoritative: false,
    },
  });
}
