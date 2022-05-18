/**
 * Copyright (c) 2020-2022 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import Vue from 'vue';
import BootstrapVue from 'bootstrap-vue';
import { createLocalVue, mount } from '@vue/test-utils';
import * as clipboard from 'clipboard-polyfill/text';
import MultiSelect from './index';

const localVue = createLocalVue();
localVue.use(BootstrapVue);

const defaultMixinProps = {
  multiselectId: '',
  errorMessages: [],
  name: '',
  description: '',
  isHtml: false,
  label: '',
};

const defaultProps = {
  options: [],
};

describe('MultiSelect input', () => {
  it('MultiSelect input component loaded', () => {
    const wrapper = mount(MultiSelect, {
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

  it('MultiSelect input sets default options', () => {
    const wrapper = mount(MultiSelect, {
      localVue,
      mocks: {
        $t: () => {},
      },
      propsData: {
        ...defaultMixinProps,
      },
    });

    expect(wrapper.vm.options).toStrictEqual([]);
  });

  it('MultiSelect input adds tags', () => {
    const wrapper = mount(MultiSelect, {
      localVue,
      mocks: {
        $t: () => {},
      },
      propsData: {
        ...defaultMixinProps,
        taggable: true,
      },
    });

    expect(wrapper.vm.tagOptions).toStrictEqual([]);
    expect(wrapper.vm.inputValue).toStrictEqual([]);
    wrapper.vm.searchValue = 'test';

    wrapper.vm.addTag();
    expect(wrapper.vm.tagOptions).toStrictEqual([
      {
        multiselectId: 0,
        text: 'test',
        value: 'test',
        copySelect: false,
      },
    ]);
    expect(wrapper.vm.inputValue).toStrictEqual([
      {
        multiselectId: 1,
        text: 'test',
        value: 'test',
        copySelect: false,
      },
    ]);

    expect(wrapper.emitted().input).toEqual([[['test']]]);
  });

  it('MultiSelect input sets copySelect on options when input closed', () => {
    const wrapper = mount(MultiSelect, {
      localVue,
      mocks: {
        $t: () => {},
      },
      propsData: {
        ...defaultMixinProps,
        taggable: true,
        options: [
          {
            text: 'test1',
            value: 'test1',
            copySelect: true,
          },
        ],
      },
    });

    expect(wrapper.vm.tagOptions).toStrictEqual([]);
    expect(wrapper.vm.options).toStrictEqual([{
      text: 'test1',
      value: 'test1',
      copySelect: true,
    }]);
    expect(wrapper.vm.inputValue).toStrictEqual([]);
    wrapper.vm.searchValue = 'test2';

    wrapper.vm.close();
    expect(wrapper.vm.selectOptions).toStrictEqual([
      {
        multiselectId: 5,
        text: 'test1',
        value: 'test1',
        copySelect: true,
      },
      {
        multiselectId: 1,
        text: 'test2',
        value: 'test2',
        copySelect: false,
      },
    ]);
    expect(wrapper.vm.inputValue).toStrictEqual([
      {
        multiselectId: 4,
        text: 'test2',
        value: 'test2',
        copySelect: false,
      },
    ]);

    expect(wrapper.emitted().input).toEqual([[['test2']]]);
  });

  it('MultiSelect input component process options prop from array', () => {
    const wrapper = mount(MultiSelect, {
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
      {
        copySelect: false, multiselectId: 0, text: 'a', value: 'a',
      },
      {
        copySelect: false, multiselectId: 1, text: 'b', value: 'b',
      },
      {
        copySelect: false, multiselectId: 2, text: 'c', value: 'c',
      },
    ];

    expect(wrapper.vm.selectOptions).toEqual(expected);
  });

  it('MultiSelect input component passes through options object prop and adds id and copy selected', () => {
    const options = [
      { text: 'd', value: 'd' },
      { text: 'e', value: 'e' },
      { text: 'f', value: 'f' },
    ];

    const expected = [
      {
        copySelect: false, multiselectId: 0, text: 'd', value: 'd',
      },
      {
        copySelect: false, multiselectId: 1, text: 'e', value: 'e',
      },
      {
        copySelect: false, multiselectId: 2, text: 'f', value: 'f',
      },
    ];

    const wrapper = mount(MultiSelect, {
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

    expect(wrapper.vm.selectOptions).toEqual(expected);
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
        options: ['a', 'b', 'c'],
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
        options: ['a', 'b', 'c'],
      },
    });

    const multiselect = wrapper.find('.multiselect');
    const elements = () => multiselect.findAll('.multiselect__option');

    multiselect.trigger('click');
    elements().at(1).trigger('click');
    expect(wrapper.vm.inputValue).toEqual([{
      copySelect: false,
      multiselectId: 1,
      text: 'b',
      value: 'b',
    }]);
    expect(wrapper.emitted().input).toEqual([[['b']]]);

    multiselect.trigger('click');
    elements().at(0).trigger('click');
    expect(wrapper.vm.inputValue).toEqual([{
      copySelect: false,
      multiselectId: 1,
      text: 'b',
      value: 'b',
    }, {
      copySelect: false,
      multiselectId: 0,
      text: 'a',
      value: 'a',
    }]);
    expect(wrapper.emitted().input).toEqual([[['b']], [['b', 'a']]]);
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

  it('MultiSelect copies options', () => {
    const wrapper = mount(MultiSelect, {
      localVue,
      mocks: {
        $t: () => {},
      },
      propsData: {
        ...defaultMixinProps,
        ...defaultProps,
      },
    });
    wrapper.vm.inputValue = [
      {
        copySelect: true,
        value: 'test',
      },
    ];
    const clipboardSpy = jest.spyOn(clipboard, 'writeText').mockImplementation(() => Promise.resolve());

    wrapper.vm.copyOptions();

    expect(clipboardSpy).toHaveBeenCalled();
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

  it('MultiSelect input sets inputValue properly', () => {
    const selectOption = {
      value: 'selectOption',
      copySelect: false,
      multiselectId: 0,
      text: 'selectOption',
    };
    const existingValue = { value: 'existingValue' };
    const wrapper = mount(MultiSelect, {
      localVue,
      mocks: {
        $t: () => {},
      },
      propsData: {
        ...defaultMixinProps,
        options: [selectOption],
      },
    });
    wrapper.vm.inputValue = [existingValue];
    wrapper.vm.setInputValue(['selectOption']);
    expect(wrapper.vm.inputValue).toEqual([selectOption]);
    wrapper.vm.inputValue = [existingValue];
    wrapper.vm.setInputValue(['existingValue', 'selectOption']);
    expect(wrapper.vm.inputValue.length).toEqual(2);
    expect(wrapper.vm.inputValue).toEqual([existingValue, selectOption]);
  });
});
