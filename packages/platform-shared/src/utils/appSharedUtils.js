/**
 * Copyright (c) 2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import resolveImage from '@forgerock/platform-shared/src/utils/applicationImageResolver';

const logoMap = {
  'active.directory': 'active-directory.svg',
  adp: 'adp.svg',
  as400: 'ibm.svg',
  'azure.ad': 'microsoft.svg',
  bookmark: 'app-bookmark.svg',
  'csv.file': 'csv.svg',
  'database.table': 'database.svg',
  'ds.ldap': 'fr-ds.svg',
  'google.workspace': 'google.svg',
  ldap: 'ldap.svg',
  native: 'app-native.svg',
  office365: 'office365.svg',
  powershell: 'powershell.svg',
  salesforce: 'salesforce.svg',
  'salesforce.community.user': 'salesforce.svg',
  scim: 'scim.svg',
  'scripted.groovy': 'groovy.svg',
  'scripted.sql': 'scripted-sql.svg',
  service: 'app-service.svg',
  servicenow: 'servicenow.svg',
  successfactorsaccount: 'successfactors.svg',
  successfactorshr: 'successfactors.svg',
  web: 'app-web.svg',
  workday: 'workday.svg',
};

const displayNameMap = {
  'active.directory': 'Active Directory',
  adp: 'ADP',
  'azure.ad': 'Azure AD',
  'csv.file': 'CSV File',
  'database.table': 'Database Table',
  'ds.ldap': 'Directory Services (DS)',
  'google.workspace': 'Google Workspace',
  ldap: 'LDAP',
  native: 'Native / SPA',
  office365: 'Office 365',
  salesforce: 'Salesforce',
  scim: 'Scim',
  'scripted.sql': 'Scripted Table',
  service: 'Service',
  servicenow: 'ServiceNow',
  web: 'Web',
  workday: 'Workday',
};

export function getApplicationDisplayName(application) {
  if (application.templateName) {
    return displayNameMap[application.templateName];
  }
  return application.name;
}
export function getApplicationLogo(application) {
  if (application.icon) {
    return application.icon;
  }
  const imagePath = application.templateName
    ? logoMap[application.templateName]
    : '';
  return resolveImage(imagePath);
}
