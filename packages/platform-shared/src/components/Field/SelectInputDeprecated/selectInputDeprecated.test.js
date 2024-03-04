/**
 * Copyright (c) 2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount, flushPromises } from '@vue/test-utils';
import { findByTestId } from '@forgerock/platform-shared/src/utils/testHelpers';
import i18n from '@/i18n';
import SelectInput from './index';

describe('SelectInput', () => {
  const defaultProps = {
    name: 'stub-name',
    testid: 'stub-testid',
    options: [],
  };

  function setup(props) {
    return mount(SelectInput, {
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
      const wrapper = setup({ _uid: 'test' });

      const multiselect = findByTestId(wrapper, 'stub-testid');
      expect(wrapper.vm.floatLabels).toBe(false);
      expect(multiselect.attributes('aria-expanded')).toBe('false');
      expect(multiselect.attributes('aria-labelledby')).toBe('floatingLabelInput1-label');

      const multiSelectInput = multiselect.find(`[id=floatingLabelInput${wrapper.vm._uid}]`);
      expect(multiSelectInput.attributes('aria-labelledby')).not.toBeDefined();
    });

    it('given inputLabelledby', async () => {
      const wrapper = setup({ inputLabelledby: 'stub-input-labelledby' });
      await flushPromises();

      const multiselect = findByTestId(wrapper, 'stub-testid');
      const multiSelectInput = multiselect.find(`[id=floatingLabelInput${wrapper.vm._uid}]`);
      expect(multiSelectInput.attributes('aria-labelledby')).toBe('stub-input-labelledby');
    });
  });

  describe('@actions', () => {
    xit('when open, should have aria-expanded attribute', async () => {
      const wrapper = setup();
      const multiselect = findByTestId(wrapper, 'stub-testid');
      await multiselect.trigger('focus');
      expect(multiselect.attributes('aria-expanded')).toBe('true');
    });
  });

  it('SelectInput component process options prop from array', () => {
    const wrapper = setup({ options: ['a', 'b', 'c'] });

    const expected = [
      { text: 'a', value: 'a' },
      { text: 'b', value: 'b' },
      { text: 'c', value: 'c' },
    ];

    expect(wrapper.vm.selectOptions).toEqual(expected);
  });

  it('SelectInput component passes through options object prop', () => {
    const options = [
      { text: 'd', value: 'd' },
      { text: 'e', value: 'e' },
      { text: 'f', value: 'f' },
    ];

    const wrapper = setup({ options });

    expect(wrapper.vm.selectOptions).toEqual(options);
  });

  it('SelectInput component renders the options', () => {
    const wrapper = setup({ options: ['a', 'b', 'c'] });

    const select = wrapper.find('.multiselect');
    const elements = select.findAll('.multiselect__element');

    expect(select.exists()).toBe(true);
    expect(elements.length).toBe(3);
  });

  it('SelectInput component Closes Dropdown', () => {
    const wrapper = setup({ options: ['a', 'b', 'c'], label: 'testLabel' });

    wrapper.vm.floatLabels = true;
    expect(wrapper.vm.floatLabels).toBe(true);
    wrapper.vm.closeDropDown();
    expect(wrapper.vm.floatLabels).toBe(false);
    wrapper.vm.closeDropDown('test');
    expect(wrapper.vm.floatLabels).toBe(true);
  });

  it('SelectInput component Closes Dropdown without floating label', async () => {
    const closeDropDownSpy = jest.spyOn(SelectInput.methods, 'closeDropDown');
    const wrapper = setup({ options: ['a', 'b', 'c'], label: 'testLabel', floatingLabel: false });

    expect(wrapper.vm.floatLabels).toBe(false);
    await wrapper.vm.$refs.vms.$emit('close');
    expect(closeDropDownSpy).not.toHaveBeenCalled();
    expect(wrapper.vm.floatLabels).toBe(false);
  });

  it('SelectInput component allows single selections', () => {
    const wrapper = setup({ options: ['a', 'b', 'c'] });

    const select = wrapper.find('.multiselect');
    const elements = () => select.findAll('.multiselect__option');

    select.trigger('click');
    elements()[1].trigger('click');
    expect(wrapper.vm.inputValue).toEqual({ text: 'b', value: 'b' });

    select.trigger('click');
    elements()[0].trigger('click');
    expect(wrapper.vm.inputValue).toEqual({ text: 'a', value: 'a' });
  });

  it('SelectInput passes through component slots', () => {
    const wrapper = mount(SelectInput, {
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

  it('will update the displayed selected value if the text for that option changes', async () => {
    const wrapper = setup({
      options: [
        { text: 'ayy', value: 'a' },
        { text: 'bee', value: 'b' },
        { text: 'cee', value: 'c' },
      ],
    });

    await wrapper.setProps({ value: 'b' });

    // Check that the SelectInput shows the correct initial text
    expect(wrapper.find('.multiselect__single').text()).toBe('bee');

    await wrapper.setProps({
      options: [
        { text: 'ayy', value: 'a' },
        { text: 'beegees?', value: 'b' },
        { text: 'cee', value: 'c' },
      ],
    });

    expect(wrapper.find('.multiselect__single').text()).toBe('beegees?');
  });

  it('SelectInput removes float for blank values', async () => {
    const wrapper = setup({
      options: [
        { text: 'ayy', value: 'a' },
        { text: 'bee', value: 'b' },
      ],
    });

    wrapper.vm.floatLabels = true;

    await wrapper.setProps({ value: 'sdf' });
    expect(wrapper.vm.floatLabels).toBe(true);
    await wrapper.setProps({ value: '', options: [] });
    expect(wrapper.vm.floatLabels).toBe(false);
  });

  it('SelectInput removes float for blank values without floating label', () => {
    const wrapper = setup({
      options: [
        { text: 'ayy', value: 'a' },
        { text: 'bee', value: 'b' },
      ],
      floatingLabel: false,
    });

    wrapper.setProps({ value: 'sdf' });
    expect(wrapper.vm.floatLabels).toBe(false);
    wrapper.setProps({ value: '', options: [] });
    expect(wrapper.vm.floatLabels).toBe(false);
  });

  it('SelectInput is not autofocused on absence of prop "autofocus"', () => {
    const wrapper = mount(SelectInput, {
      global: {
        plugins: [i18n],
      },
      props: {
        ...defaultProps,
        autofocus: false,
      },
      slots: {
        prepend: '<span class="test_prepend">prepend</span>',
        append: '<span class="test_append">append</span>', // Will match <slot name="FooBar" />,
      },
    });

    const multiselect = findByTestId(wrapper, 'stub-testid');
    expect(multiselect.attributes('aria-expanded')).toBe('false');
  });

  it('SelectInput is autofocused on prop "autofocus"', async () => {
    const wrapper = mount(SelectInput, {
      global: {
        plugins: [i18n],
      },
      attachTo: document.body,
      props: {
        ...defaultProps,
        autofocus: true,
        searchable: true,
      },
      slots: {
        prepend: '<span class="test_prepend">prepend</span>',
        append: '<span class="test_append">append</span>', // Will match <slot name="FooBar" />,
      },
    });
    await flushPromises();

    const multiselect = findByTestId(wrapper, 'stub-testid');
    expect(multiselect.attributes('aria-expanded')).toBe('true');
  });

  it('Maintains focus on the multiselect component after selecting an option', async () => {
    const wrapper = setup({ options: ['a', 'b', 'c'] });

    // The internals of vue-test-utils does not update the DOM with focused element states
    // when triggering event listeners, so it wasn't possible to test the actual DOM element
    // when it was focused, but we are able to deduce that the menu is still focused by being
    // able to immediately trigger it using a keyboard event after making a selection.
    const multiselect = findByTestId(wrapper, 'stub-testid');
    const options = wrapper.findAll('.multiselect__option');

    // Menu is opened initially
    multiselect.trigger('focus');

    // Option selected, menu closes, menu expected to remain focused
    options[0].trigger('click');
    expect(multiselect.attributes('aria-expanded')).toBe('false');

    // We can deduce that the menu is still focused because we can
    // immediately trigger it again using the down arrow.
    multiselect.trigger('keydown', { key: 'ArrowDown' });
    await wrapper.vm.$nextTick();
    expect(multiselect.attributes('aria-expanded')).toBe('true');
  });

  it('Displays the multiselect menu options if the "up arrow" is clicked', async () => {
    const wrapper = setup({ options: ['a', 'b', 'c'] });

    const multiselect = findByTestId(wrapper, 'stub-testid');
    await multiselect.trigger('keydown', { key: 'ArrowUp' });
    expect(multiselect.attributes('aria-expanded')).toBe('true');
  });

  it('Displays the multiselect menu options if the "down arrow" is clicked', async () => {
    const wrapper = setup({ options: ['a', 'b', 'c'] });

    const multiselect = findByTestId(wrapper, 'stub-testid');
    await multiselect.trigger('keydown', { key: 'ArrowDown' });
    expect(multiselect.attributes('aria-expanded')).toBe('true');
  });

  it('Keeps the previously selected option highlighted after revealing the menu using the "up arrow" or "down arrow"', async () => {
    const wrapper = setup({ options: ['a', 'b', 'c'] });
    const multiselect = findByTestId(wrapper, 'stub-testid');
    const options = wrapper.findAll('.multiselect__option');

    // When the menu is initially opened, we expect the first option to always be highlighted
    await multiselect.trigger('focus');
    expect(options[0].classes('multiselect__option--highlight')).toBe(true);

    // The second option selected, menu closes, menu remains focused
    await options[1].trigger('click');
    expect(multiselect.attributes('aria-expanded')).toBe('false');

    // We trigger the menu to show again by clicking on the "down arrow" and the second option should now be highlighted
    await multiselect.trigger('keydown', { key: 'ArrowDown' });
    expect(multiselect.attributes('aria-expanded')).toBe('true');
    expect(options[0].classes('multiselect__option--highlight')).toBe(false);
    expect(options[1].classes('multiselect__option--highlight')).toBe(true);

    // The third option selected, menu closes, menu remains focused
    await options[2].trigger('click');
    expect(multiselect.attributes('aria-expanded')).toBe('false');

    // We trigger the menu once more by clicking on the "up arrow" this time and the third option should remain highlighted
    await multiselect.trigger('keydown', { key: 'ArrowUp' });
    expect(multiselect.attributes('aria-expanded')).toBe('true');
    expect(options[0].classes('multiselect__option--highlight')).toBe(false);
    expect(options[1].classes('multiselect__option--highlight')).toBe(false);
    expect(options[2].classes('multiselect__option--highlight')).toBe(true);
  });
});
