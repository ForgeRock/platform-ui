/**
 * Copyright 2024 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */
import { generateCdnApi } from '@forgerock/platform-shared/src/api/BaseApi';
import i18n from '@/i18n';

const TEMPLATE_SOURCE = 'https://cdn.forgerock.com/platform/app-templates/';

/**
 * Obtains the index file for the application templates, which can be used
 * to find exact templates that exist within cdn.
 * @returns {Array} application templates index array
 */
export function getApplicationTemplatesIndexFile() {
  return generateCdnApi().get('/index.json');
}

/**
 * Obtains the template for the application at the provided path
 * path example: templates/AppTemplates/consumer/Bookmark/1.0-bookmark.json
 * @param {String} templatePath path within cdn to the template
 * @returns full application template of specified version
 */
export function getApplicationTemplate(templatePath) {
  return generateCdnApi().get(`/${templatePath}`);
}

/**
 * Obtains the list of application templates available on the cdn.
 * CDN url: https://cdn.forgerock.com/platform/app-templates/appTemplates.json.gz
 * @returns {Array} application templates in object keyed by template names
 */
export async function getApplicationTemplateList() {
  try {
    const response = await fetch(`${TEMPLATE_SOURCE}appTemplates.json.gz`);
    // eslint-disable-next-line no-undef
    const decompressionStream = new DecompressionStream('gzip');
    const decompressedStream = response.body.pipeThrough(decompressionStream);
    const decompressedText = await new Response(decompressedStream).text();
    const parsedTemplates = JSON.parse(decompressedText).AppTemplates;

    return parsedTemplates;
  } catch (error) {
    throw Error(i18n.global.t('applications.errorRetrievingApplicationTemplates'));
  }
}
