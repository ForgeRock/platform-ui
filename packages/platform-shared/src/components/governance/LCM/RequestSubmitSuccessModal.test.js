/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount } from '@vue/test-utils';
import { findByText } from '@forgerock/platform-shared/src/utils/testHelpers';
import RequestSubmitSuccessModal from './RequestSubmitSuccessModal';
import i18n from '@/i18n';
import { setupTestPinia } from '../../../utils/testPiniaHelpers';

describe('RequestSubmitSuccessModal', () => {
  let wrapper;

  function mountComponent() {
    setupTestPinia({ user: {} });
    return mount(RequestSubmitSuccessModal, {
      global: {
        plugins: [i18n],
        mocks: {
          $router: { push: jest.fn() },
        },
      },
      props: {
        successText: 'SuccessTest',
        requestId: 'RequestIdTest',
        routerPath: 'AdministerEntitlements',
        isTesting: true,
      },
    });
  }

  it('shows success text', () => {
    wrapper = mountComponent();

    expect(wrapper.text()).toMatch('Success');
  });

  it('shows X close button', async () => {
    wrapper = mountComponent();
    const closeBtn = wrapper.find('button[aria-label="Close"]');
    expect(closeBtn.exists()).toBeTruthy();
  });

  it('shows close button', async () => {
    wrapper = mountComponent();
    const closeBtn = findByText(wrapper, 'button', 'Close');
    expect(closeBtn.exists()).toBeTruthy();
  });
});
