/**
 * Copyright (c) 2021-2026 ForgeRock. All rights reserved.
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
    expect(displaySpy).toHaveBeenCalledWith('danger', 'error message');
  });

  it('Decodes HTML entities in the error response message', () => {
    const errorObj = { response: { data: { message: '&#39;fr-idm-uuid&#61;02c2681b-d6ae-42ad-83da-ca39fcb19fb0asdf,ou&#61;user,o&#61;alpha,o&#61;root,ou&#61;identities&#39;' } } };
    const displaySpy = jest.spyOn(wrapper.vm, 'displayNotification').mockImplementation();

    wrapper.vm.showErrorMessage(errorObj, 'default');
    expect(displaySpy).toHaveBeenCalledWith('danger', '\'fr-idm-uuid=02c2681b-d6ae-42ad-83da-ca39fcb19fb0asdf,ou=user,o=alpha,o=root,ou=identities\'');
  });

  it('Strips XSS payloads from the error response message instead of rendering them', () => {
    const xssPayload = decodeURIComponent('%3Cimg%20src%3D%22invalid-image-source%22%20onerror%3D%22alert(%27XSS%20Attack%20Successful!%27)%22%3E%0A');
    const errorObj = { response: { data: { message: xssPayload } } };
    const displaySpy = jest.spyOn(wrapper.vm, 'displayNotification').mockImplementation();

    wrapper.vm.showErrorMessage(errorObj, 'default');
    expect(displaySpy).toHaveBeenCalledWith('danger', '\n');
  });
});
