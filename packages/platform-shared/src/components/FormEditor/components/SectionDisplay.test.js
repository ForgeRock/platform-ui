/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount } from '@vue/test-utils';
import SectionDisplay from './SectionDisplay';

const property = {
  id: 'section1',
  type: 'section',
  layout: { columns: 12, offset: 0 },
  header: 'Section Header',
  footer: 'Section Footer',
  fields: [[{
    id: 'c78a53ab-9b7f-499f-aea2-e1916f20af85',
    model: 'field1',
    type: 'text',
    label: 'Field 1',
    validation: { required: true },
    layout: { columns: 12, offset: 0 },
  }]],
};
const model = { field1: 'value1' };

// Test suite
describe('SectionDisplay.vue', () => {
  function mountComponent(props) {
    return mount(SectionDisplay, {
      props: {
        ...props,
      },
    });
  }

  it('renders header, footer, and passes props to FormBuilder', () => {
    const wrapper = mountComponent({ property, model });
    expect(wrapper.text()).toContain('Section Header');
    expect(wrapper.text()).toContain('Section Footer');
    const formBuilder = wrapper.findComponent({ name: 'FormBuilder' });
    expect(formBuilder.exists()).toBe(true);
  });

  it('emits update:model when FormBuilder emits field-changed', async () => {
    const wrapper = mountComponent({ property, model });

    await wrapper.findComponent({ name: 'FormBuilder' }).vm.$emit('field-changed', { foo: 'bar' });
    expect(wrapper.emitted('update:model')).toBeTruthy();
    expect(wrapper.emitted('update:model')[0][0]).toEqual({ foo: 'bar' });
  });

  it('emits is-valid with sectionId when FormBuilder emits is-valid', async () => {
    const wrapper = mountComponent({ property, model });
    await wrapper.findComponent({ name: 'FormBuilder' }).vm.$emit('is-valid', true);
    expect(wrapper.emitted('is-valid')).toBeTruthy();
    expect(wrapper.emitted('is-valid')[0][0]).toEqual({ sectionId: 'section1', isValid: true });
  });

  it('does not render header or footer if not provided', () => {
    const wrapper = mount(SectionDisplay, {
      property: { id: 'section2', fields: [] },
    });
    expect(wrapper.text()).not.toContain('Section Header');
    expect(wrapper.text()).not.toContain('Section Footer');
  });
});
