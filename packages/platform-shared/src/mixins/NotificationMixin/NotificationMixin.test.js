/**
 * Copyright (c) 2021-2022 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { shallowMount } from '@vue/test-utils';
import NotificationMixin from './index';

let wrapper;

describe('NotificationMixin', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    wrapper = shallowMount({}, {
      render() { },
      mixins: [NotificationMixin],
      mocks: {
        $t: (id) => id,
        getTranslation: (id) => id,
      },
    });
  });

  it('Displays a non-error notification', () => {
    const notifySpy = jest.spyOn(wrapper.vm, '$notify').mockImplementation();
    wrapper.vm.displayNotification('foo', 'message');
    expect(notifySpy).toHaveBeenCalledWith({ type: 'foo', text: 'message' });
  });

  it('Displays an error notification', () => {
    const notifySpy = jest.spyOn(wrapper.vm, '$notify').mockImplementation();
    wrapper.vm.displayNotification('error', 'message');
    expect(notifySpy).toHaveBeenCalledWith({ type: 'danger', text: 'message' });
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
