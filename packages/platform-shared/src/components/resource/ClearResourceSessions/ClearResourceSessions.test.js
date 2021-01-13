/**
 * Copyright (c) 2021 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount } from '@vue/test-utils';
import ClearResourceSessions from './index';

describe('Clear Resource Sessions', () => {
  let wrapper;

  function createWrapper(clearSessions = jest.fn().mockReturnValue(Promise.resolve())) {
    return mount(ClearResourceSessions, {
      mocks: {
        $t: (msg) => msg,
      },
      propsData: {
        clearSessions,
        closeModal: jest.fn().mockReturnValue(Promise.resolve()),
        resourceId: 'id',
        resourceName: 'Paul Daniels',
        isTesting: true,
      },
    });
  }

  it('Calls the closeModal method when cancelled, without calling the clearSessions method', async () => {
    wrapper = createWrapper();

    const cancelButton = wrapper.find('[data-test-id="cancelButton"]');
    cancelButton.trigger('click');

    expect(wrapper.vm.closeModal).toHaveBeenCalled();
    expect(wrapper.vm.clearSessions).not.toHaveBeenCalled();
  });

  describe('Clearing sessions', () => {
    it('Calls clearSessionsAndClose when the clear sessions button is clicked', async () => {
      wrapper = createWrapper();
      const clearAndCloseSpy = jest.spyOn(wrapper.vm, 'clearSessionsAndClose');

      const clearButton = wrapper.find('[data-test-id="clearSessionsButton"]');
      clearButton.trigger('click');

      expect(clearAndCloseSpy).toHaveBeenCalled();
    });

    it('calls the clear and close methods, and displays a notification when clearing sessions is successful', async () => {
      wrapper = createWrapper();

      const displayNotificationSpy = jest.spyOn(wrapper.vm, 'displayNotification');

      await wrapper.vm.clearSessionsAndClose();

      expect(wrapper.vm.clearSessions).toHaveBeenCalled();
      expect(wrapper.vm.closeModal).toHaveBeenCalled();
      expect(displayNotificationSpy).toHaveBeenCalled();
    });

    it('calls the clear and close methods, and displays an error notification when clearing sessions is not successful', async () => {
      const clearFn = jest.fn().mockReturnValue(Promise.reject());
      wrapper = createWrapper(clearFn);

      const showErrorSpy = jest.spyOn(wrapper.vm, 'showErrorMessage');

      await wrapper.vm.clearSessionsAndClose();

      expect(clearFn).toHaveBeenCalled();
      expect(wrapper.vm.closeModal).toHaveBeenCalled();
      expect(showErrorSpy).toHaveBeenCalled();
    });
  });
});
