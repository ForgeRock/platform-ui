/**
 * Copyright (c) 2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { cloneDeep, merge } from 'lodash';

/*
Sample Glossary Object
{
  "id": "3155a370-e325-4cc5-838d-ae0c65b3b6e5",
  "item": {
      "type": "accountGrant"
  },
  "latestModified": {
      "application": "2023-06-09T19:28:38.106Z",
      "applicationOwner": [
          {
              "userId": "fc249a59-6965-4a86-b657-346b2b5daf92",
              "created": "2023-06-09T19:21:43.415Z"
          }
      ]
  },
  "application": {
      "_rev": "8a4a10c1-0f8a-4dc7-a177-07d7b38d942f-482174",
      "authoritative": false,
      "fr": {
          "realm": "bravo"
      },
      "icon": "",
      "id": "3155a370-e325-4cc5-838d-ae0c65b3b6e5",
      "metadata": {
          "entityType": "/openidm/managed/application",
          "created": "2023-06-09T19:28:38.106Z"
      },
      "name": "sfc",
      "templateName": "salesforce",
      "templateVersion": "2.0"
  },
  "applicationOwner": [
      {
          "_rev": "8a4a10c1-0f8a-4dc7-a177-07d7b38d942f-481826",
          "accountStatus": "active",
          "cn": "Andrew Hertel",
          "fr": {
              "realm": "bravo"
          },
          "givenName": "Andrew",
          "id": "fc249a59-6965-4a86-b657-346b2b5daf92",
          "mail": "hertelandy@gmail.com",
          "metadata": {
              "entityType": "/openidm/managed/user",
              "created": "2023-06-09T19:21:43.415Z"
          },
          "sn": "Hertel",
          "userName": "user2"
      }
  ],
},
*/

const catalogItem = {
  id: '',
  item: {
    type: '',
  },
};

const applications = [
  {
    description: 'My Service Now App',
    icon: '',
    id: '1',
    name: 'My Service Now App',
    templateName: 'servicenow',
    templateVersion: '2.0',
  },
  {
    _rev: '23b2b11e-3ee6-499d-9e66-88ea2a867f98-50136',
    authoritative: true,
    connectorId: 'AzureADAuth1',
    description: 'AD Auth App1',
    fr: {
      realm: 'alpha',
    },
    icon: 'https://openam-glossary-fix-0608.forgeblocks.com/platform/img/microsoft.8a785075.svg',
    id: '26f2bd6b-3d23-4fbb-92f7-9aecd0183852',
    mappingNames: [
      'systemAzureadauth1User_managedAlpha_user',
    ],
    metadata: {
      entityType: '/openidm/managed/application',
      created: '2023-06-09T15:01:49.259Z',
    },
    name: 'AzureADAuth1',
    templateName: 'azure.ad',
    templateVersion: '2.0',
  },
];

const users = [
  {
    givenName: 'Angel',
    id: '1234-456-4',
    mail: 'angel.hernandez@test.com',
    sn: 'Hernandez',
    userName: 'angel.hernandezg@test.com',
  },
  {
    givenName: 'Mario',
    id: '1234-456-5',
    mail: 'mario.garcia@test.com',
    sn: 'Garcia',
    userName: 'mario.garcia@test.com',
  },
];

const entitlements = [
  {
    displayName: 'All Users',
    description: 'Can read basic directory information. Commonly used to grant directory read access to applications and guests.',
    id: '1',
  },
  {
    displayName: 'Groups Administrator',
    description: 'Has admin access.',
    id: '2',
  },
];

const assignments = [
  {
    name: 'Directory Readers',
    type: '__ENTITLEMENT__',
    id: 'system_TargetADApp2_directoryRole_08ec32b7-b9c5-4d71-bd72-ea7b8584c5a4',
  },
  {
    name: 'Chief Information Officer',
    type: '__ENTITLEMENT__',
    id: 'system_TargetADApp2_directoryRole_08ec32b7-b9c5-4d71-bd72-ea7b8584c5a4',
  },
];

const roles = [
  {
    name: 'Cloud Deployment Manager',
    description: 'Manager overseeing all offshore cloud deployments in the Europe and Asia.',
    id: '1',
  },
  {
    name: 'HelpDesk',
    description: 'Troubleshooting technical issues with individual employees. Preparing new employee hardware, including a P.C. and dual monitors. Tracking/detailing hardware inventory.',
    id: '2',
  },
  {
    name: 'Sales',
    description: 'Sales department coordinator responsible for Western US.',
    id: '3',
  },
];

function getDefaultRequest(values = {}) {
  const req = cloneDeep(catalogItem);
  merge(req, values);

  return req;
}

function generateRequest(id, type) {
  const typeMap = {
    application: 'accountGrant',
    entitlement: 'entitlementGrant',
    role: 'roleGrant',
  };

  const item = {
    type: typeMap[type],
  };

  const values = {
    id,
    item,
  };

  switch (type) {
    case 'accountGrant':
      values.application = applications[id % applications.length];
      values.applicationOwner = users[id % users.length];
      break;
    case 'entitlementGrant':
      values.application = applications[id % applications.length];
      values.entitlement = entitlements[id % entitlements.length];
      values.entitlementOwner = users[id % users.length];
      values.assignment = assignments[id % assignments.length];
      break;
    case 'roleMembership':
      values.role = roles[id % roles.length];
      break;
    default:
      break;
  }

  return getDefaultRequest(values);
}

function generateRequests(pageSize, pageNumber, type, sortDir) {
  const returnObject = {};
  if (pageNumber > 1) {
    returnObject.totalCount = pageSize + 1;
    returnObject.results = [
      generateRequest(pageSize + 1, type),
    ];
  } else {
    const results = [];
    for (let i = 0; i < pageSize; i += 1) {
      results.push(generateRequest(i + 1, type));
    }

    returnObject.totalCount = pageSize + 1;
    returnObject.results = results;
    if (sortDir === 'desc') {
      returnObject.results = returnObject.results.sort((a, b) => {
        if (a.application) {
          if (a.application.name > b.application.name) {
            return -1;
          }
          if (a.application.name < b.application.name) {
            return 1;
          }
          return 0;
        }
        if (a.role.name > b.role.name) {
          return -1;
        }
        if (a.role.name < b.role.name) {
          return 1;
        }
        return 0;
      });
    } else {
      returnObject.results = returnObject.results.sort((a, b) => {
        if (a.application) {
          if (a.application.name > b.application.name) {
            return 1;
          }
          if (a.application.name < b.application.name) {
            return -1;
          }
          return 0;
        }
        if (a.role.name > b.role.name) {
          return 1;
        }
        if (a.role.name < b.role.name) {
          return -1;
        }
        return 0;
      });
    }
  }
  return returnObject;
}

export function getCatalogMock(params, type = 'accountGrant') {
  const pageSize = params.pageSize ?? 10;
  const pageNumber = params.pageNumber ?? 1;
  const sortDir = params.sortDir ?? 'desc';

  return generateRequests(pageSize, pageNumber, type, sortDir);
}

// Not exactly sure what this API will look like
// Its possible these can all be one function, similiar to MyAccessApi
export function getUsersApplicationsMock() {
  return {
    totalCount: 0,
    results: [],
  };
}

export function getUsersEntitlementsMock() {
  return {
    totalCount: 0,
    results: [],
  };
}

export function getUsersRolesMock() {
  return {
    totalCount: 0,
    results: [],
  };
}

export function getFilterSchemaMock(objectType) {
  const objectTypeMap = {
    application: [
      {
        key: 'connectorId',
        name: 'connectorId',
        displayName: 'Connector ID',
        description: 'Id of the connector associated with the application',
        type: 'string',
        isMultiValue: false,
      },
      {
        key: 'description',
        name: 'description',
        displayName: 'Description',
        description: 'Application Description',
        type: 'string',
        isMultiValue: false,
      },
      {
        key: 'glossary.displayName',
        allowedValues: [],
        isIndexed: true,
        isMultiValue: false,
        managedObjectType: null,
        searchable: true,
        isInternal: true,
        displayName: 'Display Name (Glossary)',
        name: 'displayName',
        description: 'User facing name of object',
        objectType: '/openidm/managed/application',
        type: 'string',
      },
      {
        key: 'icon',
        name: 'icon',
        displayName: 'Icon',
        type: 'string',
        isMultiValue: false,
      },
      {
        key: 'members._ref',
        name: 'members',
        displayName: 'Members',
        description: 'Application Members',
        type: 'managedObject',
        isMultiValue: true,
        managedObjectType: '/openidm/managed/alpha_user',
      },
      {
        key: 'name',
        name: 'name',
        displayName: 'Name',
        description: 'Application name',
        type: 'string',
        isMultiValue: false,
      },
      {
        key: 'owners._ref',
        name: 'owners',
        displayName: 'Owners',
        description: 'Application Owners',
        type: 'managedObject',
        isMultiValue: true,
        managedObjectType: '/openidm/managed/alpha_user',
      },
      {
        key: 'roles._ref',
        name: 'roles',
        displayName: 'Roles',
        description: 'Roles granting users the application',
        type: 'managedObject',
        isMultiValue: true,
        managedObjectType: '/openidm/managed/alpha_role',
      },
      {
        key: 'ssoEntities',
        name: 'ssoEntities',
        displayName: 'SSO Entity Id',
        description: 'SSO Entity Id',
        type: 'object',
        isMultiValue: false,
      },
      {
        key: 'mappingNames',
        name: 'mappingNames',
        displayName: 'Sync Mapping Names',
        description: 'Names of the sync mappings used by an application with provisioning configured.',
        type: 'string',
        isMultiValue: true,
      },
      {
        key: 'templateName',
        name: 'templateName',
        displayName: 'Template Name',
        description: 'Name of the template the application was created from',
        type: 'string',
        isMultiValue: false,
      },
      {
        key: 'templateVersion',
        name: 'templateVersion',
        displayName: 'Template Version',
        description: 'The template version',
        type: 'string',
        isMultiValue: false,
      },
      {
        key: 'uiConfig',
        name: 'uiConfig',
        displayName: 'UI Config',
        description: 'UI Config',
        type: 'object',
        isMultiValue: false,
      },
      {
        key: 'url',
        name: 'url',
        displayName: 'Url',
        type: 'string',
        isMultiValue: false,
      },
      {
        key: 'id',
        name: '_id',
        displayName: '_id',
        description: 'Application ID',
        type: 'string',
        isMultiValue: false,
      },
      {
        key: 'glossary.displayName1',
        allowedValues: [],
        isIndexed: true,
        isMultiValue: false,
        managedObjectType: null,
        searchable: true,
        isInternal: true,
        name: 'displayName1',
        description: 'User facing name of object',
        objectType: '/openidm/managed/application',
        type: 'string',
        displayName: 'displayName1',
      },
    ],
    assignment: [
      {
        key: 'members._ref',
        name: 'members',
        displayName: 'Assignment Members',
        description: 'Assignment Members',
        type: 'managedObject',
        isMultiValue: true,
        managedObjectType: '/openidm/managed/alpha_user',
      },
      {
        key: 'condition',
        name: 'condition',
        displayName: 'Condition',
        description: 'A conditional filter for this assignment',
        type: 'string',
        isMultiValue: false,
      },
      {
        key: 'description',
        name: 'description',
        displayName: 'Description',
        description: 'The assignment description, used for display purposes.',
        type: 'string',
        isMultiValue: false,
      },
      {
        key: 'glossary.description',
        allowedValues: [],
        isIndexed: true,
        isMultiValue: false,
        managedObjectType: null,
        searchable: true,
        isInternal: true,
        displayName: 'glossaryDescription',
        name: 'glossaryDescription',
        description: 'Description of glossary entitlement',
        objectType: '/openidm/managed/assignment',
        type: 'string',
      },
      {
        key: 'glossary.entitlementDescription',
        allowedValues: [],
        isIndexed: true,
        isMultiValue: false,
        managedObjectType: null,
        searchable: true,
        isInternal: true,
        displayName: 'entitlementDescription',
        name: 'entitlementDescription',
        description: 'Description of entitlement',
        objectType: '/openidm/managed/assignment',
        type: 'string',
      },
      {
        key: 'glossary.displayName',
        allowedValues: [],
        isIndexed: true,
        isMultiValue: false,
        managedObjectType: null,
        searchable: true,
        isInternal: true,
        displayName: 'Display Name (Glossary)',
        name: 'displayName',
        description: 'User facing name of object',
        objectType: '/openidm/managed/assignment',
        type: 'string',
      },
      {
        key: 'glossary.entitlementOwner',
        allowedValues: [],
        isIndexed: true,
        isMultiValue: false,
        managedObjectType: '/openidm/managed/user',
        searchable: true,
        isInternal: true,
        displayName: 'Entitlement Owner',
        name: 'entitlementOwner',
        description: 'Entitlement Owner of Object',
        objectType: '/openidm/managed/assignment',
        type: 'managedObject',
      },
      {
        key: 'id',
        name: '_id',
        displayName: 'Name',
        description: 'The assignment ID',
        type: 'string',
        isMultiValue: false,
      },
      {
        key: 'name',
        name: 'name',
        displayName: 'Name',
        description: 'The assignment name, used for display purposes.',
        type: 'string',
        isMultiValue: false,
      },
      {
        key: 'glossary.requestable',
        allowedValues: [],
        isIndexed: true,
        isMultiValue: false,
        managedObjectType: null,
        searchable: true,
        isInternal: true,
        displayName: 'Requestable',
        name: 'requestable',
        description: 'Can the entitlement be requested',
        objectType: '/openidm/managed/assignment',
        type: 'boolean',
      },
      {
        key: 'type',
        name: 'type',
        displayName: 'Type',
        description: 'The type of object this assignment represents',
        type: 'string',
        isMultiValue: false,
      },
      {
        key: 'weight',
        name: 'weight',
        displayName: 'Weight',
        description: 'The weight of the assignment.',
        type: [
          'number',
          'null',
        ],
        isMultiValue: false,
      },
      {
        key: 'glossary.displayName1',
        allowedValues: [],
        isIndexed: true,
        isMultiValue: false,
        managedObjectType: null,
        searchable: true,
        isInternal: true,
        name: 'displayName1',
        description: 'User facing name of object',
        objectType: '/openidm/managed/assignment',
        type: 'string',
        displayName: 'displayName1',
      },
      {
        key: 'glossary.entitlementOwner1',
        allowedValues: [],
        isIndexed: true,
        isMultiValue: false,
        managedObjectType: '/openidm/managed/user',
        searchable: true,
        isInternal: true,
        name: 'entitlementOwner1',
        description: 'Entitlement Owner of Object',
        objectType: '/openidm/managed/assignment',
        type: 'managedObject',
        displayName: 'entitlementOwner1',
      },
    ],
    role: [
      {
        key: 'applications._ref',
        name: 'applications',
        displayName: 'Applications',
        description: 'Role Applications',
        type: 'managedObject',
        isMultiValue: true,
        managedObjectType: '/openidm/managed/alpha_application',
      },
      {
        key: 'description',
        name: 'description',
        displayName: 'Description',
        description: 'The role description, used for display purposes.',
        type: 'string',
        isMultiValue: false,
      },
      {
        key: 'id',
        name: '_id',
        displayName: 'Name',
        description: 'Role ID',
        type: 'string',
        isMultiValue: false,
      },
      {
        key: 'name',
        name: 'name',
        displayName: 'Name',
        description: 'The role name, used for display purposes.',
        type: 'string',
        isMultiValue: false,
      },
      {
        key: 'glossary.requestable',
        allowedValues: [],
        isIndexed: true,
        isMultiValue: false,
        managedObjectType: null,
        searchable: true,
        isInternal: true,
        displayName: 'Requestable',
        name: 'requestable',
        description: 'Can the role be requested',
        objectType: '/openidm/managed/role',
        type: 'boolean',
      },
      {
        key: 'members._ref',
        name: 'members',
        displayName: 'Role Members',
        description: 'Role Members',
        type: 'managedObject',
        isMultiValue: true,
        managedObjectType: '/openidm/managed/alpha_user',
      },
    ],
  };
  return objectTypeMap[objectType];
}
