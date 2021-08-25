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

  function createWrapper() {
    return mount(ClearResourceSessions, {
      mocks: {
        $t: (msg) => msg,
      },
      propsData: {
        resourceName: 'Paul Daniels',
        isTesting: true,
      },
    });
  }

  it('Emits the close-modal event when cancelled', async () => {
    wrapper = createWrapper();

    const cancelButton = wrapper.find('[data-test-id="cancelButton"]');
    cancelButton.trigger('click');

    await wrapper.vm.$nextTick();

    expect(wrapper.emitted()['close-modal']).toBeTruthy();
  });

  it('Emits the clear-sessions event when the clear sessions button is clicked', async () => {
    wrapper = createWrapper();

    const clearButton = wrapper.find('[data-test-id="clearSessionsButton"]');
    clearButton.trigger('click');

    await wrapper.vm.$nextTick();

    expect(wrapper.emitted()['clear-sessions']).toBeTruthy();
  });

  it('shows and hides modal', () => {
    wrapper.vm.$refs = {
      clearSessionsModal: {
        show: () => {},
        hide: () => {},
      },
    };
    const showSpy = jest.spyOn(wrapper.vm.$refs.clearSessionsModal, 'show');
    wrapper.setProps({
      show: true,
    });
    expect(showSpy).toHaveBeenCalled();
    const hideSpy = jest.spyOn(wrapper.vm.$refs.clearSessionsModal, 'hide');
    wrapper.setProps({
      show: false,
    });
    expect(hideSpy).toHaveBeenCalled();
  });
});
