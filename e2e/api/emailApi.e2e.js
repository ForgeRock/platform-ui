/**
 * Copyright 2021-2025 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

const body = {
  auth: { enable: true, username: 'username', password: 'password' },
  connectiontimeout: 30000,
  debug: false,
  from: 'test@email.com',
  host: 'smtp.gmail.com',
  port: 587,
  smtpProperties: [],
  ssl: { enable: false },
  starttls: { enable: true },
  threadPoolSize: 20,
  timeout: 30000,
  writetimeout: 30000,
  _id: 'external.email',
};

/**
 * Attempts to save email provider with provided config
 * @param {Object} config Contains form data to be saved
 */
export function putEmailProviderConfig(config, accessToken = Cypress.env('ACCESS_TOKEN')?.access_token) {
  return cy.request({
    method: 'PUT',
    url: `https://${Cypress.env('FQDN')}/openidm/config/external.email`,
    headers: {
      authorization: `Bearer ${accessToken}`,
      'content-type': 'application/json',
    },
    body: config,
    retryOnStatusCodeFailure: true,
  });
}

/**
 * Creates a list of email templates based on the provided template Ids
 * @param {string[]} templateIds List of template id's that will be created
 * @param {string} accessToken Access token to communicate with the API
 * @returns {Promise[]} A list of promises that will create all the required email templates
 */
export function createEmailTemplates(templateIds, accessToken = Cypress.env('ACCESS_TOKEN').access_token) {
  return templateIds.map((templateId) => cy.request({
    method: 'PUT',
    url: `https://${Cypress.env('FQDN')}/openidm/config/emailTemplate/${templateId}`,
    headers: {
      authorization: `Bearer ${accessToken}`,
      'content-type': 'application/json',
    },
    body: {
      _id: `emailTemplate/${templateId}`,
      defaultLocale: 'en',
      enabled: true,
      from: 'example@email.com',
      message: {
        en: '',
      },
      mimeType: 'text/html',
      subject: {
        en: '',
      },
      styles: '',
      displayName: `${templateId}`,
    },
  }));
}

export function createEmailTemplateWithData(templateData, accessToken = Cypress.env('ACCESS_TOKEN').access_token) {
  const parsedFrom = (templateData.fromName ? `"${templateData.fromName}" <${templateData.fromAddress}>` : templateData.fromAddress) || '';
  return cy.request({
    method: 'PUT',
    url: `https://${Cypress.env('FQDN')}/openidm/config/emailTemplate/${templateData.templateId}`,
    headers: {
      authorization: `Bearer ${accessToken}`,
      'content-type': 'application/json',
    },
    body: {
      _id: `emailTemplate/${templateData.templateId}`,
      defaultLocale: templateData.defaultLocale || 'en',
      enabled: templateData.enabled !== 'false',
      from: parsedFrom,
      message: {
        en: templateData.message || '',
      },
      html: {
        en: templateData.html || '',
      },
      mimeType: 'text/html',
      subject: {
        en: templateData.subjectEn || '',
      },
      styles: templateData.styles || '',
      displayName: templateData.displayName || templateData.templateId,
      description: templateData.description || '',
    },
  });
}

/**
 * Deletes a list of specified email templates
 * @param {string[]} templateIds The list of template ids to remove
 * @param {string} accessToken Access token to communicate with the API
 * @returns {Promise[]} A list of promises that will delete all the specified email templates
 */
export function deleteEmailTemplates(templateIds, accessToken = Cypress.env('ACCESS_TOKEN').access_token) {
  return templateIds.map((templateId) => cy.request({
    method: 'DELETE',
    url: `https://${Cypress.env('FQDN')}/openidm/config/emailTemplate/${templateId}`,
    headers: {
      authorization: `Bearer ${accessToken}`,
    },
    failOnStatusCode: false,
  }));
}

export function deleteProvider(accessToken = Cypress.env('ACCESS_TOKEN').access_token) {
  return cy.request({
    method: 'DELETE',
    url: `https://${Cypress.env('FQDN')}/openidm/config/external.email`,
    headers: {
      authorization: `Bearer ${accessToken}`,
      'content-type': 'application/json',
    },
    body,
  });
}

/**
 * Gets the default email provider config from the tenant
 * @param {Object} the default provider details
 */
export function getDefaultProviderConfig(accessToken = Cypress.env('ACCESS_TOKEN')?.access_token) {
  const emailEndpoint = Cypress.env('IS_FRAAS') ? 'external.emailDefault' : 'external.email';
  return cy.request({
    method: 'GET',
    url: `https://${Cypress.env('FQDN')}/openidm/config/${emailEndpoint}`,
    headers: {
      authorization: `Bearer ${accessToken}`,
      'content-type': 'application/json',
    },
    retryOnStatusCodeFailure: true,
  });
}
