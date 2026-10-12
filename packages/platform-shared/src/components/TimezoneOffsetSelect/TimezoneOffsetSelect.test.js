/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { shallowMount } from '@vue/test-utils';
import FrField from '@forgerock/platform-shared/src/components/Field';
import TimezoneOffsetSelect from './index';

jest.mock('@/i18n', () => ({
  global: { t: (id) => id },
}));

describe('TimezoneOffsetSelect', () => {
  function mountComponent(props = {}) {
    return shallowMount(TimezoneOffsetSelect, {
      props: {
        label: 'Time zone',
        value: 0,
        ...props,
      },
    });
  }

  it('renders a select FrField with the floating label', () => {
    const wrapper = mountComponent();
    const field = wrapper.findComponent(FrField);
    expect(field.attributes('type')).toBe('select');
    expect(field.vm.$attrs.label).toBe('Time zone');
  });

  it('defaults to UTC (offset 0)', () => {
    const wrapper = mountComponent();
    expect(wrapper.props('value')).toBe(0);
    // UTC is the first option.
    expect(wrapper.vm.options[0].value).toBe(0);
  });

  it('lists the common zones with their fixed GMT offsets', () => {
    const wrapper = mountComponent();
    const { options } = wrapper.vm;
    const byText = Object.fromEntries(options.map((o) => [o.text, o.value]));
    expect(byText['common.timezoneOffsets.utc']).toBe(0);
    expect(byText['common.timezoneOffsets.pst']).toBe(-8);
    expect(byText['common.timezoneOffsets.cst']).toBe(-6);
    expect(byText['common.timezoneOffsets.est']).toBe(-5);
    expect(byText['common.timezoneOffsets.ist']).toBe(5.5);
    expect(byText['common.timezoneOffsets.jst']).toBe(9);
  });

  it('emits input with the offset hours when a zone is picked', async () => {
    const wrapper = mountComponent();
    // FrField is a Vue 2-compat component: it emits modelCompat:input, which
    // the v-model binding (onModelCompat:input) listens for.
    wrapper.findComponent(FrField).vm.$emit('modelCompat:input', -6);
    await wrapper.vm.$nextTick();
    expect(wrapper.emitted('input')).toEqual([[-6]]);
  });

  it('passes the selected offset back down as the value', async () => {
    const wrapper = mountComponent();
    await wrapper.setProps({ value: -6 });
    expect(wrapper.findComponent(FrField).vm.$attrs.value).toBe(-6);
  });
});
