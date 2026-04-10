/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

const CSP_REPORT_ONLY_URL = `https://${Cypress.env('FQDN')}/environment/content-security-policy/report-only`;
const CSP_ENFORCED_URL = `https://${Cypress.env('FQDN')}/environment/content-security-policy/enforced`;

export function getDirectives(isEnforced = false, accessToken = Cypress.env('ACCESS_TOKEN').access_token) {
  return cy.request({
    method: 'GET',
    url: isEnforced ? CSP_ENFORCED_URL : CSP_REPORT_ONLY_URL,
    headers: {
      authorization: `Bearer ${accessToken}`,
      'accept-api-version': 'protocol=1.0,resource=1.0',
    },
    retryOnStatusCodeFailure: true,
  });
}

export function addDirective(directiveName, sources, isEnforced = false, accessToken = Cypress.env('ACCESS_TOKEN').access_token) {
  return getDirectives(isEnforced, accessToken).then(({ body }) => {
    const updatedDirectives = {
      ...body.directives,
      [directiveName]: sources,
    };

    return cy.request({
      method: 'PUT',
      url: isEnforced ? CSP_ENFORCED_URL : CSP_REPORT_ONLY_URL,
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

export function deleteDirectives(directiveNames, isEnforced = false, accessToken = Cypress.env('ACCESS_TOKEN').access_token) {
  return getDirectives(isEnforced, accessToken).then(({ body }) => {
    const cleanedDirectives = { ...body.directives };
    directiveNames.forEach((name) => { delete cleanedDirectives[name]; });

    return cy.request({
      method: 'PUT',
      url: isEnforced ? CSP_ENFORCED_URL : CSP_REPORT_ONLY_URL,
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

export function setActivationStatus(active, isEnforced = false, accessToken = Cypress.env('ACCESS_TOKEN').access_token) {
  return getDirectives(isEnforced, accessToken).then(({ body }) => cy.request({
    method: 'PUT',
    url: isEnforced ? CSP_ENFORCED_URL : CSP_REPORT_ONLY_URL,
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
