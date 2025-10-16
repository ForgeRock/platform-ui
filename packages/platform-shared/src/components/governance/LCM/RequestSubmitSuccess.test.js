/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { flushPromises, mount } from '@vue/test-utils';
import RequestSubmitSuccess from './RequestSubmitSuccess';
import i18n from '@/i18n';

describe('RequestSubmitSuccess', () => {
  let wrapper;

  function mountComponent() {
    return mount(RequestSubmitSuccess, {
      global: {
        plugins: [i18n],
        mocks: {
          $router: { push: jest.fn() },
        },
      },
      props: {
        successText: 'SuccessTest',
        requestId: 'RequestIdTest',
      },
    });
  }

  it('shows success text', () => {
    wrapper = mountComponent();

    expect(wrapper.text()).toMatch('SuccessTest');
  });

  it('displays link to request details', () => {
    wrapper = mountComponent();

    expect(wrapper.text()).toMatch('View Request');
  });

  it('navigates to my requests page when clicking link', async () => {
    wrapper = mountComponent();

    const routerPushSpy = jest.spyOn(wrapper.vm.$router, 'push');
    wrapper.find('button').trigger('click');
    await flushPromises();

    expect(routerPushSpy).toHaveBeenCalledWith({
      name: 'MyRequestDetails',
      params: { requestId: 'RequestIdTest' },
    });
  });
});
