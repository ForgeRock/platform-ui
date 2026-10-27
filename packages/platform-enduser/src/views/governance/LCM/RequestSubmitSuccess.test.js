/**
 * Copyright (c) 2025-2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { flushPromises, mount } from '@vue/test-utils';
import RequestSubmitSuccess from './RequestSubmitSuccess';
import i18n from '@/i18n';

describe('RequestSubmitSuccess', () => {
  let wrapper;

  function mountComponent(props = {}) {
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
        ...props,
      },
    });
  }

  it('shows success text', () => {
    wrapper = mountComponent();

    expect(wrapper.text()).toMatch('SuccessTest');
  });

  it('shows the default "Request Submitted" heading when no headingText is given', () => {
    wrapper = mountComponent();

    expect(wrapper.text()).toMatch('Request Submitted');
  });

  it('shows a custom heading when headingText is given', () => {
    wrapper = mountComponent({ headingText: 'Draft Role Saved' });

    expect(wrapper.text()).toMatch('Draft Role Saved');
    expect(wrapper.text()).not.toMatch('Request Submitted');
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
