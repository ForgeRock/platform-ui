/**
 * Copyright (c) 2021-2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { shallowMount } from '@vue/test-utils';
import Notifications from '@kyvg/vue3-notification';
import ResetPasswordModal from './index';

describe('ResetPasswordModal', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = shallowMount(ResetPasswordModal, {
      global: {
        mocks: {
          $t: () => { },
        },
        plugins: [Notifications],
      },
      props: {
        resourceType: 'resourceType',
        resourceName: 'resourceName',
        resourceId: 'resourceId',
      },
    });
  });

  afterEach(() => {
    wrapper.unmount();
  });

  it('saves password', async () => {
    const notificationSpy = jest.spyOn(wrapper.vm, 'displayNotification');
    const showErrorMessageSpy = jest.spyOn(wrapper.vm, 'showErrorMessage');
    jest.spyOn(wrapper.vm, 'getRequestService').mockImplementation(() => (
      {
        patch: () => Promise.resolve(),
      }
    ));
    await wrapper.vm.savePassword(() => { });
    expect(notificationSpy).toHaveBeenCalledWith('success', undefined);

    const error400 = { response: { status: 400 } };
    jest.spyOn(wrapper.vm, 'getRequestService').mockImplementation(() => (
      {
        patch: () => Promise.reject(error400),
      }
    ));
    await wrapper.vm.savePassword(() => { });
    expect(showErrorMessageSpy).toHaveBeenCalledWith({ response: { status: 400 } }, undefined);
  });
});
