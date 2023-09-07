/**
 * Copyright (c) 2022-2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount, DOMWrapper } from '@vue/test-utils';
import { findByTestId } from '@forgerock/platform-shared/src/utils/testHelpers';
import i18n from '@/i18n';
import FrSystemNotification from '@/components/SystemNotification';

describe('SystemNotification', () => {
  const defaultProps = {
    data: {
      content: 'Scheduled Tenant Migration',
      variant: 'warning',
    },
    active: true,
    isTesting: true,
  };

  const propsWithModal = {
    data: {
      content: 'Scheduled Tenant Migration',
      variant: 'warning',
      modal: {
        title: 'Scheduled Tenant Migration',
        content: 'About this migration',
      },
    },
    active: true,
    isTesting: true,
  };

  function setup(props = defaultProps) {
    return mount(FrSystemNotification, {
      attachTo: document.body,
      global: {
        plugins: [i18n],
        mocks: {
          $bvModal: {
            show: () => {},
          },
        },
      },
      props,
    });
  }

  describe('@renders', () => {
    it('should render the SystemNotification', () => {
      const wrapper = setup();
      const systemNotification = wrapper.findComponent(FrSystemNotification);
      expect(systemNotification.exists()).toBeTruthy();
    });

    it('should render alert with content and replace placeholder with date', () => {
      const wrapper = setup();
      const alert = findByTestId(wrapper, 'system-notification');
      const alertContent = alert.text();
      expect(alert.exists()).toBeTruthy();
      expect(alertContent).toContain('Scheduled Tenant Migration');
      // Expect the date placeholder to have been replaced. We cannot check test
      // for the date here as it gets formatted with the timezone and is therefore
      // different from machine to machine.
      expect(alertContent).not.toContain('{{placeholder_management_migration_date}}');
    });

    it('should render view details button if modal exists', () => {
      let wrapper = setup();
      let viewDetails = findByTestId(wrapper, 'notification-view-details');
      expect(viewDetails.exists()).toBeFalsy();

      wrapper = setup(propsWithModal);
      viewDetails = findByTestId(wrapper, 'notification-view-details');
      expect(viewDetails.exists()).toBeTruthy();
    });

    it('should render close button', () => {
      const wrapper = setup();
      const close = findByTestId(wrapper, 'notification-close');
      expect(close.exists()).toBeTruthy();
    });
  });

  describe('@actions', () => {
    it('should hide system notification when close is clicked', async () => {
      const wrapper = setup();
      const close = findByTestId(wrapper, 'notification-close');

      expect(wrapper.emitted()['hide-system-notification']).toBeFalsy();
      close.trigger('click');
      await wrapper.vm.$nextTick();
      expect(wrapper.emitted()['hide-system-notification']).toBeTruthy();
    });

    it('should display modal when view details is clicked', async () => {
      const wrapper = setup(propsWithModal);
      const viewDetails = findByTestId(wrapper, 'notification-view-details');

      const modalSpy = jest.spyOn(wrapper.vm.$bvModal, 'show');
      expect(modalSpy).not.toHaveBeenCalled();
      viewDetails.trigger('click');
      await wrapper.vm.$nextTick();
      expect(modalSpy).toHaveBeenCalledWith('SystemNotificationModal');

      const bodyWrap = new DOMWrapper(document.body);
      const modalTitle = findByTestId(bodyWrap, 'system-notification-modal-title');
      const modalContent = findByTestId(bodyWrap, 'system-notification-modal-content');

      expect(modalTitle.text()).toBe('Scheduled Tenant Migration');
      expect(modalContent.text()).toBe('About this migration');
    });
  });
});
