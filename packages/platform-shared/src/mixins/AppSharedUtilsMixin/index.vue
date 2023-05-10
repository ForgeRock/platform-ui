<!-- Copyright (c) 2023 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<script>
import resolveImage from '@forgerock/platform-shared/src/utils/applicationImageResolver';

const logoMap = {
  native: 'app-native.svg',
  service: 'app-service.svg',
  web: 'app-web.svg',
  'active.directory': 'active-directory.svg',
  salesforce: 'salesforce.svg',
  adp: 'adp.svg',
  'csv.file': 'csv.svg',
  'database.table': 'database.svg',
  'google.workspace': 'google.svg',
  ldap: 'ldap.svg',
  'ds.ldap': 'fr-ds.svg',
  'azure.ad': 'microsoft.svg',
  office365: 'office365.svg',
  scim: 'scim.svg',
  'scripted.sql': 'scripted-sql.svg',
  servicenow: 'servicenow.svg',
  workday: 'workday.svg',
};

const displayNameMap = {
  native: 'Native / SPA',
  service: 'Service',
  web: 'Web',
  'active.directory': 'Active Directory',
  salesforce: 'Salesforce',
  adp: 'ADP',
  'csv.file': 'CSV File',
  'database.table': 'Database Table',
  'google.workspace': 'Google Workspace',
  ldap: 'LDAP',
  'ds.ldap': 'Directory Services (DS)',
  'azure.ad': 'Azure AD',
  office365: 'Office 365',
  scim: 'Scim',
  'scripted.sql': 'Scripted Table',
  servicenow: 'ServiceNow',
  workday: 'Workday',
};

export default {
  name: 'AppSharedUtilsMixin',
  methods: {
    getApplicationDisplayName(application) {
      if (application.templateName) return displayNameMap[application.templateName];
      return application.name;
    },
    getApplicationLogo(application) {
      if (application.icon) return application.icon;
      const imagePath = application.templateName
        ? logoMap[application.templateName]
        : '';
      return resolveImage(imagePath);
    },
  },
};
</script>
