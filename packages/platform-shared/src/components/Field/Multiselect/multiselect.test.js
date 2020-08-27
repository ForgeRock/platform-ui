/**
 * Copyright 2020 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS.
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */
import Vue from 'vue';
import BootstrapVue from 'bootstrap-vue';
import { createLocalVue, mount, shallowMount } from '@vue/test-utils';
import MultiSelect from './index';

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

describe('MultiSelect input', () => {
  it('MultiSelect input component loaded', () => {
    const wrapper = shallowMount(MultiSelect, {
      localVue,
      mocks: {
        $t: () => {},
      },
      propsData: {
        ...defaultMixinProps,
        ...defaultProps,
      },
    });

    expect(wrapper.name()).toBe('MultiSelect');
  });

  it('MultiSelect input component process selectOptions prop from array', () => {
    const wrapper = mount(MultiSelect, {
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

  it('MultiSelect input component passes through selectOptions object prop', () => {
    const selectOptions = [
      { text: 'd', value: 'd' },
      { text: 'e', value: 'e' },
      { text: 'f', value: 'f' },
    ];

    const wrapper = mount(MultiSelect, {
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

  it('MultiSelect input component renders the options', () => {
    const wrapper = mount(MultiSelect, {
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

    const multiselect = wrapper.find('.multiselect');
    const elements = multiselect.findAll('.multiselect__element');

    expect(multiselect.exists()).toBe(true);
    expect(elements.length).toBe(3);
  });

  it('MultiSelect input component allows multiple selections', async () => {
    const wrapper = mount(MultiSelect, {
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

    const multiselect = wrapper.find('.multiselect');
    const elements = () => multiselect.findAll('.multiselect__option');

    multiselect.trigger('click');
    elements().at(1).trigger('click');
    expect(wrapper.vm.inputValue).toEqual([{ text: 'b', value: 'b' }]);
    expect(wrapper.emitted().input[1]).toEqual([['b']]);

    multiselect.trigger('click');
    elements().at(0).trigger('click');
    expect(wrapper.vm.inputValue).toEqual([{ text: 'b', value: 'b' }, { text: 'a', value: 'a' }]);
    expect(wrapper.emitted().input[2]).toEqual([['b', 'a']]);
  });

  it('MultiSelect passes through component slots', () => {
    const wrapper = mount(MultiSelect, {
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

  it('Multiselect is not autofocused on absence of prop "autofocus"', async () => {
    const wrapper = mount(MultiSelect, {
      localVue,
      mocks: {
        $t: () => {},
      },
      attachToDocument: true,
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

    try {
      await Vue.nextTick();
      expect(document.activeElement).toEqual(document.body);
    } finally {
      wrapper.destroy();
    }
  });

  it('Multiselect is autofocused on prop "autofocus"', async () => {
    const wrapper = mount(MultiSelect, {
      localVue,
      mocks: {
        $t: () => {},
      },
      attachToDocument: true,
      propsData: {
        ...defaultMixinProps,
        ...defaultProps,
        autofocus: true,
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
