/**
 * Copyright (c) 2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

/* eslint-disable no-unused-vars */

import { cloneDeep, merge, isEmpty } from 'lodash';

const accessRequest = {
  id: '',
  requestType: '',
  request: {
    common: {
      priority: '',
      startDate: '2023-06-22T19:23:26+00:00',
      endDate: '2023-07-15T19:23:26+00:00',
    },
  },
  // This is who created the access request
  requester: {
    mail: '',
    givenName: '',
    sn: '',
    id: '',
    userName: '',
  },
  // This is who we are requesting access for
  user: {
    mail: '',
    givenName: '',
    sn: '',
    id: '',
    userName: '',
  },
  decision: {
    status: 'in-progress',
    outcome: null,
    completionDate: null,
    deadline: null,
    comments: [],
    phases: [
      {
        name: 'userApprove',
        type: 'request',
        status: 'in-progress',
        decision: null,
        startDate: '2023-06-15T18:14:56+00:00',
        events: {
          assignment: {
            notification: 'requestAssigned',
          },
          reassign: {
            notification: 'requestReassign',
          },
        },
        workflowTaskId: '2511',
      },
    ],
  },
};

const types = [
  {
    name: 'account',
    requestTypes: [
      'accountGrant',
      'accountRevoke',
    ],
  },
  {
    name: 'entitlement',
    requestTypes: [
      'entitlementGrant',
      'entitlementRevoke',
    ],
  },
  {
    name: 'role',
    requestTypes: [
      'roleGrant',
      'roleRevoke',
    ],
  },
];

const priorities = [
  'high',
  'medium',
  'low',
];

const statusMap = {
  completed: 'completed',
  pending: 'in-progress',
  cancelled: 'cancelled',
};

const users = [
  {
    givenName: 'Mike',
    id: '1234-456-1',
    mail: 'mike.wong@test.com',
    sn: 'Wong',
    userName: 'mike.wong@test.com',
  },
  {
    givenName: 'Andrew',
    id: '1234-456-2',
    mail: 'andrew.hertel@test.com',
    sn: 'Hertel',
    userName: 'andrew.hertel@test.com',
  },
  {
    givenName: 'Manuel',
    id: '1234-456-3',
    mail: 'manuel.escobar@test.com',
    sn: 'Escobar',
    userName: 'manuel.escobar@test.com',
  },
];

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

const entitlements = [
  {
    displayName: 'All Users',
    description: 'This is for all users',
    id: '1',
  },
  {
    displayName: 'Groups Administrator',
    description: 'Administers different groups',
    id: '2',
  },
];

const roles = [
  {
    name: 'Main Role',
    description: 'The primary role for everyone',
    id: '1',
  },
  {
    name: 'Secondary Role',
    description: 'A secondary role with less permissions',
    id: '2',
  },
];

// const descriptors = [
//   {
//     idx: {
//       '/account': {
//         displayName: '',
//       },
//       '/entitlement': {
//         displayName: '',
//       },
//     },
//   },
// ];

function getDefaultRequest(values = {}) {
  const req = cloneDeep(accessRequest);
  merge(req, values);

  if (isEmpty(req.application)) delete req.application;
  if (isEmpty(req.entitlement)) delete req.entitlement;
  if (isEmpty(req.role)) delete req.role;

  return req;
}

function generateRequest(id, status) {
  const requesterInfo = users[id % users.length];
  const userInfo = users[(id + 1) % users.length];
  const type = types[id % types.length];
  const requestType = type.requestTypes[id % type.requestTypes.length];
  const request = {
    common: {
      priority: priorities[id % priorities.length],
    },
  };
  const decision = {
    status: statusMap[status],
  };

  let application = {};
  let entitlement = {};
  let role = {};

  switch (type.name) {
    case 'account':
      application = applications[id % applications.length];
      break;
    case 'entitlement':
      application = applications[id % applications.length];
      entitlement = entitlements[id % entitlements.length];
      break;
    case 'role':
      role = roles[id % roles.length];
      break;
    default:
      break;
  }

  return getDefaultRequest({
    id,
    requester: requesterInfo,
    user: userInfo,
    requestType,
    request,
    decision,
    application,
    entitlement,
    role,
  });
}

function generateRequests(pageSize, pageNumber, status) {
  if (pageNumber > 1) {
    return {
      totalCount: pageSize + 1,
      results: [
        generateRequest(pageSize + 1, status),
      ],
    };
  }

  const results = [];
  for (let i = 0; i < pageSize; i += 1) {
    results.push(generateRequest(i + 1, status));
  }

  return {
    totalCount: pageSize + 1,
    results,
  };
}

export function getRequestMock(id) {
  return generateRequest(id);
}

export function getRequestsMock(params, filters) {
  let pageSize = 10;
  let pageNumber = 1;
  let status = statusMap.pending;

  if (params.pageSize) pageSize = params.pageSize;
  if (params.pageNumber) pageNumber = params.pageNumber;
  if (params.status) status = params.status;

  return generateRequests(pageSize, pageNumber, status);
}
