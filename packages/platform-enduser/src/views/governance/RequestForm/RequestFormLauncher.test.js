/**
 * Copyright (c) 2023-2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount, flushPromises } from '@vue/test-utils';
import { setupTestPinia } from '@forgerock/platform-shared/src/utils/testPiniaHelpers';
import * as AccessRequestApi from '@forgerock/platform-shared/src/api/governance/AccessRequestApi';
import * as RequestFormsApi from '@forgerock/platform-shared/src/api/governance/RequestFormsApi';
import * as RequestFormAssignmentsApi from '@forgerock/platform-shared/src/api/governance/RequestFormAssignmentsApi';
import i18n from '@/i18n';
import RequestFormLauncher from './RequestFormLauncher';

jest.mock('vue-router', () => ({
  useRoute: jest.fn(() => ({ params: { formId: 'testId' } })),
  useRouter: jest.fn(() => ({
    push: jest.fn(),
  })),
}));

const mountComponent = () => {
  setupTestPinia({ user: { userId: '1234' } });
  return mount(RequestFormLauncher, {
    global: {
      plugins: [i18n],
      mocks: {
        $store: {
          commit: jest.fn(),
          state: { SharedStore: { governanceEnabled: true } },
        },
        $route: {
          params: { formId: 'testId' },
        },
      },
    },
  });
};

describe('RequestFormLauncher', () => {
  let getFormSpy;
  let getRequestTypeSpy;

  beforeEach(() => {
    getRequestTypeSpy = jest.spyOn(RequestFormAssignmentsApi, 'getFormRequestTypes').mockResolvedValue({
      data: { result: [{ formId: 'testId', objectId: 'requestType/customRequestType' }] },
    });

    getFormSpy = jest.spyOn(RequestFormsApi, 'getRequestForm').mockResolvedValue({
      data: {
        id: 'testId',
        form: {
          fields: [
            {
              id: 'rowid',
              fields: [
                {
                  model: 'custom.testProperty1',
                  type: 'string',
                  label: 'testLabel',
                  validation: {
                    required: false,
                  },
                  layout: {
                    columns: 12,
                    offset: '0',
                  },
                },
              ],
            },
          ],
        },
      },
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should get form definition', async () => {
    mountComponent();
    await flushPromises();

    expect(getFormSpy).toBeCalledWith('testId');
  });

  it('should get request type for form if form definition is found', async () => {
    mountComponent();
    await flushPromises();

    expect(getFormSpy).toBeCalledWith('testId');
    expect(getRequestTypeSpy).toBeCalledWith('testId');
  });

  it('should submit a request of the correct type', async () => {
    const submitSpy = jest.spyOn(AccessRequestApi, 'submitCustomRequest').mockResolvedValue(true);

    const wrapper = mountComponent();
    await flushPromises();
    await wrapper.find('[aria-label="Submit Request"]').trigger('click');

    expect(submitSpy).toBeCalledWith('customRequestType', { common: {}, custom: { testProperty1: '' } });
  });

  it('should submit a request with form data', async () => {
    const submitSpy = jest.spyOn(AccessRequestApi, 'submitCustomRequest').mockResolvedValue(true);

    const wrapper = mountComponent();
    await flushPromises();
    await wrapper.findComponent('.fr-field').vm.$emit('input', 'a custom value');
    await wrapper.find('[aria-label="Submit Request"]').trigger('click');

    expect(submitSpy).toBeCalledWith('customRequestType', { common: {}, custom: { testProperty1: 'a custom value' } });
  });

  it('should display an error when there is no request type associated with form', async () => {
    getRequestTypeSpy = jest.spyOn(RequestFormAssignmentsApi, 'getFormRequestTypes').mockImplementation(() => Promise.resolve({
      data: { result: [] },
    }));

    const wrapper = mountComponent();
    await flushPromises();

    expect(getFormSpy).toBeCalledWith('testId');
    expect(getRequestTypeSpy).toBeCalledWith('testId');

    const error = wrapper.find('.alert-danger');
    expect(error.exists()).toBe(true);
    expect(error.text()).toBe('No request type found for this form');
  });
});
