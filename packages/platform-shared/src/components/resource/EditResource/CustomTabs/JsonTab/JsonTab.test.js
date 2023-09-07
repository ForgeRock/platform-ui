/**
 * Copyright (c) 2020-2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { shallowMount } from '@vue/test-utils';
import Notifications from '@kyvg/vue3-notification';
import * as clipboard from 'clipboard-polyfill/text';
import JsonTab from './index';

describe('JsonTab', () => {
  it('copies values to clipboard', async () => {
    const wrapper = shallowMount(JsonTab, {
      global: {
        mocks: {
          $t: () => {},
        },
        plugins: [Notifications],
      },
      mounted: () => {},
    });

    jest.spyOn(clipboard, 'writeText').mockImplementation(() => Promise.resolve());
    const notificationSpy = jest.spyOn(wrapper.vm, 'displayNotification');
    const showErrorMessageSpy = jest.spyOn(wrapper.vm, 'showErrorMessage');
    await wrapper.vm.copyValueToClipboard();
    expect(notificationSpy).toHaveBeenCalled();
    jest.spyOn(clipboard, 'writeText').mockImplementation(() => Promise.reject());
    await wrapper.vm.copyValueToClipboard();
    expect(showErrorMessageSpy).toHaveBeenCalled();
  });
});
