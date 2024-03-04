/**
 * Copyright (c) 2022-2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount, flushPromises } from '@vue/test-utils';
import { nextTick } from 'vue';
import MultiSelect from './index';

const defaultMixinProps = {
  multiselectId: '',
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
  it('MultiSelect input component process selectOptions prop from array', () => {
    const wrapper = mount(MultiSelect, {
      global: {
        mocks: {
          $t: () => {},
        },
      },
      props: {
        ...defaultMixinProps,
        ...defaultProps,
        selectOptions: ['a', 'b', 'c'],
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

    expect(wrapper.vm.options).toEqual(expected);
  });

  it('MultiSelect input component passes through selectOptions object prop and adds id and copy selected', () => {
    const selectOptions = [
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
      global: {
        mocks: {
          $t: () => {},
        },
      },
      props: {
        ...defaultMixinProps,
        ...defaultProps,
        selectOptions,
      },
    });

    expect(wrapper.vm.options).toEqual(expected);
  });

  it('MultiSelect input component renders the options', () => {
    const wrapper = mount(MultiSelect, {
      global: {
        mocks: {
          $t: () => {},
        },
      },
      props: {
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
      global: {
        mocks: {
          $t: () => {},
        },
      },
      props: {
        ...defaultMixinProps,
        ...defaultProps,
        selectOptions: ['a', 'b', 'c'],
      },
    });

    const multiselect = wrapper.find('.multiselect');
    const elements = () => multiselect.findAll('.multiselect__option');

    multiselect.trigger('click');
    elements()[1].trigger('click');
    await flushPromises();
    expect(wrapper.vm.inputValue).toEqual([{
      copySelect: false,
      multiselectId: 1,
      text: 'b',
      value: 'b',
    }]);
    expect(wrapper.emitted().input[0]).toEqual([['b']]);

    multiselect.trigger('click');
    elements()[0].trigger('click');
    await flushPromises();
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
    expect(wrapper.emitted().input[1]).toEqual([['b', 'a']]);
  });

  it('MultiSelect passes through component slots', () => {
    const wrapper = mount(MultiSelect, {
      global: {
        mocks: {
          $t: () => {},
        },
      },
      props: {
        ...defaultMixinProps,
        ...defaultProps,
      },
      slots: {
        prepend: '<span class="test_prepend">prepend</span>',
        append: '<span class="test_append">append</span>', // Will match <slot name="FooBar" />,
      },
    });

    expect(wrapper.find('.test_prepend').exists()).toBe(true);
    expect(wrapper.find('.test_append').exists()).toBe(true);
  });

  it('Multiselect is not autofocused on absence of prop "autofocus"', async () => {
    const wrapper = mount(MultiSelect, {
      global: {
        mocks: {
          $t: () => {},
        },
        attachTo: document.body,
      },
      props: {
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
      await nextTick();
      expect(document.activeElement).toEqual(document.body);
    } finally {
      wrapper.unmount();
    }
  });

  // it('Multiselect is autofocused on prop "autofocus"', async () => {
  //   const wrapper = mount(MultiSelect, {
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

  //   try {
  //     await Vue.nextTick();
  //     expect(document.activeElement).toEqual(wrapper.element.querySelector('input'));
  //   } finally {
  //     wrapper.destroy();
  //   }
  // });
});
