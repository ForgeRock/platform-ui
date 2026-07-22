/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import encodeQueryString from '@forgerock/platform-shared/src//utils/encodeQueryString';

export function getRoleByIdMock(id, status, dataType, queryParams = {}) {
  let responseData = null;
  const url = 'governance/role';
  const encodedQueryParams = encodeQueryString(queryParams);
  if (!dataType) {
    responseData = {
      role: {
        applications: [],
        description: 'Test',
        id,
        name: 'Test Role',
        roleId: id,
        justifications: [],
        entitlements: [
          'testEntitlementId1',
          'testEntitlementId2',
        ],
      },
    };
  } else if (dataType === 'members') {
    responseData = {
      result: [
        { user: { id: 'user1', userName: 'userone' } },
        { user: { id: 'user2', userName: 'usertwo' } },
      ],
      resultCount: 2,
    };
  } else if (dataType === 'entitlements') {
    responseData = {
      result: [
        { id: 'ent1', name: 'Entitlement One' },
        { id: 'ent2', name: 'Entitlement Two' },
      ],
      resultCount: 2,
    };
  }
  return Promise.resolve({
    url: `${url}${encodedQueryParams}`,
    data: responseData,
  });
}

export const getSchemaMock = () => Promise.resolve({
  data: {
    properties: [],
  },
});

export const getPrivilegesMock = () => Promise.resolve({
  data: {
    permissions: [
      'createRole',
      'modifyRole',
      'publishRole',
      'deleteRole',
    ],
  },
});

export const getManagedResourceListMock = (resource, queryParams = {}) => {
  const encodedQueryParams = encodeQueryString(queryParams);
  return Promise.resolve({
    data: {
      url: `governance/managedResources${encodedQueryParams}`,
      result: [
        { _id: 'user001', givenName: 'Aaron', sn: 'Alders' },
        { id: 'user002', givenName: 'Barbara', sn: 'Benson' },
      ],
    },
  });
};

export const getEntitlementListMock = () => Promise.resolve({
  data: {
    result: [
      {
        descriptor: {
          idx: {
            '/entitlement': {
              displayName: 'Customer Support - QA',
            },
          },
          id: 'entitlementId1',
        },
      },
      {
        descriptor: {
          idx: {
            '/entitlement': {
              displayName: 'Sales Representative - QA',
            },
          },
          id: 'entitlementId2',
        },
      },
    ],
  },
});
