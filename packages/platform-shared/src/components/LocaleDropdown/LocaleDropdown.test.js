/**
 * Copyright (c) 2021-2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { flushPromises, mount, shallowMount } from '@vue/test-utils';
import { runA11yTest } from '@forgerock/platform-shared/src/utils/testHelpers';
import LocaleDropdown from './index';

describe('LocaleDropdown', () => {
  describe('@a11y', () => {
    let wrapper;
    function mountComponent(propsData = {}) {
      return mount(LocaleDropdown, {
        global: {
          mocks: {
            $t: (msg) => msg,
          },
        },
        props: { ...propsData },
      });
    }

    afterEach(() => {
      if (wrapper?.unmount) {
        wrapper.unmount();
      }
    });

    const a11yScenarios = [
      { name: 'there are no dropdown items', props: { dropdownItems: [], title: 'Locale Dropdown' } },
      {
        name: 'dropdown items are present and add button is enabled',
        props: {
          showAdd: true,
          dropdownItems: [{
            locale: 'one',
            active: true,
          }, {
            locale: 'two',
            active: false,
          }],
          title: 'Locale Dropdown',
        },
      },
    ];
    it.each(a11yScenarios)('no a11y violations when $name', async ({ props }) => {
      wrapper = mountComponent(props);
      await flushPromises();
      await runA11yTest(wrapper);
    });
  });
  it('Does not show "Add Button" when prop not set', () => {
    const wrapper = shallowMount(LocaleDropdown, {
      global: {
        mocks: {
          $t: () => {},
        },
      },
      props: {
        dropdownItems: [{
          locale: 'one',
          active: true,
        }, {
          locale: 'two',
          active: false,
        }],
        title: 'Locale Dropdown',
      },
    });
    expect(wrapper.find('[data-testid="add-locale-button"]').exists()).toBe(false);
  });

  it('Shows "Add Button" when prop set to true', () => {
    const wrapper = shallowMount(LocaleDropdown, {
      global: {
        mocks: {
          $t: () => {},
        },
        renderStubDefaultSlot: true,
      },
      props: {
        showAdd: true,
        dropdownItems: [{
          locale: 'one',
          active: true,
        }, {
          locale: 'two',
          active: false,
        }],
        title: 'Locale Dropdown',
      },
    });
    expect(wrapper.find('[data-testid="add-locale-button"]').exists()).toBe(true);
  });

  it('Shows the correct number of dropdown items', () => {
    const dropdownItems = [{
      locale: 'one',
      active: true,
    }, {
      locale: 'two',
      active: false,
    }];
    const wrapper = mount(LocaleDropdown, {
      global: {
        mocks: {
          $t: () => {},
        },
      },
      props: {
        showAdd: true,
        dropdownItems,
        title: 'Locale Dropdown',
      },
    });
    expect(wrapper.findAll('.dropdown-locale-item').length).toBe(dropdownItems.length);
  });

  it('Shows the correct active value', () => {
    const dropdownItems = [{
      locale: 'one',
      active: false,
    }, {
      locale: 'two',
      active: true,
    }];
    const wrapper = mount(LocaleDropdown, {
      global: {
        mocks: {
          $t: () => {},
        },
      },
      props: {
        showAdd: true,
        dropdownItems,
        title: 'Locale Dropdown',
      },
    });
    expect(wrapper.find('.dropdown-toggle span').text()).toBe(dropdownItems[1].locale);
  });
});
