/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

const CSP_REPORT_ONLY_URL = `https://${Cypress.env('FQDN')}/environment/content-security-policy/report-only`;

export function getDirectives(accessToken = Cypress.env('ACCESS_TOKEN').access_token) {
  return cy.request({
    method: 'GET',
    url: CSP_REPORT_ONLY_URL,
    headers: {
      authorization: `Bearer ${accessToken}`,
      'accept-api-version': 'protocol=1.0,resource=1.0',
    },
    retryOnStatusCodeFailure: true,
  });
}

export function addDirective(directiveName, sources, accessToken = Cypress.env('ACCESS_TOKEN').access_token) {
  return getDirectives(accessToken).then(({ body }) => {
    const updatedDirectives = {
      ...body.directives,
      [directiveName]: sources,
    };

    return cy.request({
      method: 'PUT',
      url: CSP_REPORT_ONLY_URL,
      headers: {
        authorization: `Bearer ${accessToken}`,
        'accept-api-version': 'protocol=1.0,resource=1.0',
        'content-type': 'application/json',
      },
      body: {
        active: body.active,
        directives: updatedDirectives,
      },
      retryOnStatusCodeFailure: true,
    });
  });
}

export function deleteDirectives(directiveNames, accessToken = Cypress.env('ACCESS_TOKEN').access_token) {
  return getDirectives(accessToken).then(({ body }) => {
    const cleanedDirectives = { ...body.directives };
    directiveNames.forEach((name) => { delete cleanedDirectives[name]; });

    return cy.request({
      method: 'PUT',
      url: CSP_REPORT_ONLY_URL,
      headers: {
        authorization: `Bearer ${accessToken}`,
        'accept-api-version': 'protocol=1.0,resource=1.0',
        'content-type': 'application/json',
      },
      body: {
        active: body.active,
        directives: cleanedDirectives,
      },
      retryOnStatusCodeFailure: true,
    });
  });
}

export function setActivationStatus(active, accessToken = Cypress.env('ACCESS_TOKEN').access_token) {
  return getDirectives(accessToken).then(({ body }) => cy.request({
    method: 'PUT',
    url: CSP_REPORT_ONLY_URL,
    headers: {
      authorization: `Bearer ${accessToken}`,
      'accept-api-version': 'protocol=1.0,resource=1.0',
      'content-type': 'application/json',
    },
    body: {
      active,
      directives: body.directives,
    },
    retryOnStatusCodeFailure: true,
  }));
}
