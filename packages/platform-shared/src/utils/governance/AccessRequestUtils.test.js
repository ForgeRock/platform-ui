/**
 * Copyright (c) 2024-2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import * as AccessRequestApi from '@forgerock/platform-shared/src/api/governance/AccessRequestApi';
import { getBasicFilter } from '@forgerock/platform-shared/src/utils/governance/filters';
import {
  getRequestFilter,
  getStatusText,
  getFormattedRequest,
  getNameString,
  getRequestTypeDisplayName,
  getRequestTypeDisplayNames,
  getPriorityImageAltText,
  isTypeLcm,
  requestTypes,
} from './AccessRequestUtils';

jest.mock('@forgerock/platform-shared/src/utils/appSharedUtils', () => ({
  getApplicationLogo: jest.fn().mockReturnValue('app_logo.png'),
}));

AccessRequestApi.getRequestType = jest.fn().mockImplementation((value) => Promise.resolve({
  data: {
    id: value,
    displayName: `${value}-displayName`,
  },
}));

describe('RequestToolbar', () => {
  describe('getRequestFilter', () => {
    it('request id, requester, and requestee', () => {
      const filter = { query: 'testId' };
      expect(getRequestFilter(filter)).toEqual({
        operator: 'AND',
        operand: [{
          operator: 'OR',
          operand: [
            getBasicFilter('CONTAINS', 'user.userName', 'testId'),
            getBasicFilter('CONTAINS', 'user.givenName', 'testId'),
            getBasicFilter('CONTAINS', 'user.sn', 'testId'),
            getBasicFilter('CONTAINS', 'requester.userName', 'testId'),
            getBasicFilter('CONTAINS', 'requester.givenName', 'testId'),
            getBasicFilter('CONTAINS', 'requester.sn', 'testId'),
            getBasicFilter('EQUALS', 'id', 'testId'),
          ],
        }],
      });
    });

    it('request type', () => {
      const filter = { requestType: 'testType' };
      expect(getRequestFilter(filter)).toEqual({
        operator: 'AND',
        operand: [{
          operator: 'EQUALS',
          operand: {
            targetName: 'requestType',
            targetValue: 'testType',
          },
        }],
      });
    });

    it('filters for a single priority', () => {
      const filter = { priorities: { high: true } };
      expect(getRequestFilter(filter)).toEqual({
        operator: 'AND',
        operand: [{
          operator: 'OR',
          operand: [{
            operator: 'EQUALS',
            operand: {
              targetName: 'request.common.priority',
              targetValue: 'high',
            },
          }],
        }],
      });
    });

    it('filters for a multiple priorities', () => {
      const filter = { priorities: { high: true, medium: true } };
      expect(getRequestFilter(filter)).toEqual({
        operator: 'AND',
        operand: [{
          operator: 'OR',
          operand: [
            {
              operator: 'EQUALS',
              operand: {
                targetName: 'request.common.priority',
                targetValue: 'high',
              },
            },
            {
              operator: 'EQUALS',
              operand: {
                targetName: 'request.common.priority',
                targetValue: 'medium',
              },
            },
          ],
        }],
      });
    });

    it('filters for a no priority', () => {
      const filter = { priorities: { none: true } };
      expect(getRequestFilter(filter)).toEqual({
        operator: 'AND',
        operand: [{
          operator: 'OR',
          operand: [
            {
              operator: 'NOT',
              operand: [
                {
                  operator: 'EXISTS',
                  operand: {
                    targetName: 'request.common.priority',
                  },
                },
              ],
            },
          ],
        }],
      });
    });

    it('filters for in-progress requests', () => {
      expect(getRequestFilter({}, 'in-progress')).toEqual({
        operator: 'AND',
        operand: [{
          operator: 'EQUALS',
          operand: {
            targetName: 'decision.status',
            targetValue: 'in-progress',
          },
        }],
      });
    });
  });

  describe('getStatusText', () => {
    it('returns text of a status option', () => {
      const options = [
        {
          text: 'status1',
          value: 'one',
        },
        {
          text: 'status2',
          value: 'two',
        },
      ];

      const statusText = getStatusText(options, 'two');
      expect(statusText).toBe('status2');
    });

    it('returns undefined for a status that does not exist', () => {
      const options = [
        {
          text: 'status1',
          value: 'one',
        },
        {
          text: 'status2',
          value: 'two',
        },
      ];

      const statusText = getStatusText(options, 'three');
      expect(statusText).toBe(undefined);
    });
  });
});
describe('getFormattedRequest', () => {
  it('returns an advanced request correctly', () => {
    const request = {
      id: 'id test',
      requestType: 'entitlementGrant',
      descriptor: {
        idx: {
          '/entitlement': {
            displayName: 'display name test',
          },
        },
      },
      glossary: {
        idx: {
          '/entitlement': {
            description: 'desc test',
          },
        },
      },
      request: {
        common: {
          priority: 'priority',
        },
      },
      decision: {
        startDate: '2021-01-01',
      },
      user: {
        givenName: 'user',
        sn: 'test',
      },
      requester: {
        givenName: 'requester',
        sn: 'test',
      },
    };
    const result = getFormattedRequest(request);
    expect(result).toEqual({
      details: {
        id: 'id test',
        type: 'Grant Entitlement',
        name: 'display name test',
        priority: 'priority',
        date: 'Jan 1, 2021',
        requestedFor: 'user test',
        requestedBy: 'requester test',
        icon: 'app_logo.png',
      },
      rawData: request,
    });
  });

  it('returns a basic request correctly', () => {
    const request = {
      id: 'testId',
      requestType: 'testType',
      request: {
        common: {
          priority: 'high',
        },
      },
      decision: {
        startDate: '2021-01-01',
      },
      requester: {
        givenName: 'test',
        sn: 'Requester',
      },
    };
    const result = getFormattedRequest(request);
    expect(result).toEqual({
      details: {
        id: 'testId',
        type: 'testType',
        priority: 'high',
        date: 'Jan 1, 2021',
        requestedBy: 'test Requester',
        requestedFor: '',
        isCustom: true,
      },
      rawData: request,
    });
  });

  it('returns a create entitlement request correctly', () => {
    const request = {
      id: 'testId',
      requestType: 'createEntitlement',
      application: { name: 'app' },
      request: {
        common: {
          priority: 'high',
        },
        entitlement: { objectType: 'objectType' },
      },
      decision: {
        startDate: '2021-01-01',
      },
      requester: {
        givenName: 'test',
        sn: 'Requester',
      },
    };
    const result = getFormattedRequest(request);
    expect(result).toEqual({
      details: {
        id: 'testId',
        type: 'Create Entitlement',
        name: 'app - objectType',
        description: undefined,
        priority: 'high',
        date: 'Jan 1, 2021',
        requestedBy: 'test Requester',
        requestedFor: '',
        icon: 'app_logo.png',
      },
      rawData: request,
    });
  });

  describe('getRequestTypeDisplayNames', () => {
    it('returns an array of requests with request type display names added', async () => {
      const requests = [
        { requestType: 'ACCOUNT_GRANT' },
        { requestType: 'ENTITLEMENT_GRANT' },
        { requestType: 'ROLE_GRANT' },
      ];

      const expectedRequests = [
        { requestType: 'ACCOUNT_GRANT', requestTypeDisplayName: 'ACCOUNT_GRANT-displayName' },
        { requestType: 'ENTITLEMENT_GRANT', requestTypeDisplayName: 'ENTITLEMENT_GRANT-displayName' },
        { requestType: 'ROLE_GRANT', requestTypeDisplayName: 'ROLE_GRANT-displayName' },
      ];

      const result = await getRequestTypeDisplayNames(requests);
      expect(result).toEqual(expectedRequests);
    });

    it('returns an empty array if no requests are provided', async () => {
      const requests = [];

      const result = await getRequestTypeDisplayNames(requests);
      expect(result).toEqual([]);
    });
  });

  describe('getRequestTypeDisplayName', () => {
    it('returns the display name for a valid request type', async () => {
      const requestType = 'ACCOUNT_GRANT';
      const expectedResponse = {
        data: {
          id: requestType,
          displayName: `${requestType}-displayName`,
        },
      };

      AccessRequestApi.getRequestType.mockResolvedValueOnce(expectedResponse);

      const result = await getRequestTypeDisplayName(requestType);
      expect(result).toEqual(expectedResponse);
    });

    it('returns the request type id when an error occurs', async () => {
      const requestType = 'INVALID_TYPE';
      const expectedResponse = { data: { id: requestType } };

      AccessRequestApi.getRequestType.mockRejectedValueOnce(new Error('Error'));

      const result = await getRequestTypeDisplayName(requestType);
      expect(result).toEqual(expectedResponse);
    });
  });
});
describe('getPriorityImageAltText', () => {
  it('returns the alt text for a high priority', () => {
    const priority = 'high';
    const result = getPriorityImageAltText(priority);
    expect(result).toEqual('High Priority icon');
  });

  it('returns the alt text for a medium priority', () => {
    const priority = 'medium';
    const result = getPriorityImageAltText(priority);
    expect(result).toEqual('Medium Priority icon');
  });

  it('returns the alt text for a low priority', () => {
    const priority = 'low';
    const result = getPriorityImageAltText(priority);
    expect(result).toEqual('Low Priority icon');
  });

  it('returns an empty string for an invalid priority', () => {
    const priority = 'invalid';
    const result = getPriorityImageAltText(priority);
    expect(result).toEqual('');
  });

  describe('getNameString', () => {
    it('returns the correct name for CREATE_ENTITLEMENT request type', () => {
      const request = {
        requestType: requestTypes.CREATE_ENTITLEMENT.value,
        application: { name: 'TestApp' },
        request: { entitlement: { objectType: 'TestObjectType' } },
      };
      const result = getNameString(request, 'application');
      expect(result).toBe('TestApp - TestObjectType');
    });

    it('returns the display name for entitlement object type', () => {
      const request = {
        descriptor: {
          idx: {
            '/entitlement': { displayName: 'EntitlementDisplayName' },
          },
        },
      };
      const result = getNameString(request, 'entitlement');
      expect(result).toBe('EntitlementDisplayName');
    });

    it('returns the object type display name if descriptor is not available', () => {
      const request = {
        entitlement: { displayName: 'FallbackDisplayName' },
      };
      const result = getNameString(request, 'entitlement');
      expect(result).toBe('FallbackDisplayName');
    });

    it('returns the full name with username for lcmUser object type', () => {
      const request = {
        user: { givenName: 'John', sn: 'Doe', userName: 'jdoe' },
      };
      const result = getNameString(request, 'lcmUser');
      expect(result).toBe('John Doe (jdoe)');
    });

    it('returns an empty string if lcmUser details are incomplete', () => {
      const request = {
        user: { givenName: 'John', sn: 'Doe' },
      };
      const result = getNameString(request, 'lcmUser');
      expect(result).toBe('');
    });

    it('returns the name for other object types', () => {
      const request = {
        application: { name: 'TestApplication' },
      };
      const result = getNameString(request, 'application');
      expect(result).toBe('TestApplication');
    });

    it('returns undefined if no matching object type is found', () => {
      const request = {};
      const result = getNameString(request, 'unknownType');
      expect(result).toBeUndefined();
    });
  });

  describe('isTypeLcm', () => {
    it('returns true for request types related to lcmUser', () => {
      expect(isTypeLcm('createUser')).toBe(true);
      expect(isTypeLcm('modifyUser')).toBe(true);
      expect(isTypeLcm('deleteUser')).toBe(true);
    });

    it('returns false for request types not related to lcmUser', () => {
      expect(isTypeLcm('applicationGrant')).toBe(false);
      expect(isTypeLcm('entitlementGrant')).toBe(false);
      expect(isTypeLcm('roleGrant')).toBe(false);
    });
  });
});
