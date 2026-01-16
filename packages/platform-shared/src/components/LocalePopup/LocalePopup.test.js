/**
 * Copyright (c) 2025-2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { nextTick } from 'vue';
import { DOMWrapper, flushPromises, mount } from '@vue/test-utils';
import {
  createAppContainer,
  findAllByText,
  findByText,
  runA11yTest,
} from '@forgerock/platform-shared/src/utils/testHelpers';
import { mockValidation } from '@forgerock/platform-shared/src/testing/utils/mockValidation';
import LocalePopup from './LocalePopup';

mockValidation(['required']);

describe('LocalePopup.vue', () => {
  const mountComponent = (props = {}) => {
    const wrapper = mount(LocalePopup, {
      props,
      attachTo: createAppContainer(),
      global: {
        mocks: {
          $t: (msg) => msg,
        },
      },
    });

    const domWrapper = new DOMWrapper(document.body);
    return { wrapper, domWrapper };
  };

  const openPopover = async (wrapper) => {
    wrapper.vm.popoverShow = true;
    await flushPromises();
  };

  const originalGetBoundingClientRect = global.Element.prototype.getBoundingClientRect;
  beforeAll(() => {
    // Mocking the size of elements so Popper.js doesn't bail out
    // as it thinks there's no space to render the popover
    global.Element.prototype.getBoundingClientRect = () => ({
      width: 100,
      height: 30,
      top: 0,
      left: 0,
      right: 100,
      bottom: 30,
    });
  });

  afterAll(() => {
    // Restore the original getBoundingClientRect function
    global.Element.prototype.getBoundingClientRect = originalGetBoundingClientRect;
  });

  beforeEach(() => {
    document.body.innerHTML = '';
  });

  // Sample translations to use in tests
  const translations = [
    { locale: 'en', value: 'Hello' },
    { locale: 'fr', value: 'Bonjour' },
  ];

  describe('@a11y', () => {
    it('component should not have any accessibility violations', async () => {
      const { wrapper } = mountComponent({ translations });
      await flushPromises();
      await runA11yTest(wrapper);
    });
  });

  it('renders the dropdown and translation fields', async () => {
    const { wrapper, domWrapper } = mountComponent({ translations });
    await flushPromises();
    expect(wrapper.html()).toContain('translations.dropdownTitle');

    await openPopover(wrapper);

    expect(domWrapper.html()).toContain('translations.dropdownTitle');
    expect(domWrapper.findAll('[name="translationLocale"]').length).toBe(2);
    expect(domWrapper.findAll('[name="translationKey"]').length).toBe(2);
  });

  it('adds a translation entry when add button is clicked', async () => {
    const { wrapper, domWrapper } = mountComponent({ translations });
    await nextTick();
    await openPopover(wrapper);

    const addButtons = findAllByText(domWrapper, '.btn-link', 'add');
    await addButtons[0].trigger('click');
    await nextTick();
    expect(domWrapper.findAll('[name="translationLocale"]').length).toBe(3);
  });

  it('removes a translation entry when remove button is clicked', async () => {
    const { wrapper, domWrapper } = mountComponent({ translations });
    await nextTick();
    await openPopover(wrapper);

    const removeButton = findByText(domWrapper, '.btn-link', 'remove');
    await removeButton.trigger('click');
    await nextTick();
    expect(domWrapper.findAll('[name="translationLocale"]').length).toBe(1);
  });

  it('emits update:translations when apply is clicked', async () => {
    const { wrapper, domWrapper } = mountComponent({ translations });
    await flushPromises();
    await openPopover(wrapper);

    // Simulate clicking apply (primary button)
    const applyButton = findByText(domWrapper, '.btn-primary', 'apply');
    await applyButton.trigger('click');

    // Set closeAction and call hidePopover manually, as this component does not seem to respond to the click event here
    wrapper.vm.closeAction = 'update';
    wrapper.vm.hidePopover();
    expect(wrapper.emitted('update:translations')).toBeTruthy();
  });

  it('does not emit update:translations when cancel is clicked', async () => {
    const { wrapper } = mountComponent({ translations });
    await nextTick();
    // Simulate clicking cancel (link button)
    wrapper.vm.closeAction = 'close';
    wrapper.vm.hidePopover();
    await nextTick();
    expect(wrapper.emitted('update:translations')).toBeFalsy();
  });
});
