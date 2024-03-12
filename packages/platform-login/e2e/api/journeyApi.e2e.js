/**
 * Copyright (c) 2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

// AM API
export function deleteAMResource(realm = Cypress.env('IS_FRAAS') ? '/alpha/' : '', resource = 'authentication/authenticationtrees/trees', id) {
  return cy.request({
    method: 'DELETE',
    url: `https://${Cypress.env('FQDN')}/am/json${realm}${resource}/${id}`,
    headers: {
      'content-type': 'application/json',
      'Accept-API-Version': 'protocol=2.1,resource=1.0',
    },
  });
}

export function deleteAMJourney(id) {
  return deleteAMResource(Cypress.env('IS_FRAAS') ? '/realms/root/realms/alpha/realm-config/' : '/realms/root/realm-config/', 'authentication/authenticationtrees/trees', id);
}

export function deleteAMScript(id) {
  return deleteAMResource(Cypress.env('IS_FRAAS') ? '/alpha/' : '/', 'scripts', id);
}

export function deleteAMSocialProviderNode(id) {
  return deleteAMResource(Cypress.env('IS_FRAAS') ? '/realms/root/realms/alpha/realm-config/' : '/realms/root/realm-config/', 'services/SocialIdentityProviders/oidcConfig', id);
}

// IDM API
export function getIDMResource(resourceType = 'managed', resourceName, accessToken = Cypress.env('ACCESS_TOKEN').access_token) {
  return cy.request({
    method: 'GET',
    url: `https://${Cypress.env('FQDN')}/openidm/${resourceType}/${resourceName}`,
    headers: {
      authorization: `Bearer ${accessToken}`,
      'content-type': 'application/json',
    },
  });
}

export function updateIDMResource(resourceType = 'managed', resourceName, body, accessToken = Cypress.env('ACCESS_TOKEN').access_token) {
  return cy.request({
    method: 'PUT',
    url: `https://${Cypress.env('FQDN')}/openidm/${resourceType}/${resourceName}`,
    headers: {
      authorization: `Bearer ${accessToken}`,
      'content-type': 'application/json',
    },
    body,
  });
}

export function deleteIDMResource(resourceType = 'managed', resourceName, id, accessToken = Cypress.env('ACCESS_TOKEN').access_token) {
  return cy.request({
    method: 'DELETE',
    url: `https://${Cypress.env('FQDN')}/openidm/${resourceType}/${resourceName}/${id}`,
    headers: {
      authorization: `Bearer ${accessToken}`,
    },
  });
}

export function deleteIDMUser(id) {
  return deleteIDMResource('managed', Cypress.env('IS_FRAAS') ? 'alpha_user' : 'user', id);
}

export function getIDMThemes() {
  return getIDMResource('config/ui', 'themerealm');
}

export function updateIDMThemes(themes) {
  return updateIDMResource('config/ui', 'themerealm', themes);
}

export function deleteIDMTheme(id, retry = 0) {
  if (retry > 5) {
    throw new Error('Max retries reached!');
  }

  const realm = Cypress.env('IS_FRAAS') ? 'alpha' : '/';

  // First need to get all Themes
  return getIDMThemes().then((response) => {
    // Now find and delete Theme
    const themes = response.body;
    themes.realm[realm] = themes.realm[realm].filter((elem) => elem.name !== id);

    // Upload modified Themes list
    updateIDMThemes(themes);

    // Make sure theme was uploaded successfully
    getIDMThemes().then((checkResponse) => {
      checkResponse.body.realm[realm].forEach((theme) => {
        if (theme.name.includes(id)) {
          // Retry to delete Theme
          deleteIDMTheme(id, retry + 1);
        }
      });
    });
  });
}

export function deleteIDMEmailTemplate(id) {
  return deleteIDMResource('config', 'emailTemplate', id);
}
