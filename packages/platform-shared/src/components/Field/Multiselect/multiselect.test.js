/**
 * Copyright (c) 2020-2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount, flushPromises } from '@vue/test-utils';
import i18n from '@/i18n';
import MultiSelect from './index';
import { findByTestId } from '../../../utils/testHelpers';

describe('Multiselect', () => {
  const defaultProps = {
    name: 'stub-name',
    testid: 'stub-testid',
  };

  function setup(props) {
    return mount(MultiSelect, {
      global: {
        plugins: [i18n],
      },
      props: {
        ...defaultProps,
        ...props,
      },
    });
  }

  describe('@renders', () => {
    it('default', () => {
      const wrapper = setup();

      const multiselectInput = findByTestId(wrapper, 'multi-select-input-stub-testid');
      expect(multiselectInput.attributes('aria-expanded')).toBe('false');
      expect(multiselectInput.attributes('aria-labelledby')).toBe('floatingLabelInput1-label');
    });
  });

  describe('@actions', () => {
    it('when open, should have aria-expanded attribute', async () => {
      const wrapper = setup();
      const multiselect = findByTestId(wrapper, 'stub-testid');
      const multiselectInput = findByTestId(wrapper, 'multi-select-input-stub-testid');

      await multiselect.trigger('click');
      expect(multiselectInput.attributes('aria-expanded')).toBe('true');
    });
  });

  it('MultiSelect input adds tags', () => {
    const wrapper = setup({ taggable: true });

    expect(wrapper.vm.inputValue).toStrictEqual([]);
    wrapper.vm.searchChange('test');

    wrapper.vm.addTag();
    expect(wrapper.vm.inputValue).toStrictEqual([
      {
        multiselectId: 1,
        text: 'test',
        value: 'test',
      },
    ]);

    expect(wrapper.emitted().input).toEqual([[['test']]]);
  });

  it.each([
    { val: ',', desc: 'a single comma' },
    { val: ',,,,,,', desc: 'multiple commas' },
    { val: '   ', desc: 'only spaces' },
  ])('MultiSelect input does not add tags when input is $desc', ({ val }) => {
    const wrapper = setup({ taggable: true });
    expect(wrapper.vm.tagOptions).toStrictEqual([]);
    expect(wrapper.vm.inputValue).toStrictEqual([]);
    wrapper.vm.searchValue = val;
    wrapper.vm.addTag();
    expect(wrapper.vm.tagOptions).toStrictEqual([]);
    expect(wrapper.vm.inputValue).toStrictEqual([]);
  });

  it('MultiSelect input component process options prop from array', () => {
    const wrapper = setup({
      options: ['a', 'b', 'c'],
    });

    const expected = [
      {
        multiselectId: 0, text: 'a', value: 'a',
      },
      {
        multiselectId: 1, text: 'b', value: 'b',
      },
      {
        multiselectId: 2, text: 'c', value: 'c',
      },
    ];

    expect(wrapper.vm.selectOptions).toEqual(expected);
  });

  it('MultiSelect input component passes through options object prop and adds id', () => {
    const options = [
      { text: 'd', value: 'd' },
      { text: 'e', value: 'e' },
      { text: 'f', value: 'f' },
    ];

    const expected = [
      {
        multiselectId: 0, text: 'd', value: 'd',
      },
      {
        multiselectId: 1, text: 'e', value: 'e',
      },
      {
        multiselectId: 2, text: 'f', value: 'f',
      },
    ];

    const wrapper = setup({ options });

    expect(wrapper.vm.selectOptions).toEqual(expected);
  });

  it('MultiSelect input component renders the options', () => {
    const wrapper = setup({
      options: ['a', 'b', 'c'],
    });

    const multiselect = wrapper.find('.multiselect');
    const elements = multiselect.findAll('.multiselect__element');

    expect(multiselect.exists()).toBe(true);
    expect(elements.length).toBe(3);
  });

  it('MultiSelect input component allows multiple selections', async () => {
    const wrapper = setup({
      options: ['a', 'b', 'c'],
    });

    const multiselect = wrapper.find('.multiselect');
    const elements = () => multiselect.findAll('.multiselect__option');

    multiselect.trigger('click');
    elements()[1].trigger('click');
    await flushPromises();
    expect(wrapper.vm.inputValue).toEqual([{
      multiselectId: 1,
      text: 'b',
      value: 'b',
    }]);
    expect(wrapper.emitted().input).toEqual([[['b']]]);

    multiselect.trigger('click');
    elements()[0].trigger('click');
    await flushPromises();
    expect(wrapper.vm.inputValue).toEqual([{
      multiselectId: 1,
      text: 'b',
      value: 'b',
    }, {
      multiselectId: 0,
      text: 'a',
      value: 'a',
    }]);
    expect(wrapper.emitted().input).toEqual([[['b']], [['b', 'a']]]);
  });

  it('MultiSelect passes through component slots', () => {
    const wrapper = mount(MultiSelect, {
      global: {
        plugins: [i18n],
      },
      props: {
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
        plugins: [i18n],
      },
      attachTo: document.body,
      props: {
        ...defaultProps,
        autofocus: false,
      },
      slots: {
        prepend: '<span class="test_prepend">prepend</span>',
        append: '<span class="test_append">append</span>', // Will match <slot name="FooBar" />,
      },
    });

    try {
      await wrapper.vm.$nextTick();
      expect(document.activeElement).toEqual(document.body);
    } finally {
      wrapper.unmount();
    }
  });

  it('Multiselect is autofocused on prop "autofocus"', async () => {
    const wrapper = await mount(MultiSelect, {
      global: {
        plugins: [i18n],
      },
      attachTo: document.body,
      props: {
        ...defaultProps,
        autofocus: true,
      },
      slots: {
        prepend: '<span class="test_prepend">prepend</span>',
        append: '<span class="test_append">append</span>', // Will match <slot name="FooBar" />,
      },
    });

    const multiselect = findByTestId(wrapper, 'stub-testid');
    expect(multiselect.attributes('autofocus')).toBe('true');
  });
});
