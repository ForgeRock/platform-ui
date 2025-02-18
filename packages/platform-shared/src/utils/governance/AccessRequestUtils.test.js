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
  getRequestTypeDisplayName,
  getRequestTypeDisplayNames,
  getPriorityImageAltText,
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
        description: 'desc test',
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
});
