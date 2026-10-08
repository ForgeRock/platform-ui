/**
 * Copyright 2026 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

/**
 * AM SAML2 entity provider helpers for e2e tests. The endpoints mirror what the
 * admin UI's Saml2Api calls (realm-config/saml2), but use cy.request with the
 * admin Bearer token because the root e2e folder cannot import the platform-admin
 * api module (its axios instance depends on the app's Vuex store).
 */

const realmPath = Cypress.env('IS_FRAAS') ? 'realms/root/realms/alpha/realm-config' : 'realms/root/realm-config';

function saml2EntityUrl(entityLocation, privateId = '') {
  return `https://${Cypress.env('FQDN')}/am/json/${realmPath}/saml2/${entityLocation}${privateId ? `/${privateId}` : ''}`;
}

const headers = () => ({
  authorization: `Bearer ${Cypress.env('ACCESS_TOKEN').access_token}`,
  'content-type': 'application/json',
  'Accept-API-Version': 'protocol=2.0,resource=1.0',
});

/**
 * Entity id the UI derives for an app's hosted IdP entity provider — must stay in
 * sync with SamlSignOn.setUpHostedEntity.
 * @param {string} appName - The application name
 * @returns {string} The hosted IdP entity id
 */
export function buildHostedEntityId(appName) {
  return `${appName.replace(/[\s-_]/g, '')}-IDP`;
}

/**
 * MetaAlias the UI derives for an app's hosted IdP entity provider — must stay in
 * sync with SamlSignOn.metaAlias.
 * @param {string} appName - The application name
 * @returns {string} The metaAlias
 */
export function buildMetaAlias(appName) {
  const metaAliasName = appName.replace(/\s/g, '');
  return Cypress.env('IS_FRAAS') ? `/alpha/${metaAliasName}` : `/${metaAliasName}`;
}

/**
 * The CDN base URL the UI's CdnApi uses (see getCdnBaseURL). The air-gapped and
 * dev-template variants are not used by e2e tenants.
 */
const CDN_BASE_URL = 'https://cdn.forgerock.com/platform/app-templates/';

/**
 * Load the latest SAML custom-application template from the CDN, mirroring the
 * UI's loadLatestAppTemplate: read index.json, pick the highest version of the
 * saml template.
 * @returns {Cypress.Chainable} Resolves to { template, templateVersion } — the
 *   parsed template object and the version string of its CDN path
 */
export function getLatestSamlTemplate() {
  return cy.request({
    method: 'GET',
    url: `${CDN_BASE_URL}index.json`,
  }).then((indexResponse) => {
    const samlPaths = indexResponse.body.filter((entry) => /\d+\.\d+-saml\.json$/.test(entry));
    const versionOf = (path) => path.split('/').pop().split('-')[0].split('.').map(Number);
    const compareVersions = (a, b) => {
      const [majorA, minorA] = versionOf(a);
      const [majorB, minorB] = versionOf(b);
      return (majorB - majorA) || (minorB - minorA);
    };
    const latestPath = samlPaths.sort(compareVersions)[0];
    const templateVersion = latestPath.split('/').pop().replace('-saml.json', '');
    return cy.request({
      method: 'GET',
      url: `${CDN_BASE_URL}${latestPath}`,
    }).then((templateResponse) => ({ template: templateResponse.body, templateVersion }));
  });
}

/**
 * Build the hosted IdP entity payload the Set Up SSO flow posts, from the same
 * CDN template the UI consumes, with the app-specific placeholders filled.
 * @param {string} appName - The application name
 * @returns {Cypress.Chainable} Resolves to { payload, templateVersion } — the
 *   filled hosted IdP payload and the template version it was built from
 */
export function buildHostedEntityPayload(appName) {
  return getLatestSamlTemplate().then(({ template, templateVersion }) => {
    const filled = JSON.stringify(template.sso.defaults.hostedIdp)
      .replace(/\{\{\s?entityId\s?\}\}/g, buildHostedEntityId(appName))
      .replace(/\{\{\s?metaAlias\s?\}\}/g, buildMetaAlias(appName))
      .replace(/\{\{\s?domain\s?\}\}/g, Cypress.env('FQDN'));
    return { payload: JSON.parse(filled), templateVersion };
  });
}

/**
 * Creates a hosted IdP entity provider the same way the Set Up SSO flow does
 * @param {Object} payload - The hosted IdP entity payload (see buildHostedEntityPayload)
 * @returns {Cypress.Chainable} The response from the create entity request
 */
export function createHostedSaml2Entity(payload) {
  // the UI's createSaml2Entity strips entityLocation before posting — mirror it
  const { entityLocation, ...body } = payload;
  return cy.request({
    method: 'POST',
    url: `${saml2EntityUrl('hosted')}?_action=create`,
    headers: headers(),
    body,
    failOnStatusCode: false,
  });
}

/**
 * Gets a SAML2 entity provider
 * @param {string} privateId - The private id of the entity
 * @param {string} entityLocation - 'hosted' or 'remote'
 * @returns {Cypress.Chainable} The response from the get entity request
 */
export function getSaml2Entity(privateId, entityLocation) {
  return cy.request({
    method: 'GET',
    url: saml2EntityUrl(entityLocation, privateId),
    headers: headers(),
    failOnStatusCode: false,
  });
}

/**
 * Gets the private id of the entity with the given entityId — mirrors the UI's
 * getSaml2PrivateId (query by entityId, first result's _id).
 * @param {string} entityId - The entity id to look up
 * @returns {Cypress.Chainable} Resolves to the entity's private id, or null when absent
 */
export function getSaml2PrivateId(entityId) {
  return cy.request({
    method: 'GET',
    url: `https://${Cypress.env('FQDN')}/am/json/${realmPath}/saml2?_queryFilter=entityId+eq+'${entityId}'`,
    headers: headers(),
    failOnStatusCode: false,
  }).then((response) => (response.body.result?.length ? response.body.result[0]._id : null));
}

/**
 * Imports a remote SP entity from metadata XML the same way the UI's upload does:
 * base64url-encoded XML (the UI's createRemoteEntityFromSamlXml) POSTed to
 * importEntity. updateType is left undefined on first upload (the UI only sends
 * it when the update-signing-certificate checkbox is enabled).
 * @param {string} xmlContent - The SP metadata XML
 * @param {string} [updateType] - 'CREATE' or 'UPDATE_CERTIFICATES'; omit on first import
 * @param {boolean} [skipMetadataSignatureVerification] - Bypass AM signature validation
 * @returns {Cypress.Chainable} The response from the importEntity request
 */
export function importRemoteSaml2Entity(xmlContent, updateType, skipMetadataSignatureVerification) {
  const base64EntityXML = btoa(xmlContent).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  const body = { standardMetadata: base64EntityXML };
  if (updateType) body.updateType = updateType;
  if (skipMetadataSignatureVerification !== undefined) body.skipMetadataSignatureVerification = skipMetadataSignatureVerification;
  return cy.request({
    method: 'POST',
    url: `${saml2EntityUrl('remote')}?_action=importEntity`,
    headers: headers(),
    body,
    failOnStatusCode: false,
  });
}

/**
 * Gets the FR_COT circle of trust
 * @returns {Cypress.Chainable} The response from the get circle of trust request
 */
export function getCircleOfTrust() {
  return cy.request({
    method: 'GET',
    url: `https://${Cypress.env('FQDN')}/am/json/${realmPath}/federation/circlesoftrust/FR_COT`,
    headers: headers(),
    failOnStatusCode: false,
  });
}

/**
 * Adds an entity to the FR_COT circle of trust — mirrors the UI's
 * updateCircleOfTrustProviders('add', entityId): read trustedProviders, prepend
 * the '<entityId>|saml2' pair when absent, PUT the circle back.
 * @param {string} entityId - The entity id to add as a trusted provider
 * @returns {Cypress.Chainable} The response from the circle of trust PUT
 */
export function addToCircleOfTrust(entityId) {
  const cotEntityId = `${entityId}|saml2`;
  return getCircleOfTrust().then((getResponse) => {
    const trustedProviders = getResponse.body.trustedProviders || [];
    if (trustedProviders.includes(cotEntityId)) {
      return cy.wrap(getResponse);
    }
    return cy.request({
      method: 'PUT',
      url: `https://${Cypress.env('FQDN')}/am/json/${realmPath}/federation/circlesoftrust/FR_COT`,
      headers: {
        ...headers(),
        'if-match': getResponse.body._rev,
      },
      body: {
        status: 'active',
        trustedProviders: [cotEntityId, ...trustedProviders],
      },
      failOnStatusCode: false,
    });
  });
}

/**
 * Deletes a SAML2 entity provider
 * @param {string} privateId - The private id of the entity
 * @param {string} entityLocation - 'hosted' or 'remote'
 * @returns {Cypress.Chainable} The response from the delete entity request
 */
export function deleteSaml2Entity(privateId, entityLocation) {
  return cy.request({
    method: 'DELETE',
    url: saml2EntityUrl(entityLocation, privateId),
    headers: headers(),
    failOnStatusCode: false,
  });
}
