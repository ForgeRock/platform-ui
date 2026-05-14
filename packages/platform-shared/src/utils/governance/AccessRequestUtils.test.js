/**
 * Copyright (c) 2024-2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { flushPromises } from '@vue/test-utils';
import * as AccessRequestApi from '@forgerock/platform-shared/src/api/governance/AccessRequestApi';
import * as Notification from '@forgerock/platform-shared/src/utils/notification';
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
  addPredictionDataToRequest,
  isRecommendationRequestType,
  showRecommendationBanner,
  useRequestTypeOptions,
  getAccessFilterConfig,
} from './AccessRequestUtils';

jest.mock('@forgerock/platform-shared/src/utils/appSharedUtils', () => ({
  getApplicationLogo: jest.fn().mockReturnValue('app_logo.png'),
}));

jest.mock('@forgerock/platform-shared/src/utils/notification', () => ({
  showErrorMessage: jest.fn(),
}));

AccessRequestApi.getRequestType = jest.fn().mockImplementation((value) => Promise.resolve({
  data: {
    id: value,
    displayName: `${value}-displayName`,
  },
}));

AccessRequestApi.getRequestTypes = jest.fn().mockResolvedValue({
  data: { result: [] },
});

describe('RequestToolbar', () => {
  describe('getRequestFilter', () => {
    it('request id, requester, and requestee', () => {
      const filter = {
        query: 'testId',
        requester: 'john',
        user: 'jane',
      };
      expect(getRequestFilter(filter)).toEqual({
        operator: 'AND',
        operand: [
          {
            operator: 'OR',
            operand: [
              getBasicFilter('EQUALS', 'id', 'testId'),
            ],
          },
          {
            operator: 'OR',
            operand: [
              getBasicFilter('CONTAINS', 'user.userName', 'jane'),
              getBasicFilter('CONTAINS', 'user.givenName', 'jane'),
              getBasicFilter('CONTAINS', 'user.sn', 'jane'),
            ],
          },
          {
            operator: 'OR',
            operand: [
              getBasicFilter('CONTAINS', 'requester.userName', 'john'),
              getBasicFilter('CONTAINS', 'requester.givenName', 'john'),
              getBasicFilter('CONTAINS', 'requester.sn', 'john'),
            ],
          },
        ],
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
        resumeDate: null,
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
        resumeDate: null,
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
        resumeDate: null,
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
    expect(result).toEqual('High Priority');
  });

  it('returns the alt text for a medium priority', () => {
    const priority = 'medium';
    const result = getPriorityImageAltText(priority);
    expect(result).toEqual('Medium Priority');
  });

  it('returns the alt text for a low priority', () => {
    const priority = 'low';
    const result = getPriorityImageAltText(priority);
    expect(result).toEqual('Low Priority');
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

  describe('addPredictionDataToRequest', () => {
    const request = {
      id: '123',
      requestType: 'entitlementGrant',
      prediction: {
        user_id: 'c35cb4ff-94eb-43a7-99bd-6a4a0d8b2c66',
        ent_id: '06_ENT_ID_system_ShowcaseAD___GROUP___tildeNon-Union_Power',
        CONF: 0.8,
        RULE: [
          '11_FRINDEXEDSTRING10_Operations_ SUP',
        ],
        freq: 5,
        freqUnion: 4,
      },
    };

    it('adds prediction data to a request', () => {
      const result = getFormattedRequest(request);
      addPredictionDataToRequest(result, { enableAutoId: true }, [{ key: 'frIndexedString10', displayName: 'TEST' }]);
      const expectedRule = [
        {
          key: 'frIndexedString10',
          displayName: 'TEST',
          value: 'Operations_ SUP',
        },
      ];
      expect(result.details.prediction.rule).toEqual(expectedRule);
      expect(result.details.prediction.confidence).toEqual(0.8);
    });

    it('does not add prediction data to a request when disabled', () => {
      const result = getFormattedRequest(request);
      addPredictionDataToRequest(result, { enableAutoId: false }, [{ key: 'frIndexedString10', displayName: 'TEST' }]);
      expect(result.details.prediction).toBeUndefined();
    });

    it('adds prediction data to a request from getFormattedRequest', () => {
      const result = getFormattedRequest(request, { enableAutoId: true }, [{ key: 'frIndexedString10', displayName: 'TEST' }]);
      const expectedRule = [
        {
          key: 'frIndexedString10',
          displayName: 'TEST',
          value: 'Operations_ SUP',
        },
      ];
      expect(result.details.prediction.rule).toEqual(expectedRule);
      expect(result.details.prediction.confidence).toEqual(0.8);
    });
  });

  describe('isRecommendationRequestType', () => {
    it('returns true for recommendation request types', () => {
      expect(isRecommendationRequestType('entitlementGrant')).toBe(true);
      expect(isRecommendationRequestType('entitlementRemove')).toBe(true);
    });

    it('returns false for non-recommendation request types', () => {
      expect(isRecommendationRequestType('createUser')).toBe(false);
      expect(isRecommendationRequestType('accountGrant')).toBe(false);
      expect(isRecommendationRequestType('roleRemove')).toBe(false);
    });
  });

  describe('showRecommendationBanner', () => {
    const autoIdSettings = {
      enableAutoId: true,
      highScorePercentThreshold: 81.3,
      lowScorePercentThreshold: 24,
    };
    it('returns true for a request that should show banner', () => {
      const shouldShow = { rawData: { requestType: 'entitlementGrant' }, details: { prediction: { confidence: 0.9 } } };
      expect(showRecommendationBanner(shouldShow, autoIdSettings)).toBe(true);
    });

    it('returns false for invalid request type', () => {
      const shouldShow = { rawData: { requestType: 'roleGrant' }, details: { prediction: { confidence: 0.9 } } };
      expect(showRecommendationBanner(shouldShow, autoIdSettings)).toBe(false);
    });

    it('returns false for not high of low confidence', () => {
      const shouldShow = { rawData: { requestType: 'entitlementGrant' }, details: { prediction: { confidence: 0.5 } } };
      expect(showRecommendationBanner(shouldShow, autoIdSettings)).toBe(false);
    });

    it('returns false for no prediction present', () => {
      const shouldShow = { rawData: { requestType: 'entitlementGrant' }, details: { prediction: undefined } };
      expect(showRecommendationBanner(shouldShow, autoIdSettings)).toBe(false);
    });
  });
});

describe('useRequestTypeOptions', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    AccessRequestApi.getRequestTypes.mockResolvedValue({ data: { result: [] } });
    Notification.showErrorMessage.mockClear();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('initializes requestTypeOptions ref with the "All" option only', () => {
    const { requestTypeOptions } = useRequestTypeOptions();
    expect(requestTypeOptions.value).toHaveLength(1);
    expect(requestTypeOptions.value[0].value).toBe('all');
  });

  it('populates requestTypeOptions with mapped results after a successful fetch', async () => {
    AccessRequestApi.getRequestTypes.mockResolvedValueOnce({
      data: {
        result: [
          { id: 'applicationGrant', displayName: 'Grant Application' },
          { id: 'roleGrant', displayName: '' },
        ],
      },
    });

    const { requestTypeOptions, searchRequestTypes } = useRequestTypeOptions();
    searchRequestTypes('');

    // Advance debounce timer
    jest.runAllTimers();
    await flushPromises();

    expect(requestTypeOptions.value).toEqual([
      { value: 'all', text: 'All request types' },
      { value: 'applicationGrant', text: 'Grant Application' },
      { value: 'roleGrant', text: 'roleGrant' },
    ]);
  });

  it('calls showErrorMessage when getRequestTypes rejects', async () => {
    const error = new Error('API failure');
    AccessRequestApi.getRequestTypes.mockRejectedValueOnce(error);

    const { searchRequestTypes } = useRequestTypeOptions();
    searchRequestTypes('foo');

    jest.runAllTimers();
    await flushPromises();

    expect(Notification.showErrorMessage).toHaveBeenCalledWith(error, expect.any(String));
  });

  it('retains [allOption] until the fetch resolves, then repopulates on searchRequestTypes', async () => {
    AccessRequestApi.getRequestTypes.mockResolvedValueOnce({
      data: { result: [{ id: 'entitlementGrant', displayName: 'Grant Entitlement' }] },
    });

    const { requestTypeOptions, searchRequestTypes } = useRequestTypeOptions();

    // Trigger a search change
    searchRequestTypes('entitlement');

    // Before the debounce fires, options should still be the initial value (all)
    expect(requestTypeOptions.value).toEqual([{ value: 'all', text: 'All request types' }]);

    jest.runAllTimers();
    await flushPromises();

    expect(requestTypeOptions.value).toEqual([
      { value: 'all', text: 'All request types' },
      { value: 'entitlementGrant', text: 'Grant Entitlement' },
    ]);
    expect(AccessRequestApi.getRequestTypes).toHaveBeenCalledWith(undefined, 'entitlement');
  });

  it('does not clear options to [allOption] before the fetch resolves when a search is triggered', async () => {
    // This is a regression test for a bug where searchRequestTypes would synchronously
    // reset requestTypeOptions to [allOption] before the API call resolved, causing
    // SelectInput's options watcher to fire twice and incorrectly clear a selected value.
    AccessRequestApi.getRequestTypes.mockResolvedValueOnce({
      data: { result: [{ id: 'applicationGrant', displayName: 'Grant Application' }] },
    });

    const { requestTypeOptions, searchRequestTypes } = useRequestTypeOptions();

    // Simulate the component mounting: initial fetch populates the list
    searchRequestTypes('');
    jest.runAllTimers();
    await flushPromises();

    expect(requestTypeOptions.value).toEqual([
      { value: 'all', text: 'All request types' },
      { value: 'applicationGrant', text: 'Grant Application' },
    ]);

    // User types a new search that returns no results
    AccessRequestApi.getRequestTypes.mockResolvedValueOnce({ data: { result: [] } });
    searchRequestTypes('xyz');

    // Options must NOT be cleared synchronously before the fetch resolves —
    // clearing would cause SelectInput's options watcher to call processValue and
    // wipe the current selection.
    expect(requestTypeOptions.value).toEqual([
      { value: 'all', text: 'All request types' },
      { value: 'applicationGrant', text: 'Grant Application' },
    ]);

    jest.runAllTimers();
    await flushPromises();

    // After the fetch resolves with empty results, options collapse back to [allOption]
    expect(requestTypeOptions.value).toEqual([{ value: 'all', text: 'All request types' }]);
  });

  it('discards stale results when a later fetch resolves before an earlier one', async () => {
    let resolveFirst;
    let resolveSecond;
    const firstPromise = new Promise((resolve) => { resolveFirst = resolve; });
    const secondPromise = new Promise((resolve) => { resolveSecond = resolve; });

    AccessRequestApi.getRequestTypes
      .mockReturnValueOnce(firstPromise)
      .mockReturnValueOnce(secondPromise);

    const { requestTypeOptions, searchRequestTypes } = useRequestTypeOptions();

    // Trigger first search (e.g. initial fetch)
    searchRequestTypes('');
    jest.runAllTimers();

    // Trigger second search before first resolves
    searchRequestTypes('role');
    jest.runAllTimers();

    // Second call resolves first with "role" results
    resolveSecond({ data: { result: [{ id: 'roleGrant', displayName: 'Grant Role' }] } });
    await flushPromises();

    expect(requestTypeOptions.value).toEqual([
      { value: 'all', text: 'All request types' },
      { value: 'roleGrant', text: 'Grant Role' },
    ]);

    // First (stale) call resolves with unfiltered results — should be discarded
    resolveFirst({ data: { result: [{ id: 'applicationGrant', displayName: 'Grant Application' }] } });
    await flushPromises();

    // Options must still show "role" results, not the stale unfiltered results
    expect(requestTypeOptions.value).toEqual([
      { value: 'all', text: 'All request types' },
      { value: 'roleGrant', text: 'Grant Role' },
    ]);
  });
});

describe('getAccessFilterConfig requestType field', () => {
  const components = {
    BFormRadioGroup: {},
    FrPriorityFilter: {},
    FrSelectInput: {},
    FrField: {},
  };
  const filterData = {
    status: { value: 'in-progress' },
    priorities: {
      value: {
        high: true, medium: true, low: true, none: true,
      },
    },
    requestType: { value: 'all' },
    query: { value: '' },
    requester: { value: '' },
    user: { value: '' },
  };

  it('has internalSearch: false on the requestType item props', () => {
    const config = getAccessFilterConfig(components, { statusOptions: [], filterData });
    const requestTypeItem = config.requestType.components.find((c) => c.id === 'requestType');
    expect(requestTypeItem.props.internalSearch).toBe(false);
  });

  it('does not have an options key on the requestType item props', () => {
    const config = getAccessFilterConfig(components, { statusOptions: [], filterData });
    const requestTypeItem = config.requestType.components.find((c) => c.id === 'requestType');
    expect(requestTypeItem.props).not.toHaveProperty('options');
  });
});
