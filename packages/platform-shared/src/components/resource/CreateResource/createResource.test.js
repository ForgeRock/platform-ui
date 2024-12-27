/**
 * Copyright (c) 2019-2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { BModal } from 'bootstrap-vue';
import { shallowMount } from '@vue/test-utils';
import Notifications from '@kyvg/vue3-notification';
import CreateResource from './index';

describe('CreateResource.vue', () => {
  let wrapper;
  const stubs = {
    BModal,
  };
  const translationMap = {
    'pages.access.objectPermissions': 'objectPermissions',
    'pages.access.dynamic': 'dynamic',
    'pages.access.timeConstraint': 'timeConstraint',
    'common.newObject': 'newObject',
    'common.policyValidationMessages.VALID_EMAIL_ADDRESS_FORMAT': 'Invalid email format (example@example.com)',
  };
  beforeEach(() => {
    wrapper = shallowMount(CreateResource, {
      global: {
        mocks: {
          $t: (key) => {
            if (translationMap[key]) {
              return translationMap[key];
            }
            return key;
          },
        },
        stubs,
        plugins: [Notifications],
      },
      props: {
        createProperties: [
          {
            key: 'privileges',
            default: 'testDefault',
            isConditional: false,
            isTemporalConstraint: false,
            field: 'password',
            type: 'string',
            value: 'privilegesValue',
          },
          {
            key: 'password',
            isConditional: true,
            isTemporalConstraint: false,
            type: 'string',
            title: 'password',
            encryption: {},
            value: null,
          },
          {
            key: 'boolTest',
            isConditional: false,
            isTemporalConstraint: true,
            type: 'boolean',
            title: 'boolTest',
            value: false,
          },
          {
            key: 'arrayTest',
            isConditional: false,
            isTemporalConstraint: false,
            items: { type: 'test' },
            type: 'array',
            title: 'arrayTest',
            value: [],
          },
        ],
        resourceName: 'testName',
        resourceType: 'testType',
        resourceTitle: 'testTitle',
      },
    });

    wrapper.setData({
      formFields: {},
    });

    wrapper.vm.$refs.observer.getValues = jest.fn().mockReturnValue([]);
    wrapper.vm.$refs.observer.validate = jest.fn().mockImplementation(() => Promise.resolve({ valid: false }));
  });
  afterEach(() => {
    wrapper.unmount();
  });

  it('sets errors', () => {
    const generatedErrors = [
      {
        msg: 'testError',
        exists: true,
        field: 'password',
      },
    ];
    jest.spyOn(wrapper.vm, 'findPolicyError').mockReturnValue(generatedErrors);
    const errorResponse = { data: { detail: { failedPolicyRequirements: { policyRequirements: ['testError'] } } } };
    const showErrorSpy = jest.spyOn(wrapper.vm, 'showErrorMessage');
    expect(wrapper.vm.passwordFailures).toStrictEqual([]);
    wrapper.vm.setErrors(errorResponse);
    expect(wrapper.vm.passwordFailures).toStrictEqual(['testError']);
    expect(showErrorSpy).toHaveBeenCalledWith(errorResponse, 'pages.access.invalidCreate');
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
      arrayTest: [],
      boolTest: false,
      password: '',
      privileges: '',
    });
  });

  it('Clean save data', () => {
    const cleanData = wrapper.vm.cleanData({
      test: '',
    });

    expect(cleanData.test).toBeUndefined();
  });

  it('checks if modal is on the last step', () => {
    wrapper.vm.stepIndex = 0;
    wrapper.vm.initialiseData();
    expect(wrapper.vm.steps).toStrictEqual([{
      key: 'privileges',
      default: 'testDefault',
      isConditional: false,
      isTemporalConstraint: false,
      type: 'string',
      field: 'password',
      validation: 'required',
      value: 'testDefault',
    },
    {
      key: 'password',
      isConditional: true,
      isTemporalConstraint: false,
      type: 'password',
      title: 'password',
      encryption: {},
      validation: 'required',
      value: null,
    },
    {
      key: 'boolTest',
      isConditional: false,
      isTemporalConstraint: true,
      type: 'boolean',
      title: 'boolTest',
      validation: 'required',
      value: false,
    }]);
    expect(wrapper.vm.isLastStep).toBe(false);
    wrapper.vm.stepIndex = 2;

    expect(wrapper.vm.isLastStep).toBe(true);
  });

  it('loads next and previous step', async () => {
    const validateFormSpy = jest.spyOn(wrapper.vm.$refs.observer, 'validate').mockImplementation(() => Promise.resolve({ valid: false }));
    wrapper.vm.stepIndex = 0;
    wrapper.vm.loadNextStep();
    expect(validateFormSpy).not.toHaveBeenCalled();
    expect(wrapper.vm.stepIndex).toBe(1);
    wrapper.vm.stepIndex = -1;
    await wrapper.vm.loadNextStep();
    expect(validateFormSpy).toHaveBeenCalled();
    expect(wrapper.vm.stepIndex).toBe(-1);
    jest.spyOn(wrapper.vm.$refs.observer, 'validate').mockImplementation(() => Promise.resolve({ valid: true }));
    await wrapper.vm.loadNextStep();
    expect(validateFormSpy).toHaveBeenCalled();
    expect(wrapper.vm.stepIndex).toBe(0);
    wrapper.vm.loadPreviousStep();
    expect(wrapper.vm.stepIndex).toBe(-1);
  });

  it('sets modal title', () => {
    wrapper.vm.initialiseData();
    wrapper.vm.stepIndex = -1;
    expect(wrapper.vm.modalTitle).toBe('newObject');
    wrapper.vm.stepIndex = 0;
    expect(wrapper.vm.modalTitle).toBe('objectPermissions');
    wrapper.vm.stepIndex = 1;
    expect(wrapper.vm.modalTitle).toBe('dynamic');
    wrapper.vm.stepIndex = 2;
    expect(wrapper.vm.modalTitle).toBe('timeConstraint');
  });

  it('saves form', async () => {
    const successURL = '/am/console';
    jest.spyOn(wrapper.vm, 'getRequestService').mockImplementation(() => ({ post: () => Promise.resolve({ data: { successURL } }) }));
    const displayNotificationSpy = jest.spyOn(wrapper.vm, 'displayNotification');
    wrapper.vm.initialiseData();
    expect(wrapper.vm.formFields).toStrictEqual({
      boolTest: false,
      password: '',
      privileges: '',
      arrayTest: [],
    });
    wrapper.vm.isSaving = true;
    wrapper.vm.saveForm();

    expect(displayNotificationSpy).not.toHaveBeenCalled();
    wrapper.vm.isSaving = false;
    await wrapper.vm.saveForm();
    expect(displayNotificationSpy).toHaveBeenCalled();

    wrapper.vm.formFields = {};
    jest.spyOn(wrapper.vm.$refs.observer, 'validate').mockImplementation(() => Promise.resolve({ valid: true }));
    wrapper.vm.isSaving = false;
    await wrapper.vm.saveForm();

    expect(wrapper.vm.clonedCreateProperties).toStrictEqual([{
      key: 'privileges',
      default: 'testDefault',
      isConditional: false,
      isTemporalConstraint: false,
      type: 'string',
      field: 'password',
      validation: 'required',
      value: 'testDefault',
    },
    {
      key: 'password',
      isConditional: true,
      isTemporalConstraint: false,
      type: 'password',
      title: 'password',
      encryption: {},
      validation: 'required',
      value: null,
    },
    {
      key: 'boolTest',
      isConditional: false,
      isTemporalConstraint: true,
      type: 'boolean',
      title: 'boolTest',
      validation: 'required',
      value: false,
    },
    {
      key: 'arrayTest',
      isConditional: false,
      isTemporalConstraint: false,
      items: { type: 'test' },
      type: 'array',
      title: 'arrayTest',
      validation: 'required',
      value: [],
    }]);
    expect(wrapper.vm.formFields).toStrictEqual({
      boolTest: false,
      arrayTest: [],
      privileges: 'testDefault',
    });
    expect(displayNotificationSpy).toHaveBeenCalled();
  });

  it('sets relationship value', async () => {
    wrapper.vm.initialiseData();
    expect(wrapper.vm.formFields).toStrictEqual({
      boolTest: false,
      password: '',
      privileges: '',
      arrayTest: [],
    });
    expect(wrapper.vm.clonedCreateProperties[1].value).toBe(null);
    wrapper.vm.setRelationshipValue('testData', 'password');
    expect(wrapper.vm.clonedCreateProperties[1].value).toBe('testData');
  });

  it('getFieldType should return the correct field type', () => {
    const field = {
      type: 'string',
    };

    expect(wrapper.vm.getFieldType(field)).toBe('string');

    field.type = 'boolean';
    expect(wrapper.vm.getFieldType(field)).toBe('checkbox');

    field.format = 'date';
    expect(wrapper.vm.getFieldType(field)).toBe('date');
  });
});
