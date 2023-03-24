/**
 * Copyright (c) 2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount } from '@vue/test-utils';
import dayjs from 'dayjs';
import flushPromises from 'flush-promises';
import { findByTestId } from '@forgerock/platform-shared/src/utils/testHelpers';
import * as CommonsApi from '@forgerock/platform-shared/src/api/governance/CommonsApi';
import * as GovernanceEnduserApi from '@/api/GovernanceEnduserApi';
import AddDelegateModal from './index';

jest.mock('@/api/GovernanceEnduserApi');
jest.mock('dayjs');

describe('AddDelegateModal', () => {
  let wrapper;

  CommonsApi.getResource = jest.fn().mockReturnValue(Promise.resolve({ data: {} }));
  GovernanceEnduserApi.addTaskProxy = jest.fn().mockReturnValue(Promise.resolve({ data: { result: [] } }));

  dayjs.mockImplementation((time) => ({
    local: () => ({
      format: () => time,
    }),
  }));

  beforeEach(() => {
    jest.clearAllMocks();
    wrapper = mount(AddDelegateModal, {
      mocks: {
        $t: (t) => t,
        $store: {
          state: {
            UserStore: {
              userId: 'testId',
            },
          },
        },
      },
      propsData: {
        isTesting: true,
      },
    });
  });

  it('clicking save calls to add a task proxy', async () => {
    const addTaskProxy = jest.spyOn(GovernanceEnduserApi, 'addTaskProxy');
    const displayNotificationSpy = jest.spyOn(wrapper.vm, 'displayNotification');
    const saveButton = findByTestId(wrapper, 'save-button');
    await saveButton.trigger('click');
    await flushPromises();

    expect(addTaskProxy).toBeCalledWith('testId', [''], null, null);
    expect(displayNotificationSpy).toHaveBeenCalled();
    expect(wrapper.emitted()['delegate-added']).toBeTruthy();
  });

  it('a failed save shows an error notification', async () => {
    const addTaskProxy = jest.spyOn(GovernanceEnduserApi, 'addTaskProxy').mockRejectedValue();
    const errorSpy = jest.spyOn(wrapper.vm, 'showErrorMessage');

    const saveButton = findByTestId(wrapper, 'save-button');
    await saveButton.trigger('click');
    await flushPromises();

    expect(addTaskProxy).toBeCalledWith('testId', [''], null, null);
    expect(errorSpy).toHaveBeenCalled();
  });

  it('should restrict the user to save when the end-date is not in the future as the start-date and the time constraint feature is enabled', async () => {
    const addTaskProxy = jest.spyOn(GovernanceEnduserApi, 'addTaskProxy');

    const enableTime = findByTestId(wrapper, 'enable-time-constraint');
    await enableTime.setChecked(true);

    const startDate = findByTestId(wrapper, 'start-date');
    startDate.vm.$emit('input', '2023-02-01');

    const endDate = findByTestId(wrapper, 'end-date');
    endDate.vm.$emit('input', '2023-02-02');

    const saveButton = findByTestId(wrapper, 'save-button');
    await saveButton.trigger('click');

    expect(addTaskProxy).toBeCalledWith(
      'testId',
      [''],
      '2023-02-01',
      '2023-02-02',
    );
  });
});
