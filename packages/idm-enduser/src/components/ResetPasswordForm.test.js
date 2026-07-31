/**
 * Copyright (c) 2025-2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { flushPromises, mount } from '@vue/test-utils';
import axios from 'axios';
import ResetPasswordForm from './ResetPasswordForm';
import i18n from '@/i18n';

jest.mock('axios');

describe('ResetPasswordForm', () => {
  function setup() {
    axios.CancelToken = {
      source: jest.fn().mockReturnValue({
        token: {},
        cancel: jest.fn(),
      }),
    };
    axios.create = jest.fn().mockReturnValue({
      interceptors: {
        response: {
          use: jest.fn().mockReturnValue(false),
        },
      },
      get: jest.fn().mockResolvedValue({
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
      }),
      post: jest.fn().mockResolvedValueOnce({
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
      }).mockResolvedValueOnce({
        data: {
          result: true,
          failedPolicyRequirements: [],
        },
      }).mockResolvedValueOnce({
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
      }),
    });
    return mount(ResetPasswordForm, {
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

  it('emits form data properly', async () => {
    const wrapper = setup();
    await flushPromises();

    const currentPassword = wrapper.find('input[name="currentPassword"]');
    await currentPassword.setValue('testCurrentPassword');

    const newPassword = wrapper.find('input[name="Password"]');
    await newPassword.setValue('TestNewPassword123');

    const saveButton = wrapper.find('.btn-primary');
    await saveButton.trigger('click');

    expect(wrapper.emitted('reset-password')[0][0]).toEqual('testCurrentPassword');
    expect(wrapper.emitted('reset-password')[0][1]).toEqual('TestNewPassword123');
  });

  it('should validate the password policy and show the result in the policy panel', async () => {
    const wrapper = setup();
    await flushPromises();

    const newPassword = wrapper.find('input[name="Password"]');
    await newPassword.setValue('TestNewPassword123');

    const policies = wrapper.findAll('.fr-policy-list-item');
    expect(policies.length).toBe(3);

    const validPolicies = wrapper.findAll('.fr-valid');
    expect(validPolicies.length).toBe(3);
  });

  it('should reset password if resetForm prop is true', async () => {
    const wrapper = setup();
    await flushPromises();

    const currentPassword = wrapper.find('input[name="currentPassword"]');
    await currentPassword.setValue('testCurrentPassword');

    const newPassword = wrapper.find('input[name="Password"]');
    await newPassword.setValue('TestNewPassword123');

    await wrapper.setProps({ resetForm: true });

    expect(wrapper.find('input[name="currentPassword"]').element.value).toBe('');
    expect(wrapper.find('input[name="Password"]').element.value).toBe('');

    const policies = wrapper.findAll('.fr-policy-list-item');
    expect(policies.length).toBe(3);

    const validPolicies = wrapper.findAll('.fr-valid');
    expect(validPolicies.length).toBe(0);
  });
});
