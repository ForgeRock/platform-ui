/**
 * Copyright (c) 2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import * as AccessRequestApi from '@forgerock/platform-shared/src/api/governance/AccessRequestApi';
import {
  getRequestFilter,
  getStatusText,
  getFormattedRequest,
  getRequestTypeDisplayNames,
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

const testUser = 'managed/user/testuser';

describe('RequestToolbar', () => {
  describe('getRequestFilter', () => {
    it('request id', () => {
      const filter = { requestId: 'testId' };
      expect(getRequestFilter(filter)).toEqual({
        operator: 'AND',
        operand: [{
          operator: 'EQUALS',
          operand: {
            targetName: 'id',
            targetValue: 'testId',
          },
        }],
      });
    });

    it('requested for', () => {
      const filter = { requestedFor: testUser };
      expect(getRequestFilter(filter)).toEqual({
        operator: 'AND',
        operand: [{
          operator: 'EQUALS',
          operand: {
            targetName: 'user.id',
            targetValue: 'testuser',
          },
        }],
      });
    });

    it('requester', () => {
      const filter = { requester: testUser };
      expect(getRequestFilter(filter)).toEqual({
        operator: 'AND',
        operand: [{
          operator: 'EQUALS',
          operand: {
            targetName: 'requester.id',
            targetValue: 'managed/user/testuser',
          },
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
      const filter = { priorities: {} };
      expect(getRequestFilter(filter)).toEqual({
        operator: 'AND',
        operand: [{
          operator: 'EQUALS',
          operand: {
            targetName: 'request.common.priority',
            targetValue: 'none',
          },
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
      user: 'user test',
      requester: 'requester test',
    };
    const result = getFormattedRequest(request);
    expect(result).toEqual({
      details: {
        id: 'id test',
        type: 'Grant Entitlement',
        name: 'display name test',
        description: 'desc test',
        priority: 'priority',
        date: '2021-01-01',
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
      requester: 'testRequester',
    };
    const result = getFormattedRequest(request);
    expect(result).toEqual({
      details: {
        id: 'testId',
        type: 'testType',
        priority: 'high',
        date: '2021-01-01',
        requestedBy: 'testRequester',
        isCustom: true,
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
});
