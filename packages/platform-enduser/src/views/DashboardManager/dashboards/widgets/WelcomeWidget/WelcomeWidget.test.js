/**
 * Copyright (c) 2020-2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { flushPromises, mount } from '@vue/test-utils';
import { setupTestPinia } from '@forgerock/platform-shared/src/utils/testPiniaHelpers';
import i18n from '@/i18n';
import WelcomeWidget from './index';

describe('WelcomeWidget.vue', () => {
  setupTestPinia({
    user: {
      givenName: 'Test',
      name: 'bob loblaw',
    },
    enduser: {
      profileImage: 'my-avatar.jpg',
    },
  });
  function mountComponent(propsData, overrideData = {}) {
    const wrapper = mount(WelcomeWidget, {
      global: {
        plugins: [i18n],
        mocks: {
          $store: {
            state: {
              isFraas: false,
            },
          },
          $router: { push: jest.fn() },
        },
      },
      props: {
        displayCompactHeader: false,
        ...propsData,
      },
    });
    wrapper.setData(overrideData);
    return wrapper;
  }
  it('renders default header if displayCompactHeader is set to false', () => {
    const wrapper = mountComponent();
    expect(wrapper.find('[data-testid="defaultHeader"]').isVisible()).toBe(true);
  });

  it('renders compact header if displayCompactHeader is set to true', () => {
    const wrapper = mountComponent({
      userDetails: {
        givenName: 'Test',
      },
      displayCompactHeader: true,
    });
    expect(wrapper.find('[data-testid="compactHeader"]').isVisible()).toBe(true);
  });

  it('greets user according to time of day and given name', async () => {
    WelcomeWidget.mounted = jest.fn();
    const wrapper = mountComponent(
      {
        userDetails: {
          givenName: 'Test',
        },
        displayCompactHeader: true,
      },
      {
        timeOfDay: 'Morning',
      },
    );
    await flushPromises();

    expect(wrapper.find('h1').text()).toBe('Good Morning Test!');
  });

  it('sets greeting timeOfDay of compact header to: Morning, from hour 0 to 11', () => {
    const wrapper = mountComponent({
      userDetails: {
        givenName: 'Test',
      },
      displayCompactHeader: true,
    }, {
      timeOfDay: '',
    });
    const currentHour = 11;
    wrapper.vm.getTimeOfDay(currentHour);

    expect(wrapper.vm.timeOfDay).toBe('Morning');
  });

  it('sets greeting timeOfDay of compact header to: Afternoon, from hour 12 up until, and including, hour 17', () => {
    const wrapper = mountComponent({
      userDetails: {
        givenName: 'Test',
      },
      displayCompactHeader: true,
    }, {
      timeOfDay: '',
    });
    const currentHour = 12;
    wrapper.vm.getTimeOfDay(currentHour);

    expect(wrapper.vm.timeOfDay).toBe('Afternoon');
  });

  it('sets greeting timeOfDay of compact header to: Evening, from hour 18 up until, and including, hour 23', () => {
    const wrapper = mountComponent({
      userDetails: {
        givenName: 'Test',
      },
      displayCompactHeader: true,
    }, {
      timeOfDay: '',
    });
    const currentHour = 18;
    wrapper.vm.getTimeOfDay(currentHour);

    expect(wrapper.vm.timeOfDay).toBe('Evening');
  });

  it('returns an avatar source in the avatarSource computed property', () => {
    const wrapper = mountComponent();

    expect(wrapper.vm.avatarSource).toBe('my-avatar.jpg');
  });

  it('updates route to Profile after clicking on the edit profile button', () => {
    const wrapper = mountComponent();
    const routerPushSpy = jest.spyOn(wrapper.vm.$router, 'push');

    wrapper.vm.openProfile();
    expect(routerPushSpy).toHaveBeenCalledWith({ name: 'Profile' });
  });
});
