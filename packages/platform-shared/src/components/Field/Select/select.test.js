/**
 * Copyright 2020 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS.
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
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
