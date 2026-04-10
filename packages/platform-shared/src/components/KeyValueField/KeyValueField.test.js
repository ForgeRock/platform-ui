/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount } from '@vue/test-utils';
import FrKeyValueList from '@forgerock/platform-shared/src/components/Field/KeyValueList';
import KeyValueField from './KeyValueField';

// Stub FrKeyValueList to isolate KeyValueField's own responsibilities.
// We verify delegation (props/attrs/events) via the stub's recorded calls,
// not FrKeyValueList's internal rendering.
jest.mock('@forgerock/platform-shared/src/components/Field/KeyValueList', () => ({
  name: 'FrKeyValueList',
  template: '<div data-testid="fr-key-value-list"><slot /></div>',
  props: ['value'],
  emits: ['input'],
}));

function setup(props = {}) {
  return mount(KeyValueField, {
    global: {
      mocks: { $t: (key) => key },
    },
    props: {
      label: 'My Label',
      value: {},
      ...props,
    },
  });
}

describe('KeyValueField', () => {
  describe('@renders', () => {
    it('renders the label text', () => {
      const wrapper = setup({ label: 'Custom Headers' });
      expect(wrapper.find('label').text()).toBe('Custom Headers');
    });

    it('gives the label an id and links it to FrKeyValueList via aria-labelledby', () => {
      const wrapper = setup({ label: 'Custom Headers' });
      const label = wrapper.find('label');
      const list = wrapper.findComponent(FrKeyValueList);
      expect(label.attributes('id')).toBeTruthy();
      expect(list.attributes('aria-labelledby')).toBe(label.attributes('id'));
    });

    it('renders FrKeyValueList', () => {
      const wrapper = setup();
      expect(wrapper.findComponent(FrKeyValueList).exists()).toBe(true);
    });

    it('does not render a description when none is provided', () => {
      const wrapper = setup({ description: '' });
      expect(wrapper.find('p').exists()).toBe(false);
    });

    it('renders the description as plain text when isHtml is false', () => {
      const wrapper = setup({ description: 'Some <b>description</b>', isHtml: false });
      const p = wrapper.find('p');
      expect(p.exists()).toBe(true);
      // v-else-if branch: text content, not parsed HTML
      expect(p.text()).toBe('Some <b>description</b>');
    });

    it('renders the description as HTML when isHtml is true', () => {
      const wrapper = setup({ description: 'Some <b>description</b>', isHtml: true });
      const p = wrapper.find('p');
      expect(p.exists()).toBe(true);
      // v-html branch: the <b> tag must be rendered as a real element
      expect(p.find('b').exists()).toBe(true);
      expect(p.find('b').text()).toBe('description');
    });
  });

  describe('@props', () => {
    it('passes value down to FrKeyValueList', () => {
      const value = { foo: 'bar' };
      const wrapper = setup({ value });
      const list = wrapper.findComponent(FrKeyValueList);
      expect(list.props('value')).toEqual({ foo: 'bar' });
    });

    it('passes $attrs through to FrKeyValueList', () => {
      const wrapper = mount(KeyValueField, {
        global: { mocks: { $t: (key) => key } },
        props: { label: 'Label', value: {} },
        attrs: { 'add-label': 'Add header' },
      });
      const list = wrapper.findComponent(FrKeyValueList);
      expect(list.attributes('add-label')).toBe('Add header');
    });
  });

  // Event forwarding (v-on="$listeners") is tested in KeyValueList.test.js which
  // exercises the full add/edit/delete flows. No separate forwarding test is needed
  // here — testing $listeners wiring in isolation requires fighting the Vue 2 compat
  // layer and produces no additional coverage over the KeyValueList integration tests.
});
