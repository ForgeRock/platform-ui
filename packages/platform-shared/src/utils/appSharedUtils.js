/**
 * Copyright (c) 2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import { resolveImage } from '@forgerock/platform-shared/src/utils/applicationImageResolver';

const logoMap = {
  'active.directory': 'active-directory.svg',
  'adobe.admin': 'adobe.svg',
  adp: 'adp.svg',
  as400: 'ibm.svg',
  'azure.ad': 'microsoft.svg',
  beyondtrust: 'beyondtrust.svg',
  bookmark: 'app-bookmark.svg',
  'csv.file': 'csv.svg',
  'database.table': 'database.svg',
  docusign: 'docusign.svg',
  'ds.ldap': 'fr-ds.svg',
  'epic.emp': 'epic.svg',
  'google.workspace': 'google.svg',
  ldap: 'ldap.svg',
  native: 'app-native.svg',
  office365: 'office365.svg',
  'oracle.ebs': 'oracle.svg',
  pingone: 'ping.svg',
  powershell: 'powershell.svg',
  salesforce: 'salesforce.svg',
  'salesforce.community.user': 'salesforce.svg',
  scim: 'scim.svg',
  'scripted.groovy': 'groovy.svg',
  'scripted.rest': 'scripted-rest.svg',
  'scripted.sql': 'scripted-sql.svg',
  service: 'app-service.svg',
  servicenow: 'servicenow.svg',
  successfactorsaccount: 'successfactors.svg',
  successfactorshr: 'successfactors.svg',
  web: 'app-web.svg',
  webex: 'webex.svg',
  workday: 'workday.svg',
};

const displayNameMap = {
  'active.directory': 'Active Directory',
  'adobe.admin': 'Adobe Admin',
  adp: 'ADP',
  as400: 'AS400',
  'azure.ad': 'Azure AD',
  beyondtrust: 'BeyondTrust',
  bookmark: 'Bookmark',
  'csv.file': 'CSV File',
  'database.table': 'Database Table',
  docusign: 'DocuSign',
  'ds.ldap': 'Directory Services (DS)',
  'epic.emp': 'Epic EMP',
  'google.workspace': 'Google Workspace',
  ldap: 'LDAP',
  native: 'Native / SPA',
  office365: 'Office 365',
  'oracle.ebs': 'Oracle E-Business Suite',
  pingone: 'PingOne',
  powershell: 'PowerShell',
  salesforce: 'Salesforce',
  'salesforce.community.user': 'Salesforce Community User',
  scim: 'Scim',
  'scripted.groovy': 'Scripted Groovy',
  'scripted.rest': 'Scripted REST',
  'scripted.sql': 'Scripted Table',
  service: 'Service',
  servicenow: 'ServiceNow',
  successfactorsaccount: 'SAP SuccessFactors Account',
  successfactorshr: 'SAP SuccessFactors HR',
  web: 'Web',
  webex: 'Webex',
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
