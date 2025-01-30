/**
 * Copyright (c) 2023-2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { resolveImage } from '@forgerock/platform-shared/src/utils/applicationImageResolver';
import { getApplicationTemplateList } from '@forgerock/platform-shared/src/api/CdnApi';
import {
  ref,
} from 'vue';

const template = ref([]);

/**
 * Extracts the template version from a file path. For example, given the filePath
 * "./1_0-bookmark.json", it will return "1.0"
 * @param {String} filePath expected in the form ./major_minor-templateType.json
 * @returns {String} the template version
 */
function getAppVersionFromFileName(filePath) {
  if (!filePath || typeof filePath !== 'string') {
    return '';
  }
  return filePath.split('/')
    .pop()
    .split('-')
    .shift()
    .replace('_', '.');
}

/**
 * Compares two template/connector versions, returns a number indicating whether
 * version 'a' is before, equal or after version 'b'
 * @param {String} a version to compare with second parameter
 * @param {String} b
 * @returns {Number} 1 if 'a' is greater than 'b', 0 if 'a' is
 * equal to 'b', -1 if 'a' is less than 'b'
 */
export function compareVersions(a, b) {
  // Separate versions by version segments (e.g 1.2.3.4, 1.0.0) and release candidate
  const splitA = a.split('-RC');
  const splitB = b.split('-RC');

  // Separate each segment of the version so we have an array containing each
  // number in the version (e.g. ['1', '2', '3', '4'])
  const segmentsA = splitA[0].split('.');
  const segmentsB = splitB[0].split('.');

  // The lengths of the versions being compared may not match, get the highest
  // length so we make sure every segment is included in the comparison
  const maxLength = Math.max(segmentsA.length, segmentsB.length);

  // Loop through each segment of the version string (major, minor, patch, revision)
  // comparing a to b
  for (let i = 0; i < maxLength; i += 1) {
    const segmentA = parseInt(segmentsA[i], 10) || 0;
    const segmentB = parseInt(segmentsB[i], 10) || 0;

    // If segment is greater or less than we can exit here
    if (segmentA > segmentB) {
      return 1;
    }
    if (segmentA < segmentB) {
      return -1;
    }
  }

  // Segments are all equal, compare release candidates
  const releaseCandidateA = splitA[1] ? parseInt(splitA[1], 10) : 0;
  const releaseCandidateB = splitB[1] ? parseInt(splitB[1], 10) : 0;
  if (releaseCandidateA > releaseCandidateB) {
    return 1;
  }
  if (releaseCandidateA < releaseCandidateB) {
    return -1;
  }

  // Everything is equal
  return 0;
}

/**
 * Determines latest and penultimate versions of templates provided and combines into
 * a single object containing all versions
 * Versions can be both full semvers (1.0.0) or build revisions (1.0.0.0-RC1)
 * @param {Object} templates contains all versions of a template keyed by version
 * @returns single object containing all versions, latest, and penultimate
 */
export function combineTemplatesWithLatestAndPenultimate(templates) {
  const versions = Object.keys(templates);
  const sortedVersions = versions.sort(compareVersions).reverse(); // reverse so latest is first
  const latest = sortedVersions[0];
  const latestMajorVersion = latest[0];
  const latestTemplateEntries = Object.entries(templates[latest]);
  latestTemplateEntries.push(['latest', true]);
  const latestTemplate = Object.fromEntries(latestTemplateEntries);

  // If there are multiple versions, find the first with a different major version or the previous version if all have same major
  let penultimate = false;
  if (sortedVersions.length > 1) {
    penultimate = sortedVersions.find((version) => version[0] !== latestMajorVersion) || sortedVersions[1];
  }

  return { ...templates, latest: latestTemplate, ...(penultimate && { penultimate: templates[penultimate] }) };
}

/**
 * Organizes templates into single object keyed by
 * their version along with latest and penultimate versions
 * @param {Object} templateCategory an object containing all templates
 * @returns {Object} an object of templates keyed by versions
 */
export function buildTemplatesReferenceObject(templateCategory) {
  const templates = {};
  Object.entries(templateCategory).forEach(([key, templateObj]) => {
    const templateVersion = getAppVersionFromFileName(key);
    templates[templateVersion] = templateObj;
  });

  return combineTemplatesWithLatestAndPenultimate(templates);
}

/**
 * Queries the CDN for the latest application templates and returns them in an object keyed by their type
 * @returns Object containing all application templates keyed by their type and version
 */
export async function getAppTemplatesByType() {
  const templateList = await getApplicationTemplateList();
  const templatesByType = {};
  Object.values(templateList).forEach((templateCategory) => {
    Object.values(templateCategory).forEach((versions) => {
      templatesByType[Object.values(versions)[0].id] = buildTemplatesReferenceObject(versions);
    });
  });
  return templatesByType;
}

export function setApplicationsTemplates(templateData) {
  template.value = templateData;
}

export function getAppByTypeByVersion(application) {
  const { templateName, templateVersion } = application;
  const filterAppByName = template.value?.[templateName] || {};
  const filterAppByVersion = filterAppByName?.[templateVersion || 'latest'];
  return filterAppByVersion || null;
}

export async function loadAppTemplates() {
  if (template.value && Object.keys(template.value).length > 0) {
    return;
  }

  const data = await getAppTemplatesByType();
  setApplicationsTemplates(data);
}

export function getApplicationDisplayName(application) {
  if (application.templateName) {
    loadAppTemplates();
    const displayName = getAppByTypeByVersion(application)?.displayName;
    return displayName;
  }
  return application.name;
}

export function getApplicationLogo(application) {
  loadAppTemplates();
  const image = getAppByTypeByVersion(application)?.image;
  return application.icon || resolveImage(image);
}

export const exportedForTestingSharedUtils = {
  compareVersions,
  combineTemplatesWithLatestAndPenultimate,
  getAppVersionFromFileName,
};
