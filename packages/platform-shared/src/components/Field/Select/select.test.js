/**
 * Copyright (c) 2020-2022 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import Vue from 'vue';
import BootstrapVue from 'bootstrap-vue';
import { createLocalVue, mount } from '@vue/test-utils';
import Select from './index';

const localVue = createLocalVue();
localVue.use(BootstrapVue);

const defaultMixinProps = {
  id: '',
  errorMessages: [],
  name: '',
  description: '',
  isHtml: false,
  label: '',
};

const defaultProps = {
  options: [],
};

describe('Select input', () => {
  it('Select input component loaded', () => {
    const wrapper = mount(Select, {
      localVue,
      mocks: {
        $t: () => {},
      },
      propsData: {
        ...defaultMixinProps,
        ...defaultProps,
      },
    });

    expect(wrapper.name()).toBe('Select');
    expect(wrapper.vm.floatLabels).toBe(false);
  });

  it('Select input component process options prop from array', () => {
    const wrapper = mount(Select, {
      localVue,
      mocks: {
        $t: () => {},
      },
      propsData: {
        ...defaultMixinProps,
        ...defaultProps,
        options: ['a', 'b', 'c'],
      },
    });

    const expected = [
      { text: 'a', value: 'a' },
      { text: 'b', value: 'b' },
      { text: 'c', value: 'c' },
    ];

    expect(wrapper.vm.selectOptions).toEqual(expected);
  });

  it('Select input component passes through options object prop', () => {
    const options = [
      { text: 'd', value: 'd' },
      { text: 'e', value: 'e' },
      { text: 'f', value: 'f' },
    ];

    const wrapper = mount(Select, {
      localVue,
      mocks: {
        $t: () => {},
      },
      propsData: {
        ...defaultMixinProps,
        ...defaultProps,
        options,
      },
    });

    expect(wrapper.vm.selectOptions).toEqual(options);
  });

  it('Select input component renders the options', () => {
    const wrapper = mount(Select, {
      localVue,
      mocks: {
        $t: () => {},
      },
      propsData: {
        ...defaultMixinProps,
        ...defaultProps,
        options: ['a', 'b', 'c'],
      },
    });

    const select = wrapper.find('.multiselect');
    const elements = select.findAll('.multiselect__element');

    expect(select.exists()).toBe(true);
    expect(elements.length).toBe(3);
  });

  it('Select input component Closes Dropdown', () => {
    const wrapper = mount(Select, {
      localVue,
      mocks: {
        $t: () => {},
      },
      propsData: {
        ...defaultMixinProps,
        ...defaultProps,
        options: ['a', 'b', 'c'],
        label: 'testLabel',
      },
    });

    wrapper.vm.floatLabels = true;
    expect(wrapper.vm.floatLabels).toBe(true);
    wrapper.vm.closeDropDown();
    expect(wrapper.vm.floatLabels).toBe(false);
    wrapper.vm.closeDropDown('test');
    expect(wrapper.vm.floatLabels).toBe(true);
  });

  it('Select input component Closes Dropdown without floating label', async () => {
    const closeDropDown = jest.fn();
    const wrapper = mount(Select, {
      localVue,
      mocks: {
        $t: () => {},
      },
      propsData: {
        ...defaultMixinProps,
        ...defaultProps,
        options: ['a', 'b', 'c'],
        label: 'testLabel',
        floatingLabel: false,
      },
      methods: {
        closeDropDown,
      },
    });

    expect(wrapper.vm.floatLabels).toBe(false);
    await wrapper.vm.$refs.vms.$emit('close');
    expect(closeDropDown).not.toHaveBeenCalled();
    expect(wrapper.vm.floatLabels).toBe(false);
  });

  it('Select input component allows single selections', () => {
    const wrapper = mount(Select, {
      localVue,
      mocks: {
        $t: () => {},
      },
      propsData: {
        ...defaultMixinProps,
        ...defaultProps,
        options: ['a', 'b', 'c'],
      },
    });

    const select = wrapper.find('.multiselect');
    const elements = () => select.findAll('.multiselect__option');

    select.trigger('click');
    elements().at(1).trigger('click');
    expect(wrapper.vm.inputValue).toEqual({ text: 'b', value: 'b' });

    select.trigger('click');
    elements().at(0).trigger('click');
    expect(wrapper.vm.inputValue).toEqual({ text: 'a', value: 'a' });
  });

  it('Select passes through component slots', () => {
    const wrapper = mount(Select, {
      localVue,
      mocks: {
        $t: () => {},
      },
      propsData: {
        ...defaultMixinProps,
        ...defaultProps,
      },
      slots: {
        prepend: '<span class="test_prepend">prepend</span>',
        append: '<span class="test_append">append</span>', // Will match <slot name="FooBar" />,
      },
    });

    expect(wrapper.contains('.test_prepend')).toBe(true);
    expect(wrapper.contains('.test_append')).toBe(true);
  });

  it('will update the displayed selected value if the text for that option changes', () => {
    const wrapper = mount(Select, {
      localVue,
      mocks: {
        $t: () => {},
      },
      propsData: {
        ...defaultMixinProps,
        options: [
          { text: 'ayy', value: 'a' },
          { text: 'bee', value: 'b' },
          { text: 'cee', value: 'c' },
        ],
      },
    });

    wrapper.setProps({ value: 'b' });

    // Check that the select shows the correct initial text
    expect(wrapper.find('.multiselect__single').text()).toBe('bee');

    wrapper.setProps({
      options: [
        { text: 'ayy', value: 'a' },
        { text: 'beegees?', value: 'b' },
        { text: 'cee', value: 'c' },
      ],
    });

    expect(wrapper.find('.multiselect__single').text()).toBe('beegees?');
  });

  it('Select removes float for blank values', () => {
    const wrapper = mount(Select, {
      localVue,
      mocks: {
        $t: () => {},
      },
      propsData: {
        ...defaultMixinProps,
        options: [
          { text: 'ayy', value: 'a' },
          { text: 'bee', value: 'b' },
        ],
      },
    });

    wrapper.vm.floatLabels = true;

    wrapper.setProps({ value: 'sdf' });
    expect(wrapper.vm.floatLabels).toBe(true);
    wrapper.setProps({ value: '', options: [] });
    expect(wrapper.vm.floatLabels).toBe(false);
  });

  it('Select removes float for blank values without floating label', () => {
    const wrapper = mount(Select, {
      localVue,
      mocks: {
        $t: () => {},
      },
      propsData: {
        ...defaultMixinProps,
        options: [
          { text: 'ayy', value: 'a' },
          { text: 'bee', value: 'b' },
        ],
        floatingLabel: false,
      },
    });

    wrapper.setProps({ value: 'sdf' });
    expect(wrapper.vm.floatLabels).toBe(false);
    wrapper.setProps({ value: '', options: [] });
    expect(wrapper.vm.floatLabels).toBe(false);
  });

  it('Select is not autofocused on absence of prop "autofocus"', () => {
    const wrapper = mount(Select, {
      localVue,
      mocks: {
        $t: () => {},
      },
      propsData: {
        ...defaultMixinProps,
        ...defaultProps,
        autofocus: false,
      },
      slots: {
        prepend: '<span class="test_prepend">prepend</span>',
        append: '<span class="test_append">append</span>', // Will match <slot name="FooBar" />,
      },
    });
    expect(document.activeElement).toEqual(document.body);
    document.activeElement.blur();
    wrapper.destroy();
  });

  // TODO: to make this test work, follow guide to upgrade vue-test-utils https://vue-test-utils.vuejs.org/upgrading-to-v1/
  it('Select is autofocused on prop "autofocus"', async () => {
    const wrapper = mount(Select, {
      localVue,
      mocks: {
        $t: () => {},
      },
      attachToDocument: true,
      propsData: {
        ...defaultMixinProps,
        ...defaultProps,
        autofocus: true,
        searchable: true,
      },
      slots: {
        prepend: '<span class="test_prepend">prepend</span>',
        append: '<span class="test_append">append</span>', // Will match <slot name="FooBar" />,
      },
    });
    try {
      await Vue.nextTick();
      expect(document.activeElement).toEqual(wrapper.element.querySelector('input'));
    } finally {
      wrapper.destroy();
    }
  });
});
