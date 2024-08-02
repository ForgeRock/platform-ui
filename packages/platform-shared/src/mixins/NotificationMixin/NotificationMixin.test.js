/**
 * Copyright (c) 2021-2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { shallowMount } from '@vue/test-utils';
import { notify } from '@kyvg/vue3-notification';
import NotificationMixin from './index';

jest.mock('@kyvg/vue3-notification');

let wrapper;

describe('NotificationMixin', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    wrapper = shallowMount({}, {
      render() { },
      global: {
        mixins: [NotificationMixin],
        mocks: {
          $t: (id) => id,
          getTranslation: (id) => id,
        },
      },
    });
  });

  it('Displays a non-error notification', async () => {
    wrapper.vm.displayNotification('foo', 'message');
    expect(notify).toHaveBeenCalledWith({ type: 'foo', text: 'message', duration: 3000 });
  });

  it('Displays an error notification', () => {
    wrapper.vm.showErrorMessage('error', 'message');
    expect(notify).toHaveBeenCalledWith({ type: 'danger', text: 'message', duration: 3000 });
  });

  it('Shows an error message with a default message', () => {
    const displaySpy = jest.spyOn(wrapper.vm, 'displayNotification').mockImplementation();
    wrapper.vm.showErrorMessage('error', 'default');
    expect(displaySpy).toHaveBeenCalledWith('danger', 'default');
  });

  it('Shows an error message with a parsed message', () => {
    const errorObj = { response: { data: { message: 'error message' } } };
    const displaySpy = jest.spyOn(wrapper.vm, 'displayNotification').mockImplementation();

    wrapper.vm.showErrorMessage(errorObj, 'default');
    // the error message returns undefined since this isn't being rendered,
    // just ensuring that the default message isn't shown if an error msg is given
    expect(displaySpy).toHaveBeenCalledWith('danger', undefined);
  });
});
