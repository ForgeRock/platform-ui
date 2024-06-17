/**
 * Copyright (c) 2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { getBasicNotFilter } from '@forgerock/platform-shared/src/utils/governance/filters';
import { getRequestFilter, getStatusText, getFormattedRequest } from './AccessRequestUtils';

jest.mock('@forgerock/platform-shared/src/utils/appSharedUtils', () => ({
  getApplicationLogo: jest.fn().mockReturnValue('app_logo.png'),
}));

const testUser = 'managed/user/testuser';

describe('RequestToolbar', () => {
  const noEntityMutationFilter = getBasicNotFilter('EQUALS', 'requestType', 'entityMutation');
  describe('getRequestFilter', () => {
    it('request id', () => {
      const filter = { requestId: 'testId' };
      expect(getRequestFilter(filter)).toEqual({
        operator: 'AND',
        operand: [noEntityMutationFilter, {
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
        operand: [noEntityMutationFilter, {
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
        operand: [noEntityMutationFilter, {
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
        operand: [noEntityMutationFilter, {
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
        operand: [noEntityMutationFilter, {
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
        operand: [noEntityMutationFilter, {
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
        operand: [noEntityMutationFilter, {
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
        operand: [noEntityMutationFilter, {
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
  it('returns a request correctly', () => {
    const request = {
      id: 'id test',
      requestType: 'test',
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
    const result = getFormattedRequest(request, 'entitlement');
    expect(result).toEqual({
      details: {
        id: 'id test',
        type: 'governance.accessRequest.requestTypes.test',
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
});
