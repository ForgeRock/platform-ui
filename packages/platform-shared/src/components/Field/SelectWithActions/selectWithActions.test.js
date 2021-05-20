/**
 * Copyright (c) 2021 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import BootstrapVue from 'bootstrap-vue';
import { createLocalVue, shallowMount, mount } from '@vue/test-utils';
import SelectWithActions from './index';

const localVue = createLocalVue();
localVue.use(BootstrapVue);

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
  it('loads the component', () => {
    const wrapper = shallowMount(SelectWithActions, {
      mocks: {
        $t: () => {},
      },
      propsData: {
        ...defaultProps,
      },
    });
    expect(wrapper.name()).toBe('SelectWithActions');
  });

  it('emits add and edit events', () => {
    const wrapper = mount(SelectWithActions, {
      localVue,
      mocks: {
        $t: () => {},
      },
      propsData: {
        ...defaultProps,
      },
    });

    wrapper.find('button[aria-label="addButton?"').trigger('click');

    expect(wrapper.emitted()['add-item-clicked']).toBeTruthy();
    expect(wrapper.emitted()['add-item-clicked'].length).toBe(1);

    wrapper.findAll('button[aria-label="editButton?"').at(1).trigger('click');

    expect(wrapper.emitted()['edit-item-clicked']).toBeTruthy();
    expect(wrapper.emitted()['edit-item-clicked'].length).toBe(1);
    expect(wrapper.emitted()['edit-item-clicked'][0][0]).toEqual('ID_b');
  });

  it('sets default props', () => {
    const wrapper = mount(SelectWithActions, {
      localVue,
      mocks: {
        $t: (string) => {
          const translations = {
            'common.add': 'add',
            'common.edit': 'edit',
          };
          return translations[string];
        },
      },
      propsData: {
        id: '',
        errorMessages: [],
        name: '',
        description: '',
        isHtml: false,
        label: '',
        options: [],
      },
    });

    expect(wrapper.vm.addRowText).toBe('add');
    expect(wrapper.vm.addLabel).toBe('add');
    expect(wrapper.vm.editLabel).toBe('edit');
  });
});
