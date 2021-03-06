/**
 * Copyright (c) 2019-2021 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

/* eslint-disable import/no-extraneous-dependencies */
import { BootstrapVue, BModal } from 'bootstrap-vue';
import { createLocalVue, shallowMount } from '@vue/test-utils';
import { ValidationProvider, ValidationObserver } from 'vee-validate';
import CreateResource from './index';

const localVue = createLocalVue();
localVue.use(BootstrapVue);

describe('CreateResource.vue', () => {
  let wrapper;
  const stubs = {
    ValidationProvider,
    ValidationObserver,
    BModal,
  };
  beforeEach(() => {
    wrapper = shallowMount(CreateResource, {
      localVue,
      mocks: {
        $t: () => 'Invalid email format (example@example.com)',
      },
      propsData: {
        createProperties: [{
          key: 'password',
          type: 'string',
          title: 'password',
          encryption: {},
        },
        {
          key: 'test',
          type: 'string',
          title: 'test',
        },
        {
          key: 'boolTest',
          type: 'boolean',
          title: 'boolTest',
        }],
        resourceName: 'testName',
        resourceType: 'testType',
      },
      stubs,
    });
  });
  afterEach(() => {
    wrapper = null;
  });

  it('Create resource dialog loaded', () => {
    expect(wrapper.name()).toBe('CreateResource');
  });

  it('Display policy error message', () => {
    const error = wrapper.vm.findPolicyError({
      data: {
        detail: {
          failedPolicyRequirements: [{
            policyRequirements: [{
              policyRequirement: 'VALID_EMAIL_ADDRESS_FORMAT',
              property: 'test',
            }],
          }],
        },
        message: 'error',
      },
    });

    expect(error[0].msg).toBe('Invalid email format (example@example.com)');
  });

  it('Sets formfields using props when initialising', () => {
    wrapper.vm.initialiseData();
    expect(wrapper.vm.formFields).toStrictEqual({
      boolTest: false,
      password: '',
      test: '',
    });
  });

  it('Clean save data', () => {
    const cleanData = wrapper.vm.cleanData({
      test: '',
    });

    expect(cleanData.test).toBeUndefined();
  });
});
