/**
 * Copyright (c) 2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { flushPromises, mount } from '@vue/test-utils';
import Violations from './Violations';
import i18n from '@/i18n';

describe('Violations', () => {
  function setup() {
    return mount(Violations, {
      global: {
        stubs: { ViolationsTab: true },
        plugins: [i18n],
      },
    });
  }

  it('should be able to view violations tab', async () => {
    const wrapper = setup();
    await flushPromises();

    expect(wrapper.findAll('.nav-link')[0].text()).toBe('Violations');
    expect(wrapper.findComponent({ name: 'ViolationsTab' }).exists()).toBe(true);
  });

  it('should have the correct headings', () => {
    const wrapper = setup();

    expect(wrapper.find('h1').text()).toBe('Compliance Violations');
    expect(wrapper.find('p').text()).toBe('View and take action on your compliance violations.');
  });
});
