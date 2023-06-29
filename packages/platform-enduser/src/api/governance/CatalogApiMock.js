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
