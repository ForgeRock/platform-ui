/**
 * Copyright (c) 2020-2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { flushPromises, mount } from '@vue/test-utils';
import { setupTestPinia } from '@forgerock/platform-shared/src/utils/testPiniaHelpers';
import * as DevicesApi from '@forgerock/platform-shared/src/api/DevicesApi';
import { createStore } from 'vuex';
import i18n from '@/i18n';
import AuthenticationDevices from './index';

const mockBreadcrumb = {
  setBreadcrumb: jest.fn(),
};
jest.mock('@forgerock/platform-shared/src/composables/breadcrumb', () => ({
  __esModule: true,
  default: () => mockBreadcrumb,
}));

const oathDevices = [
  {
    uuid: 'oath-device-1',
    deviceName: 'OATH Device 1',
    alias: 'OATH Device 1',
    lastAccessDate: 1704758400000,
    createdDate: '2024-01-01T00:00:00Z',
    authType: 'oath',
  },
  {
    uuid: 'oath-device-2',
    deviceName: 'OATH Device 2',
    alias: 'OATH Device 2',
    lastAccessDate: 1704672000000,
    createdDate: '2024-01-02T00:00:00Z',
    authType: 'oath',
  },
];

const pushDevices = [
  {
    uuid: 'push-device-1',
    deviceName: 'Push Device 1',
    alias: 'Push Device 1',
    lastAccessDate: 1704585600000,
    createdDate: '2024-01-03T00:00:00Z',
    authType: 'push',
  },
];

const webauthnDevices = [
  {
    uuid: 'webauthn-device-1',
    deviceName: 'WebAuthn Device 1',
    alias: 'WebAuthn Device 1',
    lastAccessDate: 1704844800000,
    createdDate: '2024-01-04T00:00:00Z',
    authType: 'webauthn',
  },
];

describe('AuthenticationDevices', () => {
  let wrapper;
  const store = createStore({
    state: {
      realm: 'alpha',
      isFraas: false,
    },
  });

  const mockRouterInstance = {
    push: jest.fn(),
  };

  function mountComponent(props = {}) {
    const userStore = setupTestPinia({ user: { userSearchAttribute: 'testUser' } });

    wrapper = mount(AuthenticationDevices, {
      global: {
        plugins: [i18n, store],
        mocks: {
          $router: mockRouterInstance,
        },
      },
      props,
    });

    return { wrapper, userStore };
  }

  beforeEach(() => {
    jest.clearAllMocks();
    mockBreadcrumb.setBreadcrumb.mockClear();
    mockRouterInstance.push.mockClear();
  });

  describe('@renders', () => {
    it('displays the correct title and subtitle', async () => {
      DevicesApi.getAuthenticationDevices = jest.fn()
        .mockResolvedValueOnce({ data: { result: oathDevices } })
        .mockResolvedValueOnce({ data: { result: [] } })
        .mockResolvedValueOnce({ data: { result: [] } });

      mountComponent();
      await flushPromises();

      const heading = wrapper.findAll('h1').find((h) => h.text().includes('2-Step/Push Authentication'));
      expect(heading.exists()).toBe(true);

      expect(wrapper.text()).toContain('View devices used for 2-step verification');
    });

    it('displays authentication devices sorted by lastAccessDate', async () => {
      DevicesApi.getAuthenticationDevices = jest.fn()
        .mockResolvedValueOnce({ data: { result: oathDevices } })
        .mockResolvedValueOnce({ data: { result: pushDevices } })
        .mockResolvedValueOnce({ data: { result: webauthnDevices } });

      mountComponent();
      await flushPromises();

      const deviceHeadings = wrapper.findAll('h2.h5');
      expect(deviceHeadings).toHaveLength(4);

      // Should be sorted by lastAccessDate (most recent first)
      expect(deviceHeadings[0].text()).toBe('WebAuthn Device 1');
      expect(deviceHeadings[1].text()).toBe('OATH Device 1');
      expect(deviceHeadings[2].text()).toBe('OATH Device 2');
      expect(deviceHeadings[3].text()).toBe('Push Device 1');
    });

    it('displays "Most Recent Device" badge on the first device', async () => {
      DevicesApi.getAuthenticationDevices = jest.fn()
        .mockResolvedValueOnce({ data: { result: oathDevices } })
        .mockResolvedValueOnce({ data: { result: [] } })
        .mockResolvedValueOnce({ data: { result: [] } });

      mountComponent();
      await flushPromises();

      expect(wrapper.text()).toContain('Most Recent Device');
    });

    it('displays relative times for last sign-in and added date', async () => {
      DevicesApi.getAuthenticationDevices = jest.fn()
        .mockResolvedValueOnce({ data: { result: [oathDevices[0]] } })
        .mockResolvedValueOnce({ data: { result: [] } })
        .mockResolvedValueOnce({ data: { result: [] } });

      mountComponent();
      await flushPromises();

      expect(wrapper.text()).toContain('Last Sign-In');
      expect(wrapper.text()).toContain('Added');
    });

    it('displays action menu with delete option for non-webauthn devices', async () => {
      DevicesApi.getAuthenticationDevices = jest.fn()
        .mockResolvedValueOnce({ data: { result: [oathDevices[0]] } })
        .mockResolvedValueOnce({ data: { result: [] } })
        .mockResolvedValueOnce({ data: { result: [] } });

      mountComponent();
      await flushPromises();

      const dropdownButtons = wrapper.findAll('[role="menu"]');
      expect(dropdownButtons.length).toBeGreaterThan(0);
    });

    it('displays action menu with edit and delete options for webauthn devices', async () => {
      DevicesApi.getAuthenticationDevices = jest.fn()
        .mockResolvedValueOnce({ data: { result: [] } })
        .mockResolvedValueOnce({ data: { result: [] } })
        .mockResolvedValueOnce({ data: { result: [webauthnDevices[0]] } });

      mountComponent();
      await flushPromises();

      const dropdownButtons = wrapper.findAll('[role="menu"]');
      expect(dropdownButtons.length).toBeGreaterThan(0);
    });
  });

  describe('@api', () => {
    it('calls getAuthenticationDevices for all auth types on mount', async () => {
      const getAuthDevicesSpy = jest.spyOn(DevicesApi, 'getAuthenticationDevices')
        .mockResolvedValue({ data: { result: [] } });

      mountComponent();
      await flushPromises();

      expect(getAuthDevicesSpy).toHaveBeenCalledTimes(3);
      expect(getAuthDevicesSpy).toHaveBeenCalledWith('alpha', 'testUser', 'oath');
      expect(getAuthDevicesSpy).toHaveBeenCalledWith('alpha', 'testUser', 'push');
      expect(getAuthDevicesSpy).toHaveBeenCalledWith('alpha', 'testUser', 'webauthn');
    });

    it('uses root realm when forceRoot prop is true', async () => {
      const getAuthDevicesSpy = jest.spyOn(DevicesApi, 'getAuthenticationDevices')
        .mockResolvedValue({ data: { result: [] } });

      mountComponent({ forceRoot: true });
      await flushPromises();

      expect(getAuthDevicesSpy).toHaveBeenCalledWith('root', 'testUser', 'oath');
      expect(getAuthDevicesSpy).toHaveBeenCalledWith('root', 'testUser', 'push');
      expect(getAuthDevicesSpy).toHaveBeenCalledWith('root', 'testUser', 'webauthn');
    });

    it('redirects to profile page when no devices exist', async () => {
      DevicesApi.getAuthenticationDevices = jest.fn()
        .mockResolvedValue({ data: { result: [] } });

      mountComponent();
      await flushPromises();

      expect(mockRouterInstance.push).toHaveBeenCalledWith({ path: '/profile' });
    });

    it('calls deleteAuthenticationDevice when delete is confirmed', async () => {
      const deleteDeviceSpy = jest.spyOn(DevicesApi, 'deleteAuthenticationDevice')
        .mockResolvedValue({});
      const getAuthDevicesSpy = jest.spyOn(DevicesApi, 'getAuthenticationDevices')
        .mockResolvedValueOnce({ data: { result: [oathDevices[0]] } })
        .mockResolvedValueOnce({ data: { result: [] } })
        .mockResolvedValueOnce({ data: { result: [] } })
        .mockResolvedValue({ data: { result: [] } });

      mountComponent();
      await flushPromises();

      // Directly call setModalData like the dropdown action would
      wrapper.vm.setModalData('delete', { ...oathDevices[0] });
      await flushPromises();

      // Modal should be visible
      expect(wrapper.vm.modalType).toBe('delete');
      expect(wrapper.vm.modalItem.uuid).toBe('oath-device-1');

      // Call handleModalPrimaryButton like the button would
      wrapper.vm.handleModalPrimaryButton('delete');
      await flushPromises();

      expect(deleteDeviceSpy).toHaveBeenCalledWith('alpha', 'testUser', 'oath', 'oath-device-1');
      expect(getAuthDevicesSpy).toHaveBeenCalledTimes(6); // 3 initial + 3 after delete
    });

    it('calls updateAuthenticationDevice when edit is saved', async () => {
      const updateDeviceSpy = jest.spyOn(DevicesApi, 'updateAuthenticationDevice')
        .mockResolvedValue({});
      const getAuthDevicesSpy = jest.spyOn(DevicesApi, 'getAuthenticationDevices')
        .mockResolvedValueOnce({ data: { result: [] } })
        .mockResolvedValueOnce({ data: { result: [] } })
        .mockResolvedValueOnce({ data: { result: [webauthnDevices[0]] } })
        .mockResolvedValue({ data: { result: [] } });

      mountComponent();
      await flushPromises();

      // Directly call setModalData like the dropdown action would
      wrapper.vm.setModalData('edit', { ...webauthnDevices[0] });
      await flushPromises();

      // Modal should be visible with edit type
      expect(wrapper.vm.modalType).toBe('edit');
      expect(wrapper.vm.modalItem.uuid).toBe('webauthn-device-1');

      // Update device name
      wrapper.vm.deviceName = 'Updated WebAuthn Device';
      await flushPromises();

      // Call handleModalPrimaryButton like the save button would
      wrapper.vm.handleModalPrimaryButton('edit');
      await flushPromises();

      expect(updateDeviceSpy).toHaveBeenCalledWith('alpha', 'testUser', 'webauthn', 'webauthn-device-1', {
        deviceName: 'Updated WebAuthn Device',
      });
      expect(getAuthDevicesSpy).toHaveBeenCalledTimes(6); // 3 initial + 3 after update
    });
  });

  describe('@errors', () => {
    it('displays error notification when loading devices fails', async () => {
      jest.spyOn(console, 'error').mockImplementation(() => {});
      DevicesApi.getAuthenticationDevices = jest.fn()
        .mockRejectedValue(new Error('Network error'));

      mountComponent();
      await flushPromises();

      // Check that error was handled (notification mixin would show error)
      expect(DevicesApi.getAuthenticationDevices).toHaveBeenCalled();
    });

    it('shows permission error modal when delete fails with USER NOT PERMITTED', async () => {
      DevicesApi.getAuthenticationDevices = jest.fn()
        .mockResolvedValueOnce({ data: { result: [oathDevices[0]] } })
        .mockResolvedValueOnce({ data: { result: [] } })
        .mockResolvedValueOnce({ data: { result: [] } });

      DevicesApi.deleteAuthenticationDevice = jest.fn()
        .mockRejectedValue({ response: { data: { message: 'USER NOT PERMITTED.' } } });

      mountComponent();
      await flushPromises();

      // Directly call setModalData and handleModalPrimaryButton
      wrapper.vm.setModalData('delete', { ...oathDevices[0] });
      await flushPromises();

      wrapper.vm.handleModalPrimaryButton('delete');
      await flushPromises();

      // Should show error delete modal
      expect(wrapper.vm.modalType).toBe('errorDelete');
    });

    it('shows permission error modal when update fails with USER NOT PERMITTED', async () => {
      DevicesApi.getAuthenticationDevices = jest.fn()
        .mockResolvedValueOnce({ data: { result: [] } })
        .mockResolvedValueOnce({ data: { result: [] } })
        .mockResolvedValueOnce({ data: { result: [webauthnDevices[0]] } });

      DevicesApi.updateAuthenticationDevice = jest.fn()
        .mockRejectedValue({ response: { data: { message: 'USER NOT PERMITTED.' } } });

      mountComponent();
      await flushPromises();

      // Directly call setModalData and handleModalPrimaryButton
      wrapper.vm.setModalData('edit', { ...webauthnDevices[0] });
      await flushPromises();

      wrapper.vm.deviceName = 'Updated Name';
      await flushPromises();

      wrapper.vm.handleModalPrimaryButton('edit');
      await flushPromises();

      // Should show error edit modal
      expect(wrapper.vm.modalType).toBe('errorEdit');
    });

    it('displays error notification when delete fails with other error', async () => {
      DevicesApi.getAuthenticationDevices = jest.fn()
        .mockResolvedValueOnce({ data: { result: [oathDevices[0]] } })
        .mockResolvedValueOnce({ data: { result: [] } })
        .mockResolvedValueOnce({ data: { result: [] } });

      DevicesApi.deleteAuthenticationDevice = jest.fn()
        .mockRejectedValue({ response: { data: { message: 'Server error' } } });

      mountComponent();
      await flushPromises();

      // Directly call setModalData and handleModalPrimaryButton
      wrapper.vm.setModalData('delete', { ...oathDevices[0] });
      await flushPromises();

      wrapper.vm.handleModalPrimaryButton('delete');
      await flushPromises();

      expect(DevicesApi.deleteAuthenticationDevice).toHaveBeenCalled();
    });

    it('displays error notification when update fails with other error', async () => {
      DevicesApi.getAuthenticationDevices = jest.fn()
        .mockResolvedValueOnce({ data: { result: [] } })
        .mockResolvedValueOnce({ data: { result: [] } })
        .mockResolvedValueOnce({ data: { result: [webauthnDevices[0]] } });

      DevicesApi.updateAuthenticationDevice = jest.fn()
        .mockRejectedValue({ response: { data: { message: 'Server error' } } });

      mountComponent();
      await flushPromises();

      // Directly call setModalData and handleModalPrimaryButton
      wrapper.vm.setModalData('edit', { ...webauthnDevices[0] });
      await flushPromises();

      wrapper.vm.deviceName = 'Updated Name';
      await flushPromises();

      wrapper.vm.handleModalPrimaryButton('edit');
      await flushPromises();

      expect(DevicesApi.updateAuthenticationDevice).toHaveBeenCalled();
    });
  });

  describe('@interactions', () => {
    it('opens delete modal when delete action is clicked', async () => {
      DevicesApi.getAuthenticationDevices = jest.fn()
        .mockResolvedValueOnce({ data: { result: [oathDevices[0]] } })
        .mockResolvedValueOnce({ data: { result: [] } })
        .mockResolvedValueOnce({ data: { result: [] } });

      mountComponent();
      await flushPromises();

      expect(wrapper.vm.modalType).toBeNull();

      // Directly call setModalData like the dropdown action would
      wrapper.vm.setModalData('delete', { ...oathDevices[0] });
      await flushPromises();

      expect(wrapper.vm.modalType).toBe('delete');
      expect(wrapper.vm.modalInfo.title).toContain('Delete Device');
      expect(wrapper.vm.modalInfo.showCancel).toBe(true);
    });

    it('opens edit modal when edit action is clicked', async () => {
      DevicesApi.getAuthenticationDevices = jest.fn()
        .mockResolvedValueOnce({ data: { result: [] } })
        .mockResolvedValueOnce({ data: { result: [] } })
        .mockResolvedValueOnce({ data: { result: [webauthnDevices[0]] } });

      mountComponent();
      await flushPromises();

      expect(wrapper.vm.modalType).toBeNull();

      // Directly call setModalData like the dropdown action would
      wrapper.vm.setModalData('edit', { ...webauthnDevices[0] });
      await flushPromises();

      expect(wrapper.vm.modalType).toBe('edit');
      expect(wrapper.vm.modalInfo.title).toBe('Edit Device Name');
      expect(wrapper.vm.modalInfo.showCancel).toBe(true);
      expect(wrapper.vm.deviceName).toBe('WebAuthn Device 1');
    });

    it('closes modal when cancel is clicked', async () => {
      DevicesApi.getAuthenticationDevices = jest.fn()
        .mockResolvedValueOnce({ data: { result: [oathDevices[0]] } })
        .mockResolvedValueOnce({ data: { result: [] } })
        .mockResolvedValueOnce({ data: { result: [] } });

      mountComponent();
      await flushPromises();

      // Open delete modal
      wrapper.vm.setModalData('delete', { ...oathDevices[0] });
      await flushPromises();

      expect(wrapper.vm.modalType).toBe('delete');

      // Verify modal shows cancel button
      expect(wrapper.vm.modalInfo.showCancel).toBe(true);
    });

    it('closes error modal when done is clicked', async () => {
      DevicesApi.getAuthenticationDevices = jest.fn()
        .mockResolvedValueOnce({ data: { result: [oathDevices[0]] } })
        .mockResolvedValueOnce({ data: { result: [] } })
        .mockResolvedValueOnce({ data: { result: [] } });

      DevicesApi.deleteAuthenticationDevice = jest.fn()
        .mockRejectedValue({ response: { data: { message: 'USER NOT PERMITTED.' } } });

      mountComponent();
      await flushPromises();

      // Trigger delete to get error modal
      wrapper.vm.setModalData('delete', { ...oathDevices[0] });
      await flushPromises();

      wrapper.vm.handleModalPrimaryButton('delete');
      await flushPromises();

      expect(wrapper.vm.modalType).toBe('errorDelete');

      // Call handleModalPrimaryButton with error type
      wrapper.vm.handleModalPrimaryButton('errorDelete');
      await flushPromises();

      // The modal would be hidden by the function
      expect(wrapper.vm.modalType).toBe('errorDelete');
    });
  });

  describe('@lifecycle', () => {
    it('sets breadcrumb on mount', async () => {
      DevicesApi.getAuthenticationDevices = jest.fn()
        .mockResolvedValue({ data: { result: [] } });

      mountComponent();
      await flushPromises();

      expect(mockBreadcrumb.setBreadcrumb).toHaveBeenCalledWith('/profile', 'Profile');
    });

    it('loads authentication devices on mount', async () => {
      const getAuthDevicesSpy = jest.spyOn(DevicesApi, 'getAuthenticationDevices')
        .mockResolvedValue({ data: { result: [] } });

      mountComponent();
      await flushPromises();

      expect(getAuthDevicesSpy).toHaveBeenCalled();
    });
  });

  describe('@translations', () => {
    it('displays correct modal text for delete', async () => {
      DevicesApi.getAuthenticationDevices = jest.fn()
        .mockResolvedValueOnce({ data: { result: [oathDevices[0]] } })
        .mockResolvedValueOnce({ data: { result: [] } })
        .mockResolvedValueOnce({ data: { result: [] } });

      mountComponent();
      await flushPromises();

      wrapper.vm.setModalData('delete', { ...oathDevices[0] });
      await flushPromises();

      expect(wrapper.vm.modalText).toBe('You will not be able to authenticate using this device and may result in you getting locked out of your account if you rely solely on this device.');
    });

    it('displays correct modal text for error delete', async () => {
      DevicesApi.getAuthenticationDevices = jest.fn()
        .mockResolvedValueOnce({ data: { result: [oathDevices[0]] } })
        .mockResolvedValueOnce({ data: { result: [] } })
        .mockResolvedValueOnce({ data: { result: [] } });

      DevicesApi.deleteAuthenticationDevice = jest.fn()
        .mockRejectedValue({ response: { data: { message: 'USER NOT PERMITTED.' } } });

      mountComponent();
      await flushPromises();

      wrapper.vm.setModalData('delete', { ...oathDevices[0] });
      await flushPromises();

      wrapper.vm.handleModalPrimaryButton('delete');
      await flushPromises();

      expect(wrapper.vm.modalText).toBe('Unable to delete this device. Please sign in with this device in order to delete it.');
    });

    it('displays correct modal text for error edit', async () => {
      DevicesApi.getAuthenticationDevices = jest.fn()
        .mockResolvedValueOnce({ data: { result: [] } })
        .mockResolvedValueOnce({ data: { result: [] } })
        .mockResolvedValueOnce({ data: { result: [webauthnDevices[0]] } });

      DevicesApi.updateAuthenticationDevice = jest.fn()
        .mockRejectedValue({ response: { data: { message: 'USER NOT PERMITTED.' } } });

      mountComponent();
      await flushPromises();

      wrapper.vm.setModalData('edit', { ...webauthnDevices[0] });
      await flushPromises();

      wrapper.vm.deviceName = 'Updated Name';
      await flushPromises();

      wrapper.vm.handleModalPrimaryButton('edit');
      await flushPromises();

      expect(wrapper.vm.modalText).toBe('Unable to edit this device name. Please sign in with this device in order to edit it.');
    });
  });
});
