/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { shallowMount } from '@vue/test-utils';
import FrField from '@forgerock/platform-shared/src/components/Field';
import FrTimezoneOffset from '@forgerock/platform-shared/src/components/TimezoneOffset';
import FrTimezoneOffsetSelect from '@forgerock/platform-shared/src/components/TimezoneOffsetSelect';
import DateTimeTimezonePicker from './index';

describe('DateTimeTimezonePicker', () => {
  function mountComponent(props = {}) {
    return shallowMount(DateTimeTimezonePicker, {
      props: {
        label: 'Send date and time',
        timezoneLabel: 'Time zone',
        name: 'sendDate',
        ...props,
      },
    });
  }

  it('has the expected component name', () => {
    mountComponent();
    expect(DateTimeTimezonePicker.name).toBe('DateTimeTimezonePicker');
  });

  it('renders the datetime FrField and the TimezoneOffset picker', () => {
    const wrapper = mountComponent();
    const dateField = wrapper.findComponent(FrField);
    expect(dateField.exists()).toBe(true);
    // A missing type would render a plain text box instead of the datetime picker.
    expect(dateField.attributes('type')).toBe('datetime');
    // With a timezone picker present the datetime must not be adjusted for the
    // browser's time zone; the caller converts to UTC with the picked offset.
    expect(dateField.vm.$attrs['adjust-for-timezone']).toBe(false);
    expect(dateField.vm.$attrs['show-seconds']).toBe(false);
    // Slider mode by default: the timezone picker carries its floating label.
    const timezone = wrapper.findComponent(FrTimezoneOffset);
    expect(timezone.exists()).toBe(true);
    expect(timezone.props('placeholder')).toBe('Time zone');
  });

  it('renders a dropdown of common zones when timezoneSelect is set', () => {
    const wrapper = mountComponent({ timezoneSelect: true });
    expect(wrapper.findComponent(FrTimezoneOffset).exists()).toBe(false);
    const select = wrapper.findComponent(FrTimezoneOffsetSelect);
    expect(select.exists()).toBe(true);
    expect(select.vm.$attrs.label).toBe('Time zone');
  });

  it('emits update:date when the datetime changes', async () => {
    const wrapper = mountComponent();
    // FrField is a Vue 2-compat component: it emits modelCompat:input, which
    // the v-model binding (onModelCompat:input) listens for.
    wrapper.findComponent(FrField).vm.$emit('modelCompat:input', '2026-10-01T09:00');
    await wrapper.vm.$nextTick();
    expect(wrapper.emitted('update:date')).toEqual([['2026-10-01T09:00']]);
  });

  it('emits update:timezone when the offset changes', async () => {
    const wrapper = mountComponent();
    wrapper.findComponent(FrTimezoneOffset).vm.$emit('input', -5);
    await wrapper.vm.$nextTick();
    expect(wrapper.emitted('update:timezone')).toEqual([[-5]]);
  });

  it('passes updated values back down to the pickers', async () => {
    const wrapper = mountComponent();
    await wrapper.setProps({ date: '2026-10-01T09:00', timezone: -5 });
    // FrField receives its value through $attrs (Vue 2-style v-model).
    expect(wrapper.findComponent(FrField).vm.$attrs.value).toBe('2026-10-01T09:00');
    expect(wrapper.findComponent(FrTimezoneOffset).props('value')).toBe(-5);
  });

  it('disables both pickers when disabled is set', () => {
    const wrapper = mountComponent({ disabled: true });
    expect(wrapper.findComponent(FrField).attributes('disabled')).toBe('true');
    expect(wrapper.findComponent(FrTimezoneOffset).attributes('disabled')).toBe('true');
  });
});
