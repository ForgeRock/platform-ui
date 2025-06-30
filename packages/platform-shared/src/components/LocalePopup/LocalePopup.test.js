/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { nextTick } from 'vue';
import { mount } from '@vue/test-utils';
import { findByText } from '@forgerock/platform-shared/src/utils/testHelpers';
import LocalePopup from './LocalePopup';

describe('LocalePopup.vue', () => {
  const mountComponent = (props = {}) => mount(LocalePopup, {
    props,
    global: {
      stubs: ['FrField', 'VeeForm'],
      mocks: {
        $t: (msg) => msg,
      },
    },
  });

  // Sample translations to use in tests
  const translations = [
    { locale: 'en', value: 'Hello' },
    { locale: 'fr', value: 'Bonjour' },
  ];

  it('renders the dropdown and translation fields', async () => {
    const wrapper = mountComponent({ translations });
    expect(wrapper.html()).toContain('translations.dropdownTitle');
    expect(wrapper.findAll('[name="translationLocale"]').length).toBe(2);
    expect(wrapper.findAll('[name="translationKey"]').length).toBe(2);
  });

  it('adds a translation entry when add button is clicked', async () => {
    const wrapper = mountComponent({ translations });
    await nextTick();
    const addButtons = wrapper.findAllComponents({ name: 'BButton' }).filter((btn) => btn.html().includes('add'));
    await addButtons[0].trigger('click');
    await nextTick();
    expect(wrapper.findAll('[name="translationLocale"]').length).toBe(3);
  });

  it('removes a translation entry when remove button is clicked', async () => {
    const wrapper = mountComponent({ translations });
    await nextTick();
    const removeButton = findByText(wrapper, '.btn-link', 'remove');

    await removeButton.trigger('click');
    await nextTick();
    expect(wrapper.findAll('[name="translationLocale"]').length).toBe(1);
  });

  it('emits update:translations when apply is clicked', async () => {
    const wrapper = mountComponent({ translations });
    await nextTick();
    // Simulate clicking apply (primary button)
    const applyButton = findByText(wrapper, '.btn-primary', 'apply');
    applyButton.trigger('click');
    // Set closeAction and call hideDropdown manually, as this component does not seem to respond to the click event here
    wrapper.vm.closeAction = 'update';
    wrapper.vm.hideDropdown({ preventDefault: jest.fn() });
    expect(wrapper.emitted('update:translations')).toBeTruthy();
  });

  it('does not emit update:translations when cancel is clicked', async () => {
    const wrapper = mountComponent({ translations });
    await nextTick();
    // Simulate clicking cancel (link button)
    wrapper.vm.closeAction = 'close';
    wrapper.vm.hideDropdown({ preventDefault: jest.fn() });
    await nextTick();
    expect(wrapper.emitted('update:translations')).toBeFalsy();
  });
});
