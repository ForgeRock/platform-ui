/**
 * Copyright 2026 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

const TEAMMEMBER_URL = () => `https://${Cypress.env('FQDN')}/openidm/managed/teammember`;

export default function deleteTeamMemberByEmail(email, accessToken = Cypress.env('ACCESS_TOKEN').access_token) {
  return cy.request({
    method: 'GET',
    url: `${TEAMMEMBER_URL()}?_queryFilter=mail+eq+"${email}"&_fields=_id`,
    headers: {
      authorization: `Bearer ${accessToken}`,
      'accept-api-version': 'resource=1.0',
    },
    failOnStatusCode: false,
  }).then((res) => {
    if (!res.body?.result?.length) return null;
    const id = res.body.result[0]._id;
    return cy.request({
      method: 'DELETE',
      url: `${TEAMMEMBER_URL()}/${id}`,
      headers: {
        authorization: `Bearer ${accessToken}`,
        'accept-api-version': 'resource=1.0',
      },
      failOnStatusCode: false,
    });
  });
}
