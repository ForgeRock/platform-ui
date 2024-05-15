/**
 * Copyright (c) 2021-2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount } from '@vue/test-utils';
import SelectWithActions from './index';

const defaultProps = {
  addRowText: 'addRow?',
  addLabel: 'addButton?',
  editLabel: 'editButton?',
  id: '',
  errorMessages: [],
  name: '',
  description: '',
  isHtml: false,
  label: '',
  options: [
    { text: 'a', value: 'ID_a' },
    { text: 'b', value: 'ID_b' },
  ],
};

describe('SelectWithActions input', () => {
  it('emits add and edit events', () => {
    const wrapper = mount(SelectWithActions, {
      global: {
        mocks: {
          $t: () => {},
        },
      },
      props: {
        ...defaultProps,
      },
    });

    wrapper.find('button[aria-label="addButton?"').trigger('click');

    expect(wrapper.emitted()['add-item-clicked']).toBeTruthy();
    expect(wrapper.emitted()['add-item-clicked'].length).toBe(1);

    wrapper.findAll('button[aria-label="editButton?"')[1].trigger('click');

    expect(wrapper.emitted()['edit-item-clicked']).toBeTruthy();
    expect(wrapper.emitted()['edit-item-clicked'].length).toBe(1);
    expect(wrapper.emitted()['edit-item-clicked'][0][0]).toEqual('ID_b');
  });

  it('sets default props', () => {
    const wrapper = mount(SelectWithActions, {
      global: {
        mocks: {
          $t: (string) => {
            const translations = {
              'common.add': 'add',
              'common.edit': 'edit',
            };
            return translations[string];
          },
        },
      },
      props: {
        id: '',
        errorMessages: [],
        name: '',
        description: '',
        isHtml: false,
        label: '',
        options: [],
      },
    });

    expect(wrapper.vm.addRowTextOrFallback).toBe('add');
    expect(wrapper.vm.addLabelOrFallback).toBe('add');
    expect(wrapper.vm.editLabelOrFallback).toBe('edit');
  });

  it('renders badges for options provided with badge text', () => {
    const wrapper = mount(SelectWithActions, {
      global: {
        mocks: {
          $t: () => {},
        },
      },
      props: {
        ...defaultProps,
        options: [
          { text: 'a', value: 'ID_a', badgeText: 'badge_a' },
          { text: 'b', value: 'ID_b' },
        ],
        value: ['ID_a'],
      },
    });

    // Check the correct badge and number of badges are rendered
    const badges = wrapper.findAll('.badge');
    expect(badges.length).toBe(1);
    expect(badges[0].text()).toBe('badge_a');

    // Check the badge is rendered for the correct option
    const options = wrapper.findAll('li[role="option"]');
    expect(options.length).toBe(2);
    expect(options[0].text()).toBe('a badge_aedit');
    expect(options[1].text()).toBe('b edit');
  });
});
