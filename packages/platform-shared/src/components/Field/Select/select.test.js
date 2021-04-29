/**
 * Copyright (c) 2020-2021 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import BootstrapVue from 'bootstrap-vue';
import { createLocalVue, mount, shallowMount } from '@vue/test-utils';
import Select from './index';

const localVue = createLocalVue();
localVue.use(BootstrapVue);

const defaultMixinProps = {
  id: '',
  errorMessages: [],
  fieldName: '',
  helpText: '',
  hideLabel: false,
  isHtml: false,
  label: '',
};

const defaultProps = {
  selectOptions: [],
};

describe('Select input', () => {
  it('Select input component loaded', () => {
    const wrapper = shallowMount(Select, {
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
  });

  it('Select input component process selectOptions prop from array', () => {
    const wrapper = mount(Select, {
      localVue,
      mocks: {
        $t: () => {},
      },
      propsData: {
        ...defaultMixinProps,
        ...defaultProps,
        selectOptions: ['a', 'b', 'c'],
      },
    });

    const expected = [
      { text: 'a', value: 'a' },
      { text: 'b', value: 'b' },
      { text: 'c', value: 'c' },
    ];

    expect(wrapper.vm.options).toEqual(expected);
  });

  it('Select input component passes through selectOptions object prop', () => {
    const selectOptions = [
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
        selectOptions,
      },
    });

    expect(wrapper.vm.options).toEqual(selectOptions);
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
        selectOptions: ['a', 'b', 'c'],
      },
    });

    const select = wrapper.find('.multiselect');
    const elements = select.findAll('.multiselect__element');

    expect(select.exists()).toBe(true);
    expect(elements.length).toBe(3);
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
        selectOptions: ['a', 'b', 'c'],
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

  it('will update the displayed selected value if the text for that option changes', async () => {
    const wrapper = mount(Select, {
      localVue,
      mocks: {
        $t: () => {},
      },
      propsData: {
        ...defaultMixinProps,
        selectOptions: [
          { text: 'ayy', value: 'a' },
          { text: 'bee', value: 'b' },
          { text: 'cee', value: 'c' },
        ],
      },
    });

    await wrapper.setProps({ value: 'b' });

    // Check that the select shows the correct initial text
    expect(wrapper.find('.multiselect__single').text()).toBe('bee');

    await wrapper.setProps({
      selectOptions: [
        { text: 'ayy', value: 'a' },
        { text: 'beegees?', value: 'b' },
        { text: 'cee', value: 'c' },
      ],
    });

    expect(wrapper.find('.multiselect__single').text()).toBe('beegees?');
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
  // it('Select is autofocused on prop "autofocus"', () => {
  //   const wrapper = mount(Select, {
  //     localVue,
  //     mocks: {
  //       $t: () => {},
  //     },
  //     attachTo: document.body,
  //     propsData: {
  //       ...defaultMixinProps,
  //       ...defaultProps,
  //       autofocus: true,
  //     },
  //     slots: {
  //       prepend: '<span class="test_prepend">prepend</span>',
  //       append: '<span class="test_append">append</span>', // Will match <slot name="FooBar" />,
  //     },
  //   });
  //   expect(document.activeElement).toEqual(wrapper.findComponent({ ref: 'vms' }).querySelector('input'));
  //   document.activeElement.blur();
  // });
});
