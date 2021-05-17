/**
 * Copyright (c) 2020-2021 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import BootstrapVue from 'bootstrap-vue';
import { createLocalVue, shallowMount } from '@vue/test-utils';
import i18n from '@/i18n';
import WelcomeWidget from '@/components/dashboard/widgets/WelcomeWidget';

const localVue = createLocalVue();
localVue.use(BootstrapVue);

describe('Dashboard.vue', () => {
  it('Welcome widget loaded', () => {
    const wrapper = shallowMount(WelcomeWidget, {
      localVue,
      i18n,
      propsData: {
        userDetails: {
          givenName: 'test',
          sn: 'test',
        },
      },
    });

    expect(wrapper.name()).toBe('WelcomeWidget');
  });

  it('renders default header if displayCompactHeader is set to false', () => {
    const wrapper = shallowMount(WelcomeWidget, {
      localVue,
      i18n,
      propsData: {
        displayCompactHeader: false,
      },
    });
    expect(wrapper.find('[data-testid="defaultHeader"]').isVisible()).toBe(true);
  });

  it('renders compact header if displayCompactHeader is set to true', () => {
    const wrapper = shallowMount(WelcomeWidget, {
      localVue,
      i18n,
      propsData: {
        userDetails: {
          givenName: 'Test',
        },
        displayCompactHeader: true,
      },
    });
    expect(wrapper.find('[data-testid="compactHeader"]').isVisible()).toBe(true);
  });

  it('greets user according to time of day and given name', () => {
    WelcomeWidget.mounted = jest.fn();
    const wrapper = shallowMount(WelcomeWidget, {
      localVue,
      i18n,
      propsData: {
        userDetails: {
          givenName: 'Test',
        },
        displayCompactHeader: true,
      },
      data() {
        return {
          timeOfDay: 'Morning',
        };
      },
    });
    expect(wrapper.find('h1').text()).toBe('Good Morning Test!');
  });

  it('sets greeting timeOfDay of compact header to: Morning, from hour 0 to 11', () => {
    const wrapper = shallowMount(WelcomeWidget, {
      localVue,
      i18n,
      propsData: {
        userDetails: {
          givenName: 'Test',
        },
        displayCompactHeader: true,
      },
      data() {
        return {
          timeOfDay: '',
        };
      },
    });
    const currentHour = 11;
    wrapper.vm.getTimeOfDay(currentHour);

    expect(wrapper.vm.timeOfDay).toBe('Morning');
  });

  it('sets greeting timeOfDay of compact header to: Afternoon, from hour 12 up until, and icnluding, hour 17', () => {
    const wrapper = shallowMount(WelcomeWidget, {
      localVue,
      i18n,
      propsData: {
        userDetails: {
          givenName: 'Test',
        },
        displayCompactHeader: true,
      },
      data() {
        return {
          timeOfDay: '',
        };
      },
    });
    const currentHour = 12;
    wrapper.vm.getTimeOfDay(currentHour);

    expect(wrapper.vm.timeOfDay).toBe('Afternoon');
  });

  it('sets greeting timeOfDay of compact header to: Evening, from hour 18 up until, and icnluding, hour 23', () => {
    const wrapper = shallowMount(WelcomeWidget, {
      localVue,
      i18n,
      propsData: {
        userDetails: {
          givenName: 'Test',
        },
        displayCompactHeader: true,
      },
      data() {
        return {
          timeOfDay: '',
        };
      },
    });
    const currentHour = 18;
    wrapper.vm.getTimeOfDay(currentHour);

    expect(wrapper.vm.timeOfDay).toBe('Evening');
  });
});
