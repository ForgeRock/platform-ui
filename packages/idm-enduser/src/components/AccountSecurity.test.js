/**
 * Copyright 2025 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

import { flushPromises, mount } from '@vue/test-utils';
import { setupTestPinia } from '@forgerock/platform-shared/src/utils/testPiniaHelpers';
import axios from 'axios';
import { findAllByTestId } from '@forgerock/platform-shared/src/utils/testHelpers';
import { VBToggle, VBTogglePlugin } from 'bootstrap-vue';
import AccountSecurity from './AccountSecurity';
import i18n from '@/i18n';

jest.mock('axios');

describe('AccountSecurity', () => {
  function setup() {
    setupTestPinia();

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

    return mount(AccountSecurity, {
      global: {
        plugins: [i18n, VBTogglePlugin],
        directives: {
          'b-toggle': VBToggle,
        },
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

  it('should render correctly the reset password item, closed in the accordion by default', async () => {
    const wrapper = setup();
    await flushPromises();

    const accordion = wrapper.find('.accordion');
    expect(accordion.find('header h2').text()).toBe('Sign-in & Security');
    expect(accordion.find('header p').text()).toBe('Update your username or password used to sign in.');

    const accordionItems = findAllByTestId(accordion, 'accordion-item-wrapper');
    expect(accordionItems.length).toBe(1);
    expect(accordionItems[0].find('.card-header h3').text()).toBe('Password');
    expect(accordionItems[0].find('.collapse.show').exists()).toBe(false);
  });

  it('should open the password accordion item fill the fields and save the new password successfully', async () => {
    const wrapper = setup();
    await flushPromises();

    const accordion = wrapper.find('.accordion');
    const accordionItems = findAllByTestId(accordion, 'accordion-item-wrapper');

    // Open the password accordion item
    await accordionItems[0].find('div[role="tab"]').trigger('click');
    wrapper.vm.items[0].open$ = true;
    await flushPromises();
    expect(accordionItems[0].find('.collapse.show').exists()).toBe(true);

    // Fill the fields
    const currentPassword = wrapper.find('input[name="currentPassword"]');
    await currentPassword.setValue('testCurrentPassword');
    const newPassword = wrapper.find('input[name="Password"]');
    await newPassword.setValue('TestNewPassword123');

    // Save the new password
    const saveButton = wrapper.find('.btn-primary');
    await saveButton.trigger('click');

    expect(wrapper.emitted('reset-password')[0][0]).toEqual('testCurrentPassword');
    expect(wrapper.emitted('reset-password')[0][1]).toEqual('TestNewPassword123');
    expect(wrapper.emitted('update:closeResetPassword')[0][0]).toEqual(false);
  });

  it('should collapse the item and clean the fields when the cancel button is clicked', async () => {
    const wrapper = setup();
    await flushPromises();

    const accordion = wrapper.find('.accordion');
    const accordionItems = findAllByTestId(accordion, 'accordion-item-wrapper');

    // Open the password accordion item
    await accordionItems[0].find('div[role="tab"]').trigger('click');
    wrapper.vm.items[0].open$ = true;
    await flushPromises();
    expect(accordionItems[0].find('.collapse.show').exists()).toBe(true);

    // Fill the fields
    const currentPassword = wrapper.find('input[name="currentPassword"]');
    await currentPassword.setValue('testCurrentPassword');
    const newPassword = wrapper.find('input[name="Password"]');
    await newPassword.setValue('TestNewPassword123');

    // Cancel the changes
    const cancelButton = wrapper.find('.btn-link');
    await cancelButton.trigger('click');
    wrapper.vm.items[0].open$ = false;
    await flushPromises();

    // reset password not emitted
    expect(wrapper.emitted('reset-password')).toBeUndefined();
    expect(accordionItems[0].find('.collapse.show').exists()).toBe(false);
    expect(wrapper.find('input[name="currentPassword"]').element.value).toBe('');
    expect(wrapper.find('input[name="Password"]').element.value).toBe('');
    expect(wrapper.emitted('update:closeResetPassword')[0][0]).toEqual(false);
  });

  it('should collapse the item and clean the fields when the closeResetPassword prop is true', async () => {
    const wrapper = setup();
    await flushPromises();

    const accordion = wrapper.find('.accordion');
    const accordionItems = findAllByTestId(accordion, 'accordion-item-wrapper');

    // Open the password accordion item
    await accordionItems[0].find('div[role="tab"]').trigger('click');
    wrapper.vm.items[0].open$ = true;
    await flushPromises();
    expect(accordionItems[0].find('.collapse.show').exists()).toBe(true);

    // Fill the fields
    const currentPassword = wrapper.find('input[name="currentPassword"]');
    await currentPassword.setValue('testCurrentPassword');
    const newPassword = wrapper.find('input[name="Password"]');
    await newPassword.setValue('TestNewPassword123');
    // Close the password accordion item

    await wrapper.setProps({ closeResetPassword: true });
    await flushPromises();

    expect(wrapper.emitted('reset-password')).toBeUndefined();
    expect(accordionItems[0].find('.collapse.show').exists()).toBe(false);
    expect(wrapper.find('input[name="currentPassword"]').element.value).toBe('');
    expect(wrapper.find('input[name="Password"]').element.value).toBe('');
    expect(wrapper.emitted('update:closeResetPassword')[0][0]).toEqual(false);
  });
});
