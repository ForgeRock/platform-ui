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

  it('reports 2-step verification as ON when only a Recognize device is enrolled', async () => {
    const getMock = jest.fn().mockImplementation((url) => {
      if (url.includes('/devices/2fa/recognize')) {
        return Promise.resolve({ data: { result: [{ _id: 'recognize-device-1' }] } });
      }
      if (url.includes('/devices/2fa/')) {
        return Promise.resolve({ data: { result: [] } });
      }
      return Promise.resolve({
        data: {
          givenName: 'John',
          sn: 'Doe',
          mapping: {},
        },
      });
    });
    RestMixin.methods.getRequestService = jest.fn().mockImplementation(() => ({ get: getMock }));

    const wrapper = setup();
    await flushPromises();

    expect(wrapper.vm.mfaItem.text).toBe('On');
    expect(wrapper.vm.mfaItem.linkPath).toBe('/auth-devices');
  });

  it('treats a 404 response from the Recognize endpoint as a normal no-device response', async () => {
    const recognizeNotFound = new Error('Not Found');
    recognizeNotFound.response = { status: 404 };
    const getMock = jest.fn().mockImplementation((url) => {
      if (url.includes('/devices/2fa/recognize')) {
        return Promise.reject(recognizeNotFound);
      }
      if (url.includes('/devices/2fa/')) {
        return Promise.resolve({ data: { result: [] } });
      }
      return Promise.resolve({
        data: {
          givenName: 'John',
          sn: 'Doe',
          mapping: {},
        },
      });
    });
    RestMixin.methods.getRequestService = jest.fn().mockImplementation(() => ({ get: getMock }));

    const wrapper = setup();
    const displayNotificationSpy = jest.spyOn(wrapper.vm, 'displayNotification').mockImplementation();
    await flushPromises();

    expect(displayNotificationSpy).not.toHaveBeenCalled();
  });

  it('reports one generic error for multiple failures while preserving On for an enrolled device', async () => {
    const oathError = { response: { status: 500, data: { message: 'OATH server error' } } };
    const recognizeError = { response: { status: 500, data: { message: 'Recognize server error' } } };
    const getMock = jest.fn().mockImplementation((url) => {
      if (url.includes('/devices/2fa/oath')) {
        return Promise.reject(oathError);
      }
      if (url.includes('/devices/2fa/recognize')) {
        return Promise.reject(recognizeError);
      }
      if (url.includes('/devices/2fa/webauthn')) {
        return Promise.resolve({ data: { result: [{ _id: 'webauthn-device-1' }] } });
      }
      if (url.includes('/devices/2fa/')) {
        return Promise.resolve({ data: { result: [] } });
      }
      return Promise.resolve({
        data: {
          givenName: 'John',
          sn: 'Doe',
          mapping: {},
        },
      });
    });
    RestMixin.methods.getRequestService = jest.fn().mockImplementation(() => ({ get: getMock }));

    const wrapper = setup();
    const displayNotificationSpy = jest.spyOn(wrapper.vm, 'displayNotification').mockImplementation();
    await flushPromises();

    expect(displayNotificationSpy).toHaveBeenCalledTimes(1);
    expect(displayNotificationSpy).toHaveBeenCalledWith(
      'danger',
      'There was an error loading authentication devices.',
    );
    expect(wrapper.vm.mfaItem.text).toBe('On');
  });

  it('reports a generic error and leaves MFA Off without an enable link when no devices are returned after a failure', async () => {
    const oathError = { response: { status: 500 } };
    const getMock = jest.fn().mockImplementation((url) => {
      if (url.includes('/devices/2fa/oath')) {
        return Promise.reject(oathError);
      }
      if (url.includes('/devices/2fa/')) {
        return Promise.resolve({ data: { result: [] } });
      }
      return Promise.resolve({
        data: {
          givenName: 'John',
          sn: 'Doe',
          mapping: {
            addDevice: 'addDeviceJourney',
            removeDevice: 'removeDeviceJourney',
          },
        },
      });
    });
    RestMixin.methods.getRequestService = jest.fn().mockImplementation(() => ({ get: getMock }));

    const wrapper = setup();
    const displayNotificationSpy = jest.spyOn(wrapper.vm, 'displayNotification').mockImplementation();
    await flushPromises();

    expect(displayNotificationSpy).toHaveBeenCalledTimes(1);
    expect(displayNotificationSpy).toHaveBeenCalledWith(
      'danger',
      'There was an error loading authentication devices.',
    );
    expect(wrapper.vm.mfaItem.iconType).toBe('OFF');
    expect(wrapper.vm.mfaItem.text).toBe('Off');
    expect(wrapper.vm.mfaItem.linkUrl).toBeUndefined();
    expect(wrapper.find('a[href*="addDeviceJourney"]').exists()).toBe(false);
  });

  it('reports a malformed fulfilled response and leaves MFA Off without an enable link when no valid devices are returned', async () => {
    const getMock = jest.fn().mockImplementation((url) => {
      if (url.includes('/devices/2fa/oath')) {
        return Promise.resolve({ data: {} });
      }
      if (url.includes('/devices/2fa/')) {
        return Promise.resolve({ data: { result: [] } });
      }
      return Promise.resolve({
        data: {
          givenName: 'John',
          sn: 'Doe',
          mapping: {
            addDevice: 'addDeviceJourney',
            removeDevice: 'removeDeviceJourney',
          },
        },
      });
    });
    RestMixin.methods.getRequestService = jest.fn().mockImplementation(() => ({ get: getMock }));

    const wrapper = setup();
    const displayNotificationSpy = jest.spyOn(wrapper.vm, 'displayNotification').mockImplementation();
    await flushPromises();

    expect(displayNotificationSpy).toHaveBeenCalledTimes(1);
    expect(displayNotificationSpy).toHaveBeenCalledWith(
      'danger',
      'There was an error loading authentication devices.',
    );
    expect(wrapper.vm.mfaItem.iconType).toBe('OFF');
    expect(wrapper.vm.mfaItem.text).toBe('Off');
    expect(wrapper.vm.mfaItem.linkUrl).toBeUndefined();
    expect(wrapper.find('a[href*="addDeviceJourney"]').exists()).toBe(false);
  });

  it('reports a malformed fulfilled response while preserving On for a valid device from another response', async () => {
    const getMock = jest.fn().mockImplementation((url) => {
      if (url.includes('/devices/2fa/oath')) {
        return Promise.resolve({ data: { result: {} } });
      }
      if (url.includes('/devices/2fa/webauthn')) {
        return Promise.resolve({ data: { result: [{ _id: 'webauthn-device-1' }] } });
      }
      if (url.includes('/devices/2fa/')) {
        return Promise.resolve({ data: { result: [] } });
      }
      return Promise.resolve({
        data: {
          givenName: 'John',
          sn: 'Doe',
          mapping: {},
        },
      });
    });
    RestMixin.methods.getRequestService = jest.fn().mockImplementation(() => ({ get: getMock }));

    const wrapper = setup();
    const displayNotificationSpy = jest.spyOn(wrapper.vm, 'displayNotification').mockImplementation();
    await flushPromises();

    expect(displayNotificationSpy).toHaveBeenCalledTimes(1);
    expect(displayNotificationSpy).toHaveBeenCalledWith(
      'danger',
      'There was an error loading authentication devices.',
    );
    expect(wrapper.vm.mfaItem.text).toBe('On');
  });
});
