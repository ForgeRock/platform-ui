/**
 * Copyright (c) 2021-2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount } from '@vue/test-utils';
import { findAllByTestId, findByTestId, runA11yTest } from '@forgerock/platform-shared/src/utils/testHelpers';
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
  describe('emits add and edit events', () => {
    let wrapper;

    beforeEach(() => {
      wrapper = mount(SelectWithActions, {
        global: {
          mocks: {
            $t: () => {},
          },
        },
        props: {
          ...defaultProps,
        },
      });
    });

    afterEach(() => {
      wrapper.unmount();
    });

    it('emits add-item-clicked when the add button is clicked', () => {
      findByTestId(wrapper, 'beforeListAddButton').trigger('click');

      expect(wrapper.emitted()['add-item-clicked']).toBeTruthy();
      expect(wrapper.emitted()['add-item-clicked'].length).toBe(1);
    });

    it('emits edit-item-clicked when the edit button on dropdown option is clicked', () => {
      findAllByTestId(wrapper, 'editItemButton')[1].trigger('click');

      expect(wrapper.emitted()['edit-item-clicked']).toBeTruthy();
      expect(wrapper.emitted()['edit-item-clicked'].length).toBe(1);
      expect(wrapper.emitted()['edit-item-clicked'][0][0]).toEqual('ID_b');

      const selectInput = wrapper.findComponent({ name: 'SelectInput' });
      expect(selectInput.emitted().open).toBeFalsy();
    });

    it('emits edit-item-clicked when the edit button on dropdown option is clicked via mouseup', () => {
      const editButton = findAllByTestId(wrapper, 'editItemButton')[0];
      editButton.trigger('mouseup');
      editButton.trigger('click');

      expect(wrapper.emitted()['edit-item-clicked']).toBeTruthy();
      expect(wrapper.emitted()['edit-item-clicked'].length).toBe(1);
      expect(wrapper.emitted()['edit-item-clicked'][0][0]).toEqual('ID_a');

      const selectInput = wrapper.findComponent({ name: 'SelectInput' });
      expect(selectInput.emitted().open).toBeFalsy();
    });

    it('emits edit-item-clicked when the edit button on dropdown option is clicked via mousedown', () => {
      const editButton = findAllByTestId(wrapper, 'editItemButton')[1];
      editButton.trigger('mousedown');
      editButton.trigger('click');

      expect(wrapper.emitted()['edit-item-clicked']).toBeTruthy();
      expect(wrapper.emitted()['edit-item-clicked'].length).toBe(1);
      expect(wrapper.emitted()['edit-item-clicked'][0][0]).toEqual('ID_b');

      const selectInput = wrapper.findComponent({ name: 'SelectInput' });
      expect(selectInput.emitted().open).toBeFalsy();
    });

    it('emits add-item-clicked when the add button is clicked via mouseup', () => {
      const addButton = findByTestId(wrapper, 'beforeListAddButton');
      addButton.trigger('mouseup');
      addButton.trigger('click');

      expect(wrapper.emitted()['add-item-clicked']).toBeTruthy();
      expect(wrapper.emitted()['add-item-clicked'].length).toBe(1);
    });

    it('emits edit-item-clicked when the edit button on selected label is clicked', async () => {
      wrapper.setProps({ value: 'ID_a', showCollapsedEdit: true });
      await wrapper.vm.$nextTick();
      findByTestId(wrapper, 'labelEditItemButton').trigger('click');

      expect(wrapper.emitted()['edit-item-clicked']).toBeTruthy();
      expect(wrapper.emitted()['edit-item-clicked'].length).toBe(1);
      expect(wrapper.emitted()['edit-item-clicked'][0][0]).toEqual('ID_a');

      // Ensure dropdown does not open when edit button is clicked on the selected label
      const selectInput = wrapper.findComponent({ name: 'SelectInput' });
      expect(selectInput.emitted().open).toBeFalsy();
    });

    it('emits edit-item-clicked when the edit button on selected label is clicked via mouseup', async () => {
      wrapper.setProps({ value: 'ID_a', showCollapsedEdit: true });
      await wrapper.vm.$nextTick();
      const labelEditButton = findByTestId(wrapper, 'labelEditItemButton');
      labelEditButton.trigger('mouseup');
      labelEditButton.trigger('click');

      expect(wrapper.emitted()['edit-item-clicked']).toBeTruthy();
      expect(wrapper.emitted()['edit-item-clicked'].length).toBe(1);
      expect(wrapper.emitted()['edit-item-clicked'][0][0]).toEqual('ID_a');

      const selectInput = wrapper.findComponent({ name: 'SelectInput' });
      expect(selectInput.emitted().open).toBeFalsy();
    });

    it('emits edit-item-clicked when the edit button on selected label is clicked via mousedown', async () => {
      wrapper.setProps({ value: 'ID_a', showCollapsedEdit: true });
      await wrapper.vm.$nextTick();
      const labelEditButton = findByTestId(wrapper, 'labelEditItemButton');
      labelEditButton.trigger('mousedown');
      labelEditButton.trigger('click');

      expect(wrapper.emitted()['edit-item-clicked']).toBeTruthy();
      expect(wrapper.emitted()['edit-item-clicked'].length).toBe(1);
      expect(wrapper.emitted()['edit-item-clicked'][0][0]).toEqual('ID_a');

      const selectInput = wrapper.findComponent({ name: 'SelectInput' });
      expect(selectInput.emitted().open).toBeFalsy();
    });
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

  describe('@a11y', () => {
    function setup(props) {
      return mount(SelectWithActions, {
        global: {
          mocks: {
            $t: (t) => t,
          },
        },
        props: {
          ...defaultProps,
          label: 'Select an item',
          ...props,
        },
      });
    }

    it('is accessible in default state', async () => {
      const wrapper = setup();
      await runA11yTest(wrapper);
    });

    it('is accessible with a selected value and collapsed edit button visible', async () => {
      const wrapper = setup({
        value: 'ID_a',
        showCollapsedEdit: true,
      });
      await runA11yTest(wrapper);
    });

    it('is accessible when an option has badge text', async () => {
      const wrapper = setup({
        options: [
          { text: 'a', value: 'ID_a', badgeText: 'badge_a' },
          { text: 'b', value: 'ID_b' },
        ],
      });
      await runA11yTest(wrapper);
    });
  });
});
