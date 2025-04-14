/**
 * Copyright 2023 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

/**
 * Creates a template override based on the enterprise csv template in IDM config
 * @param {String} templateName the name to use for the template
 * @param {String} templateVersion the version to use for the template
 * @param {*} accessToken the access token to use for the request
 * @returns a Cypress request object
 */
export function createTestTemplateOverride(templateName, templateVersion, accessToken = Cypress.env('ACCESS_TOKEN').access_token) {
  return cy.request({
    method: 'PUT',
    url: `https://${Cypress.env('FQDN')}/openidm/config/appTemplate/${templateName}`,
    headers: {
      authorization: `Bearer ${accessToken}`,
      'content-type': 'application/json',
    },
    body: {
      _id: `appTemplate/${templateName}`,
      displayName: templateName,
      templateVersion,
      id: templateName,
      connectorDisplayName: 'CSV File Connector',
      bundleVersion: '1.5.20.11',
      templateType: 'Enterprise',
      image: 'csv.svg',
      dateUpdated: '12-16-2022',
      description: 'The CSV file application is useful when importing users, either for initial provisioning or for ongoing updates.',
      supportUrl: 'https://backstage.forgerock.com/docs/idm/7.1/connector-reference/chap-csv.html',
      categories: ['Uncategorized'],
      latest: true,
      capabilities: {
        provisioning: {
          Create: true,
          Read: true,
          Update: true,
          Delete: true,
        },
      },
      schema: {
        applicationDetails: [
          [
            {
              model: 'coreOAuth2ClientConfig.clientName',
              label: 'Name',
              description: 'Human-readable name for your application. You can change the name later in the application settings.',
              type: 'string',
              saveFormat: 'array',
              validation: { required: true, alpha_dash_spaces: true },
            },
          ],
          [
            {
              model: 'advancedOAuth2ClientConfig.descriptions',
              label: 'Description',
              description: '',
              type: 'string',
              saveFormat: 'array',
            },
          ],
          [
            {
              model: 'applicationManagedObject.owners',
              label: 'Application Owners',
              customSlot: 'application-owners',
              type: 'multiselect',
              validation: { required: true },
            },
          ],
          [
            {
              columns: 2,
              columnClass: 'mb-3 pr-0 border-left border-top border-bottom',
              customSlot: 'logo',
              model: 'custom',
            },
            {
              columns: 10,
              columnClass: 'mb-3 pt-3 pr-lg-3 border-right border-top border-bottom',
              label: 'App Logo URI',
              description: 'Application logo URI for use in user-facing UIs such as consent pages and application pages.',
              model: 'advancedOAuth2ClientConfig.logoUri',
              type: 'string',
            },
          ],
          [
            {
              model: 'applicationManagedObject.authoritative',
              label: 'Authoritative',
              description: 'blah',
              type: 'boolean',
              default: false,
              isHtml: true,
            },
          ],
        ],
        provisioning: {
          defaultValues: {
            headerUid: 'uid',
            headerPassword: 'password',
            quoteCharacter: '\'',
            fieldDelimiter: ',',
            newlineString: '\n',
            spaceReplacementString: '_',
            syncFileRetentionCount: 3,
          },
        },
      },
    },
  });
}

/**
 * Deletes an app template override from IDM config
 * @param {*} templateName the name of the template to delete
 * @param {*} accessToken the access token to use for the request
 * @returns a Cypress request object
 */
export function deleteTemplateOverride(templateName, accessToken = Cypress.env('ACCESS_TOKEN').access_token) {
  return cy.request({
    method: 'DELETE',
    url: `https://${Cypress.env('FQDN')}/openidm/config/appTemplate/${templateName}`,
    headers: {
      authorization: `Bearer ${accessToken}`,
    },
  });
}
