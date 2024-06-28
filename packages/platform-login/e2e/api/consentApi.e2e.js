/**
 * Copyright (c) 2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

const baseBody = {
  active: '0.0',
  versions: [
    {
      version: '0.0',
      termsTranslations: {
        en: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
      },
      createDate: '2019-10-28T04:20:11.320Z',
    },
  ],
};

/**
  * Reset Terms & Conditions to a default value
  */
export default function (reqBody = baseBody, accessToken = Cypress.env('ACCESS_TOKEN').access_token) {
  return cy.request({
    method: 'PUT',
    url: `https://${Cypress.env('FQDN')}/openidm/config/selfservice.terms`,
    headers: {
      authorization: `Bearer ${accessToken}`,
      'content-type': 'application/json',
    },
    body: reqBody,
  });
}
