/**
 * Copyright 2020-2022 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

import { generateIdmApi } from '@forgerock/platform-shared/src/api/BaseApi';
import { deleteConfig, getConfig, putConfig } from '@forgerock/platform-shared/src/api/ConfigApi';

/**
  * Returns a list of email templates
  *
  * @returns {Promise}
  */
export function getEmailTemplates() {
  return generateIdmApi().get('config?_queryFilter=_id sw \'emailTemplate\'');
}

/**
  * Returns the specified email template
  * @param {string} objectName - Name of the email template
  * @returns {Promise}
  */
export function getEmailTemplate(objectName) {
  return getConfig(`emailTemplate/${objectName}`);
}

export function saveEmailTemplate(objectName, config) {
  const savePath = objectName.startsWith('emailTemplate/') ? objectName : `emailTemplate/${objectName}`;
  return putConfig(savePath, config);
}

/**
   * Removes the template config based on the id provided
   * @property {String} templateId - the unique id of the template
   */
export function deleteEmailTemplate(templateId) {
  return deleteConfig(templateId);
}

/**
 * Deletes current email provider config
 * @returns {Promise} Promise of the get config call
 */
export function deleteProviderConfig() {
  return deleteConfig('external.email');
}

/**
 * Retrieves current email provider config
 * @returns {Promise} Promise of the get config call
 */
export function getProviderConfig() {
  return getConfig('external.email');
}

/**
 * Attempts to pull the default external provider configuration
 * @returns {Promise} Promise of the get config call
 */
export function getDefaultConfig() {
  return getConfig('external.emailDefault');
}

/**
 * Attempts to save email provider with provided config
 * @param {Object} config Contains form data to be saved
 * @returns {Promise} Promise of the put config call
 */
export function putProviderConfig(config) {
  return putConfig('external.email', config);
}

/**
 * Sends email through idm
 * @param {object} params - email parameters
 * {
 *    to: {string}
 *    templateName: {string}
 *    object: {Object}
 * }
 */
export function sendEmailTemplate(params) {
  const defaultParams = {
    templateName: 'forgottenUsername',
    object: {},
  };
  return generateIdmApi().post('/external/email/?_action=sendTemplate', { ...defaultParams, ...params });
}

/**
 * Sends email through idm
 * @param {object} params - email parameters
 * {
 *    from: {string}
 *    to: {string}
 *    type: {string}
 *    subject: {string}
 *    body: {string}
 * }
 */
export function sendEmail(params) {
  const defaultParams = {
    type: 'text/html',
    subject: 'Test Subject',
    body: 'Test Body',
  };
  return generateIdmApi().post('/external/email/?_action=send', { ...defaultParams, ...params });
}
