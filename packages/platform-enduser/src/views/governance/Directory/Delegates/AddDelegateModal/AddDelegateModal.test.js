/**
 * Copyright (c) 2023-2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount, flushPromises } from '@vue/test-utils';
import { mockValidation } from '@forgerock/platform-shared/src/testing/utils/mockValidation';
import { findByTestId, findComponentByTestId } from '@forgerock/platform-shared/src/utils/testHelpers';
import { setupTestPinia } from '@forgerock/platform-shared/src/utils/testPiniaHelpers';
import * as CommonsApi from '@forgerock/platform-shared/src/api/governance/CommonsApi';
import * as ManagedResourceApi from '@forgerock/platform-shared/src/api/ManagedResourceApi';
import Notifications from '@kyvg/vue3-notification';
import { nextTick } from 'vue';
import * as DirectoryApi from '@/api/governance/DirectoryApi';
import AddDelegateModal from './index';

mockValidation(['required', 'is_before_date']);

jest.mock('@/api/governance/DirectoryApi');

describe('AddDelegateModal', () => {
  let wrapper;

  CommonsApi.getResource = jest.fn().mockReturnValue(Promise.resolve({ data: {} }));
  DirectoryApi.addTaskProxy = jest.fn().mockReturnValue(Promise.resolve({ data: { result: [] } }));
  ManagedResourceApi.getManagedResourceList = jest.fn().mockReturnValue(Promise.resolve({ data: { result: [] } }));

  afterAll(() => {
    jest.clearAllMocks();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    setupTestPinia({ user: { userId: 'testId' } });
    wrapper = mount(AddDelegateModal, {
      global: {
        mocks: {
          $t: (t) => t,
          $store: {
            state: {
              SharedStore: {
                uiConfig: {},
              },
            },
          },
        },
        plugins: [Notifications],
      },
      props: {
        isTesting: true,
      },
    });
  });

  it('modal should not render semantic header and footer elements', () => {
    expect(wrapper.find('header').exists()).toBe(false);
    expect(wrapper.find('footer').exists()).toBe(false);
  });

  it('close button should be rendered within div tag with modal-header class', () => {
    const modalHeader = wrapper.find('div.modal-header');
    expect(modalHeader.exists()).toBe(true);

    const closeButton = modalHeader.find('button.close');
    expect(closeButton.exists()).toBe(true);
  });

  it('save and cancel buttons should be rendered within div tag with modal-footer class', () => {
    const modalFooter = wrapper.find('div.modal-footer');
    expect(modalFooter.exists()).toBe(true);

    const cancelButton = modalFooter.find('button.btn-link');
    const saveButton = modalFooter.find('[data-testid="save-button"]');

    expect(cancelButton.exists()).toBe(true);
    expect(cancelButton.text()).toBe('common.cancel');
    expect(saveButton.exists()).toBe(true);
    expect(saveButton.text()).toBe('common.save');
  });

  it('cancel button should reset the modal data', async () => {
    const modalFooter = wrapper.find('div.modal-footer');
    const cancelButton = modalFooter.find('button.btn-link');
    await cancelButton.trigger('click');
    await flushPromises();

    expect(wrapper.vm.delegates).toEqual([]);
    expect(wrapper.vm.enableTimeConstraint).toBe(false);
    expect(wrapper.vm.startDate).toEqual('');
    expect(wrapper.vm.endDate).toEqual('');
  });

  it('save button disabled when no user is selected', () => {
    const saveButton = findByTestId(wrapper, 'save-button');

    expect(saveButton.attributes('disabled')).toBe('');
  });

  it('clicking save calls to add a task proxy', async () => {
    const addTaskProxy = jest.spyOn(DirectoryApi, 'addTaskProxy');
    const displayNotificationSpy = jest.spyOn(wrapper.vm, 'displayNotification');

    const userSelect = wrapper.findComponent({ name: 'ResourceSelect' });
    userSelect.vm.$emit('input', [{ _id: 'testUserId' }]);
    await flushPromises();

    const saveButton = findByTestId(wrapper, 'save-button');

    expect(saveButton.attributes('disabled')).toBeUndefined();

    await saveButton.trigger('click');
    await flushPromises();

    expect(addTaskProxy).toHaveBeenCalledWith('testId', ['managed/user/testUserId'], null, null);
    expect(displayNotificationSpy).toHaveBeenCalled();
    expect(wrapper.emitted()['delegate-added']).toBeTruthy();
  });

  it('a failed save shows an error notification', async () => {
    const error = new Error('Error');
    const addTaskProxy = jest.spyOn(DirectoryApi, 'addTaskProxy').mockRejectedValue(error);
    const errorSpy = jest.spyOn(wrapper.vm, 'showErrorMessage');

    const userSelect = wrapper.findComponent({ name: 'ResourceSelect' });
    userSelect.vm.$emit('input', [{ _id: 'testUserId' }]);
    await flushPromises();

    const saveButton = findByTestId(wrapper, 'save-button');
    await saveButton.trigger('click');
    await flushPromises();

    expect(addTaskProxy).toHaveBeenCalledWith('testId', ['managed/user/testUserId'], null, null);
    expect(errorSpy).toHaveBeenCalledWith(error, 'governance.delegates.errorAddingDelegate');
    expect(wrapper.emitted()['delegate-added']).toBeUndefined();
  });

  it('should restrict the user to save when the end-date is not in the future as the start-date and the time constraint feature is enabled', async () => {
    const addTaskProxy = jest.spyOn(DirectoryApi, 'addTaskProxy');

    const userSelect = wrapper.findComponent({ name: 'ResourceSelect' });
    userSelect.vm.$emit('input', [{ _id: 'testUserId' }]);
    await flushPromises();

    const enableTime = findByTestId(wrapper, 'enable-time-constraint');
    await enableTime.setChecked(true);
    await flushPromises();

    const startDate = findComponentByTestId(wrapper, 'start-date');
    startDate.vm.$emit('input', '2023-02-01');
    await nextTick();
    await flushPromises();

    const endDate = findComponentByTestId(wrapper, 'end-date');
    endDate.vm.$emit('input', '2023-02-02');
    await nextTick();
    await flushPromises();

    const saveButton = findByTestId(wrapper, 'save-button');
    await saveButton.trigger('click');
    await flushPromises();

    expect(addTaskProxy).toBeCalledWith(
      'testId',
      ['managed/user/testUserId'],
      '2023-02-01',
      '2023-02-02',
    );
  });
});
