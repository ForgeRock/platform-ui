/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { flushPromises, mount } from '@vue/test-utils';
import { setupTestPinia } from '@forgerock/platform-shared/src/utils/testPiniaHelpers';
import RestMixin from '@forgerock/platform-shared/src/mixins/RestMixin';
import AccountSecurity from './index';
import i18n from '@/i18n';

describe('Account Security', () => {
  function setup(props = {}) {
    setupTestPinia();
    return mount(AccountSecurity, {
      global: {
        plugins: [i18n],
        mocks: {
          $store: {
            state: {
              SharedStore: {
                amBaseURL: '',
              },
            },
          },
        },
      },
      props: {
        ...props,
      },
    });
  }

  beforeEach(() => {
    jest.clearAllMocks();

    RestMixin.methods.getRequestService = jest.fn().mockImplementation(() => ({
      get: jest.fn().mockResolvedValue({
        data: {
          givenName: 'John',
          sn: 'Doe',
          mapping: {
            updatePassword: 'updatePasswordJourney',
            updateUsername: 'updateUsernameJourney',
          },
        },
      }),
    }));
  });

  it('should SHOW the password and username edit link buttons if the hideUsernameAndPasswordUpdate prop is set to false', async () => {
    const wrapper = setup();
    await flushPromises();

    const userUpdateLink = wrapper.find('[aria-label="Update Username"]');
    const passwordResetLink = wrapper.find('[aria-label="Reset Password"]');
    expect(userUpdateLink.attributes('aria-label')).toBe('Update Username');
    expect(passwordResetLink.attributes('aria-label')).toBe('Reset Password');
  });

  it('should HIDE the password and username edit link buttons if the hideUsernameAndPasswordUpdate prop is set to true', async () => {
    const wrapper = setup({ hideUsernameAndPasswordUpdate: true });
    await flushPromises();

    const userUpdateLink = wrapper.find('[aria-label="Update Username"]');
    const passwordResetLink = wrapper.find('[aria-label="Reset Password"]');
    expect(userUpdateLink.exists()).toBe(false);
    expect(passwordResetLink.exists()).toBe(false);
  });
});
