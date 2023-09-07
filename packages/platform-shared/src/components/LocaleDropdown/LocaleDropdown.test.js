/**
 * Copyright (c) 2021-2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount, shallowMount } from '@vue/test-utils';
import LocaleDropdown from './index';

describe('LocaleDropdown', () => {
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
