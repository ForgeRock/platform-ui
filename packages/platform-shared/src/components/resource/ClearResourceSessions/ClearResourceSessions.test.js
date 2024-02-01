/**
 * Copyright (c) 2021-2023 ForgeRock. All rights reserved.
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
      global: {
        mocks: {
          $t: (msg) => msg,
        },
      },
      props: {
        resourceName: 'Paul Daniels',
        isTesting: true,
      },
    });
  }

  it('Emits the close-modal event when cancelled', async () => {
    wrapper = createWrapper();

    const cancelButton = wrapper.find('[data-testid="cancelButton"]');
    cancelButton.trigger('click');

    await wrapper.vm.$nextTick();

    expect(wrapper.emitted()['close-modal']).toBeTruthy();
  });

  it('Emits the clear-sessions event when the clear sessions button is clicked', async () => {
    wrapper = createWrapper();

    const clearButton = wrapper.find('[data-testid="clearSessionsButton"]');
    clearButton.trigger('click');

    await wrapper.vm.$nextTick();

    expect(wrapper.emitted()['clear-sessions']).toBeTruthy();
  });

  it('shows and hides modal', async () => {
    wrapper = createWrapper();

    const showSpy = jest.spyOn(wrapper.vm.$refs.clearSessionsModal, 'show');
    await wrapper.setProps({
      show: true,
    });
    expect(showSpy).toHaveBeenCalled();
    const hideSpy = jest.spyOn(wrapper.vm.$refs.clearSessionsModal, 'hide');
    await wrapper.setProps({
      show: false,
    });
    expect(hideSpy).toHaveBeenCalled();
  });
});
