/**
 * Copyright 2025 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

import { flushPromises, mount } from '@vue/test-utils';
import axios from 'axios';
import { setupTestPinia } from '@forgerock/platform-shared/src/utils/testPiniaHelpers';
import NotificationMixin from '@forgerock/platform-shared/src/mixins/NotificationMixin';
import Profile from './Profile';
import i18n from '@/i18n';

jest.mock('axios');
jest.mock('@forgerock/platform-shared/src/mixins/NotificationMixin');

const resetPasswordListPoliciesMock = {
  data: {
    properties: [
      {
        policyRequirements: [
          'VALID_TYPE',
          'MIN_LENGTH',
          'AT_LEAST_X_CAPITAL_LETTERS',
          'AT_LEAST_X_NUMBERS',
          'CANNOT_CONTAIN_OTHERS',
        ],
        fallbackPolicies: null,
        name: 'password',
        policies: [
          {
            policyRequirements: [
              'VALID_TYPE',
            ],
            policyId: 'valid-type',
            params: {
              types: [
                'string',
              ],
            },
          },
          {
            policyId: 'minimum-length',
            params: {
              minLength: 8,
            },
            policyFunction: '\nfunction (fullObject, value, params, property) {\n    var isRequired = _.find(this.failedPolicyRequirements, function (fpr) {\n        return fpr.policyRequirement === "REQUIRED";\n    }), isString = typeof (value) === "string", hasMinLength = isString ? (value.length >= params.minLength) : false;\n    if ((isRequired || isString) && !hasMinLength) {\n        return [{"policyRequirement": "MIN_LENGTH", "params": {"minLength": params.minLength}}];\n    }\n    return [];\n}\n',
            policyRequirements: [
              'MIN_LENGTH',
            ],
          },
          {
            policyId: 'at-least-X-capitals',
            params: {
              numCaps: 1,
            },
            policyFunction: '\nfunction (fullObject, value, params, property) {\n    var isRequired = _.find(this.failedPolicyRequirements, function (fpr) {\n        return fpr.policyRequirement === "REQUIRED";\n    }), isString = (typeof (value) === "string"), valuePassesRegexp = (function (v) {\n        var test = isString ? v.match(/[A-Z]/g) : null;\n        return test !== null && test.length >= params.numCaps;\n    }(value));\n    if ((isRequired || isString) && !valuePassesRegexp) {\n        return [{"policyRequirement": "AT_LEAST_X_CAPITAL_LETTERS", "params": {"numCaps": params.numCaps}}];\n    }\n    return [];\n}\n',
            policyRequirements: [
              'AT_LEAST_X_CAPITAL_LETTERS',
            ],
          },
          {
            policyId: 'at-least-X-numbers',
            params: {
              numNums: 1,
            },
            policyFunction: '\nfunction (fullObject, value, params, property) {\n    var isRequired = _.find(this.failedPolicyRequirements, function (fpr) {\n        return fpr.policyRequirement === "REQUIRED";\n    }), isString = (typeof (value) === "string"), valuePassesRegexp = (function (v) {\n        var test = isString ? v.match(/\\d/g) : null;\n        return test !== null && test.length >= params.numNums;\n    }(value));\n    if ((isRequired || isString) && !valuePassesRegexp) {\n        return [{"policyRequirement": "AT_LEAST_X_NUMBERS", "params": {"numNums": params.numNums}}];\n    }\n    return [];\n}\n',
            policyRequirements: [
              'AT_LEAST_X_NUMBERS',
            ],
          },
          {
            policyId: 'cannot-contain-others',
            params: {
              disallowedFields: [
                'userName',
                'givenName',
                'sn',
              ],
            },
            policyFunction: '\nfunction (fullObject, value, params, property) {\n    return policyUtil.cannotContainOthers(fullObject, value, params, true, "CANNOT_CONTAIN_OTHERS");\n}\n',
            policyRequirements: [
              'CANNOT_CONTAIN_OTHERS',
            ],
          },
        ],
        conditionalPolicies: null,
      },
    ],
    resource: 'managed/user',
    _id: 'user',
  },
};
const checkPasswordPoliciesFailMock = {
  data: {
    result: false,
    failedPolicyRequirements: [
      {
        policyRequirements: [
          {
            params: {
              minLength: 8,
            },
            policyRequirement: 'MIN_LENGTH',
          },
        ],
        property: 'password',
      },
      {
        policyRequirements: [
          {
            params: {
              numCaps: 1,
            },
            policyRequirement: 'AT_LEAST_X_CAPITAL_LETTERS',
          },
        ],
        property: 'password',
      },
      {
        policyRequirements: [
          {
            params: {
              numNums: 1,
            },
            policyRequirement: 'AT_LEAST_X_NUMBERS',
          },
        ],
        property: 'password',
      },
    ],
  },
};
const checkPasswordPoliciesSuccessMock = {
  data: {
    result: true,
    failedPolicyRequirements: [],
  },
};
const resetPasswordSuccessMock = {
  data: {
    _id: '397c5fd3-efd9-4bd0-b818-1032e6d3b370',
    _rev: 'a2d391dd-b860-49eb-9323-42b2d8c88eaa-7546',
    preferences: {
      updates: false,
      marketing: false,
    },
    mail: 'acastillo@example.com',
    sn: 'Castillo',
    givenName: 'Andres',
    accountStatus: 'active',
    userName: 'acastillo',
    effectiveRoles: [],
    memberOfOrgIDs: [],
    effectiveAssignments: [],
    passwordExpirationTime: null,
    passwordLastChangedTime: null,
  },
};

describe('Profile', () => {
  const patchResetPasswordSpy = jest.fn();
  const axiosCreateSpy = jest.fn();

  function setup(patchResetPassword = patchResetPasswordSpy.mockResolvedValue(resetPasswordSuccessMock)) {
    axios.CancelToken = {
      source: jest.fn().mockReturnValue({
        token: {},
        cancel: jest.fn(),
      }),
    };

    axios.create = axiosCreateSpy.mockReturnValue({
      interceptors: {
        response: {
          use: jest.fn().mockReturnValue(false),
        },
      },
      get: jest.fn().mockResolvedValue(resetPasswordListPoliciesMock),
      post: jest.fn()
        .mockResolvedValueOnce(checkPasswordPoliciesFailMock)
        .mockResolvedValueOnce(checkPasswordPoliciesSuccessMock)
        .mockResolvedValueOnce(checkPasswordPoliciesFailMock),
      patch: patchResetPassword,
    });

    setupTestPinia({
      user: {
        userId: '1234',
        managedResource: 'user',
      },
    });

    return mount(Profile, {
      global: {
        plugins: [i18n],
        mocks: {
          $store: {
            state: {},
          },
        },
      },
    });
  }

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('Reset password correctly', async () => {
    const wrapper = setup();
    await flushPromises();

    const accountSecurityCard = wrapper.find('div[role="tablist"]');
    expect(accountSecurityCard.exists()).toBe(true);
    expect(accountSecurityCard.find('h2').text()).toBe('Sign-in & Security');

    const currentPassword = accountSecurityCard.find('input[name="currentPassword"]');
    await currentPassword.setValue('testCurrentPassword');

    const newPassword = accountSecurityCard.find('input[name="Password"]');
    await newPassword.setValue('TestNewPassword123');

    const saveButton = accountSecurityCard.find('.btn-primary');
    await saveButton.trigger('click');

    expect(axiosCreateSpy).toHaveBeenLastCalledWith({
      baseURL: expect.any(String),
      headers: {
        'X-OpenIDM-Reauth-Password': 'testCurrentPassword',
      },
      timeout: 15000,
    });
    expect(patchResetPasswordSpy).toHaveBeenCalledWith('user/1234', [
      {
        field: '/password',
        operation: 'add',
        value: 'TestNewPassword123',
      },
    ]);
    expect(NotificationMixin.methods.displayNotification).toHaveBeenCalledWith('success', 'Updated your profile.');
  });

  it('Reset password with error', async () => {
    const error = new Error();
    const wrapper = setup(patchResetPasswordSpy.mockRejectedValue(error));
    await flushPromises();

    const accountSecurityCard = wrapper.find('div[role="tablist"]');

    const currentPassword = accountSecurityCard.find('input[name="currentPassword"]');
    await currentPassword.setValue('testCurrentPassword');

    const newPassword = accountSecurityCard.find('input[name="Password"]');
    await newPassword.setValue('TestNewPassword123');

    const saveButton = accountSecurityCard.find('.btn-primary');
    await saveButton.trigger('click');

    expect(NotificationMixin.methods.showErrorMessage).toHaveBeenCalledWith(error, undefined);
  });
});
