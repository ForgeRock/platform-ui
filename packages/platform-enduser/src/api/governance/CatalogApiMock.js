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
    description: 'My Azure App',
    icon: '',
    id: '2',
    name: 'My Azure App',
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
    id: '1',
  },
  {
    displayName: 'Groups Administrator',
    id: '2',
  },
];

const roles = [
  {
    name: 'Main Role',
    id: '1',
  },
  {
    name: 'Secondary Role',
    id: '2',
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
    case 'application':
      values.application = applications[id % applications.length];
      values.applicationOwner = users[id % users.length];
      break;
    case 'entitlement':
      values.application = applications[id % applications.length];
      values.entitlement = entitlements[id % entitlements.length];
      values.entitlementOwner = users[id % users.length];
      break;
    case 'role':
      values.role = roles[id % roles.length];
      break;
    default:
      break;
  }

  return getDefaultRequest(values);
}

function generateRequests(pageSize, pageNumber, type) {
  if (pageNumber > 1) {
    return {
      totalCount: pageSize + 1,
      results: [
        generateRequest(pageSize + 1, type),
      ],
    };
  }

  const results = [];
  for (let i = 0; i < pageSize; i += 1) {
    results.push(generateRequest(i + 1, type));
  }

  return {
    totalCount: pageSize + 1,
    results,
  };
}

export function getCatalogMock(params, type = 'application') {
  let pageSize = 10;
  let pageNumber = 1;
  if (params.pageSize) pageSize = params.pageSize;
  if (params.pageNumber) pageNumber = params.pageNumber;

  return generateRequests(pageSize, pageNumber, type);
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
