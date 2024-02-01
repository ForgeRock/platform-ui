/**
 * Copyright (c) 2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

/* eslint-disable no-unused-vars */

import { cloneDeep, merge, isEmpty } from 'lodash';

const makeComments = (count) => {
  const array = new Array(count);
  return array.fill(
    {
      timeStamp: '2023-06-13T15:27:48+00:00',
      user: {
        mail: 'mkormann@frgov.net',
        givenName: 'Matt',
        sn: 'Kormann',
        id: 'managed/user/ae20eee7-89a6-40c6-a150-6797ae92bf2d',
        userName: 'mkormann',
      },
      comment: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore.',
      action: 'comment',
    },
  );
};

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
    comments: null,
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
    comments: makeComments(Math.floor(Math.random() * 50 * (id % 2))),
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

function generateRequests(pageSize, pageNumber, status, sortDir, sortType) {
  const returnObject = {};
  if (pageNumber > 1) {
    returnObject.totalCount = pageSize + 1;
    returnObject.results = [
      generateRequest(pageSize + 1, status),
    ];
  } else {
    const results = [];
    for (let i = 0; i < pageSize; i += 1) {
      results.push(generateRequest(i + 1, status));
    }

    returnObject.totalCount = pageSize + 1;
    returnObject.results = results;

    if (sortDir === 'desc') {
      returnObject.results = returnObject.results.sort((a, b) => {
        if (sortType === 'date') {
          if (a.request.common.startDate > b.request.common.startDate) {
            return -1;
          }
          if (a.request.common.startDate < b.request.common.startDate) {
            return 1;
          }
          return 0;
        }
        if (sortType === 'requestedBy') {
          if (a.requester.givenName > b.requester.givenName) {
            return -1;
          }
          if (a.requester.givenName < b.requester.givenName) {
            return 1;
          }
          return 0;
        }
        if (sortType === 'priority') {
          if (a.request.common.priority > b.request.common.priority) {
            return -1;
          }
          if (a.request.common.priority < b.request.common.priority) {
            return 1;
          }
          return 0;
        }
        if (sortType === 'id') {
          if (a.id > b.id) {
            return -1;
          }
          if (a.id < b.id) {
            return 1;
          }
          return 0;
        }
        return 0;
      });
    } else {
      returnObject.results = returnObject.results.sort((a, b) => {
        if (sortType === 'requestDate') {
          if (a.request.common.startDate > b.request.common.startDate) {
            return 1;
          }
          if (a.request.common.startDate < b.request.common.startDate) {
            return -1;
          }
          return 0;
        }
        if (sortType === 'requestedBy') {
          if (a.requester.givenName > b.requester.givenName) {
            return 1;
          }
          if (a.requester.givenName < b.requester.givenName) {
            return -1;
          }
          return 0;
        }
        if (sortType === 'priority') {
          if (a.request.common.priority > b.request.common.priority) {
            return 1;
          }
          if (a.request.common.priority < b.request.common.priority) {
            return -1;
          }
          return 0;
        }
        if (sortType === 'id') {
          if (a.id > b.id) {
            return 1;
          }
          if (a.id < b.id) {
            return -1;
          }
          return 0;
        }
        return 0;
      });
    }
  }

  return returnObject;
}

export function getRequestMock(id) {
  return generateRequest(id);
}

export function getRequestsMock(params, filters) {
  let pageSize = 10;
  let pageNumber = 1;
  let sortDir = params.sortDir ?? 'desc';
  let sortType = params.sortType ?? 'requestDate';
  let status = statusMap.pending;

  if (params.pageSize) pageSize = params.pageSize;
  if (params.pageNumber) pageNumber = params.pageNumber;
  if (params.sortDir) sortDir = params.sortDir;
  if (params.sortDir) sortType = params.sortType;
  if (params.status) status = params.status;

  return generateRequests(pageSize, pageNumber, status, sortDir, sortType);
}
