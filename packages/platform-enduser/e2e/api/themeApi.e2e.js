/**
 * Copyright (c) 2021 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

/**
* Sets theme back to just Starter Theme
*/
// eslint-disable-next-line import/prefer-default-export
export function setBaseTheme(accessToken = Cypress.env('ACCESS_TOKEN').access_token) {
  return cy.request({
    method: 'PUT',
    url: `https://${Cypress.env('FQDN')}/openidm/config/ui/themerealm`,
    headers: {
      authorization: `Bearer ${accessToken}`,
      'content-type': 'application/json;charset=utf-8',
    },
    body: {
      _id: 'ui/themerealm',
      realm: {
        '/': [
          {
            accountPageSections: {
              personalInformation: { enabled: true },
              accountSecurity: {
                enabled: true,
                subsections: {
                  username: { enabled: true },
                  password: { enabled: true },
                  twoStepVerification: { enabled: true },
                  securityQuestions: { enabled: true },
                },
              },
              social: { enabled: false },
              trustedDevices: { enabled: true },
              oauthApplications: { enabled: false },
              preferences: { enabled: false },
              consent: { enabled: false },
              accountControls: { enabled: true },
            },
            backgroundColor: '#f6f8fa',
            backgroundImage: '',
            buttonRounded: 5,
            linkActiveColor: '#0c85cf',
            linkColor: '#109cf1',
            logo: '',
            logoAltText: '',
            logoHeight: '40',
            logoProfile: '',
            logoProfileAltText: '',
            logoProfileCollapsed: '',
            logoProfileCollapsedAltText: '',
            logoProfileCollapsedHeight: '40',
            logoProfileHeight: '40',
            primaryColor: '#109cf1',
            primaryOffColor: '#0c85cf',
            profileBackgroundColor: '#ffffff',
            profileMenuHighlightColor: '#e4f4fd',
            profileMenuTextHighlightColor: '#455469',
            textColor: '#ffffff',
            name: 'Starter Theme',
            isDefault: true,
          },
        ],
      },
    },
  });
}
