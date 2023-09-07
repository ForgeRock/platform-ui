/**
 * Copyright (c) 2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount, flushPromises } from '@vue/test-utils';
import { findByTestId, findComponentByTestId } from '@forgerock/platform-shared/src/utils/testHelpers';
import { setupTestPinia } from '@forgerock/platform-shared/src/utils/testPiniaHelpers';
import * as CommonsApi from '@forgerock/platform-shared/src/api/governance/CommonsApi';
import Notifications from '@kyvg/vue3-notification';
import ValidationRules from '@forgerock/platform-shared/src/utils/validationRules';
import { nextTick } from 'vue';
import * as DirectoryApi from '@/api/governance/DirectoryApi';
import AddDelegateModal from './index';
import i18n from '@/i18n';

ValidationRules.extendRules({
  is_before_date: ValidationRules.getRules(i18n).is_before_date,
});

jest.mock('@/api/governance/DirectoryApi');

describe('AddDelegateModal', () => {
  let wrapper;

  CommonsApi.getResource = jest.fn().mockReturnValue(Promise.resolve({ data: {} }));
  DirectoryApi.addTaskProxy = jest.fn().mockReturnValue(Promise.resolve({ data: { result: [] } }));

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
        },
        plugins: [Notifications],
      },
      props: {
        isTesting: true,
      },
    });
  });

  it('clicking save calls to add a task proxy', async () => {
    const addTaskProxy = jest.spyOn(DirectoryApi, 'addTaskProxy');
    const displayNotificationSpy = jest.spyOn(wrapper.vm, 'displayNotification');

    const saveButton = findByTestId(wrapper, 'save-button');
    await saveButton.trigger('click');
    await flushPromises();

    expect(addTaskProxy).toBeCalledWith('testId', [''], null, null);
    expect(displayNotificationSpy).toHaveBeenCalled();
    expect(wrapper.emitted()['delegate-added']).toBeTruthy();
  });

  it('a failed save shows an error notification', async () => {
    const addTaskProxy = jest.spyOn(DirectoryApi, 'addTaskProxy').mockRejectedValue();
    const errorSpy = jest.spyOn(wrapper.vm, 'showErrorMessage');

    const saveButton = findByTestId(wrapper, 'save-button');
    await saveButton.trigger('click');
    await flushPromises();

    expect(addTaskProxy).toBeCalledWith('testId', [''], null, null);
    expect(errorSpy).toHaveBeenCalled();
  });

  it('should restrict the user to save when the end-date is not in the future as the start-date and the time constraint feature is enabled', async () => {
    const addTaskProxy = jest.spyOn(DirectoryApi, 'addTaskProxy');

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
      [''],
      '2023-02-01',
      '2023-02-02',
    );
  });
});
