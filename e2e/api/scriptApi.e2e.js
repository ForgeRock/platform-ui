/**
 * Copyright 2021-2024 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

const scriptRealmUrl = Cypress.env('IS_FRAAS') ? '/alpha' : '';

/**
 * Encode an AM script
 */
export function encodeScript(script) {
  return btoa(unescape(encodeURIComponent(script)));
}

/**
 * Creates an AM script
 */
export function createScript({
  name,
  description = 'QA - Script for automation testing',
  context = 'AUTHENTICATION_TREE_DECISION_NODE',
  language = 'JAVASCRIPT',
  script = '',
  evaluatorVersion = '1.0', // Legacy: 1.0, Next Generation: 2.0
}) {
  let encodedScript = script;
  if (encodedScript !== '') {
    encodedScript = encodeScript(encodedScript);
  }

  return cy.request({
    method: 'POST',
    url: `https://${Cypress.env('FQDN')}/am/json${scriptRealmUrl}/scripts/?_action=create`,
    headers: {
      'content-type': 'application/json',
      'Accept-API-Version': 'protocol=2.0,resource=1.0',
    },
    body: {
      name,
      description,
      context,
      language,
      script: encodedScript,
      evaluatorVersion,
    },
  });
}

/**
 * Deletes an AM script
 */
export function deleteScript(scriptId) {
  return cy.request({
    method: 'DELETE',
    url: `https://${Cypress.env('FQDN')}/am/json${scriptRealmUrl}/scripts/${scriptId}`,
    headers: {
      'Accept-API-Version': 'protocol=2.0,resource=1.0',
    },
  });
}
