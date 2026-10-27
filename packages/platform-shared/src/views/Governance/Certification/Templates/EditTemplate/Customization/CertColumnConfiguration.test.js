/**
 * Copyright (c) 2025-2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount } from '@vue/test-utils';
import { find } from 'lodash';
import CertColumnConfiguration from './CertColumnConfiguration';
import i18n from '@/i18n';

describe('CertColumnConfiguration', () => {
  let wrapper;
  const grantFilterProperties = {
    user: [
      { key: 'name', displayName: 'Name' },
      { key: 'email', displayName: 'Email' },
    ],
    account: [
      { key: 'id', displayName: 'ID' },
    ],
  };

  const modelValue = ['user.name', 'account.id'];

  function mountComponent(customModelValue = modelValue, customGrantType = 'accounts', autoIdEnabled = false) {
    return mount(CertColumnConfiguration, {
      props: {
        'model-value': customModelValue,
        grantFilterProperties,
        grantType: customGrantType,
        autoIdEnabled,
      },
      global: {
        plugins: [i18n],
        stubs: ['FrColumnConfiguration'],
      },
    });
  }

  it('emits update:modelValue with correct payload when handleUpdate is called', async () => {
    wrapper = mountComponent();

    const newColumns = [
      { selectLabel: 'User Name', listLabel: 'User Name', value: 'user.name' },
      { selectLabel: 'Account ID', listLabel: 'Account ID', value: 'account.id' },
    ];
    await wrapper.vm.handleUpdate(newColumns);

    expect(wrapper.emitted('update:modelValue')).toBeTruthy();
    const lastEmitted = wrapper.emitted('update:modelValue').pop()[0];
    expect(lastEmitted).toEqual(['user.name', 'account.id']);
  });

  it('has the values from modelValue as elements in the list', () => {
    wrapper = mountComponent();
    expect(wrapper.findAll('.list-group-item')[0].text()).toContain('User Name');
    expect(wrapper.findAll('.list-group-item')[1].text()).toContain('Account ID');
  });

  it('getColumnLabel returns property label if not OOTB', () => {
    wrapper = mountComponent();
    expect(wrapper.vm.getColumnLabel('user.name')).toBe('User Name');
    expect(wrapper.vm.getColumnLabel('account.id')).toBe('Account ID');
  });

  it('has correct select fields for account grantType', () => {
    wrapper = mountComponent(modelValue, 'accounts');
    const keys = wrapper.vm.selectFields.map((s) => s.key);
    expect(keys).toContain('user');
    expect(keys).toContain('application');
    expect(keys).toContain('account');
    expect(keys).toContain('review');
    expect(keys).not.toContain('role');
    expect(keys).not.toContain('entitlement');
  });

  it('has correct select fields for entitlement grantType', () => {
    wrapper = mountComponent(modelValue, 'entitlements');
    const keys = wrapper.vm.selectFields.map((s) => s.key);
    expect(keys).toContain('user');
    expect(keys).toContain('application');
    expect(keys).toContain('account');
    expect(keys).toContain('entitlement');
    expect(keys).toContain('review');
    expect(keys).not.toContain('role');

    const reviewFields = find(wrapper.vm.selectFields, { key: 'review' });
    expect(reviewFields.options.length).toBe(2);
  });

  it('has correct select fields for entitlement grantType with autoIdConfig', () => {
    wrapper = mountComponent(modelValue, 'entitlements', true);
    const keys = wrapper.vm.selectFields.map((s) => s.key);
    expect(keys).toContain('user');
    expect(keys).toContain('application');
    expect(keys).toContain('account');
    expect(keys).toContain('entitlement');
    expect(keys).toContain('review');
    expect(keys).not.toContain('role');

    const reviewFields = find(wrapper.vm.selectFields, { key: 'review' });
    expect(reviewFields.options.length).toBe(3);
  });

  it('has agent category for agentProfile grantType and review extras', () => {
    wrapper = mountComponent(modelValue, 'agentProfile');
    const keys = wrapper.vm.selectFields.map((s) => s.key);
    expect(keys).toEqual(['agent', 'review']);
    expect(keys).not.toContain('application');
    expect(keys).not.toContain('user');
    expect(keys).not.toContain('account');

    const agentFields = find(wrapper.vm.selectFields, { key: 'agent' });
    const agentValues = agentFields.options.map((o) => o.value);
    expect(agentValues).toEqual(['agent.agent', 'agent.platform', 'agent.model']);
    // user-schema attributes are not offered as agent columns
    expect(agentValues).not.toContain('agent.name');
    expect(agentValues).not.toContain('agent.email');
    // the sortable toggle is hidden for columns the table can't server-sort
    const platformOption = agentFields.options.find((o) => o.value === 'agent.platform');
    expect(platformOption.hideSortable).toBe(true);
    const modelOption = find(agentFields.options, { value: 'agent.model' });
    expect(modelOption.hideSortable).toBe(true);
    // unflagged columns keep the toggle
    expect(agentFields.options.find((o) => o.value === 'agent.agent').hideSortable).toBeUndefined();
  });

  it('offers only the agent name column for agentAccess grantType', () => {
    // agentAccess items only carry the agent's user identity — the
    // account-derived platform/model/owner columns would render blank
    wrapper = mountComponent(modelValue, 'agentAccess');
    const keys = wrapper.vm.selectFields.map((s) => s.key);
    expect(keys).toEqual(['agent', 'review']);

    const agentFields = find(wrapper.vm.selectFields, { key: 'agent' });
    const agentValues = agentFields.options.map((o) => o.value);
    expect(agentValues).toEqual(['agent.agent']);
  });

  it('re-applies hideSortable from the column declarations when a saved selection loads', () => {
    // saved configs are plain strings — the flag must come back from the
    // declaration, or a flagged column's Sortable toggle reappears on load
    wrapper = mountComponent(['agent.platform', 'agent.model'], 'agentProfile');

    const listItems = wrapper.vm.selectedColumnsList;
    expect(listItems.find((c) => c.value === 'agent.platform').hideSortable).toBe(true);
    expect(listItems.find((c) => c.value === 'agent.model').hideSortable).toBe(true);
  });

  it('selectFields only includes categories for the current grantType', () => {
    wrapper = mountComponent(modelValue, 'roles');
    const keys = wrapper.vm.selectFields.map((s) => s.key);
    expect(keys).toContain('user');
    expect(keys).toContain('role');
    expect(keys).toContain('review');
    expect(keys).not.toContain('application');
    expect(keys).not.toContain('account');
    expect(keys).not.toContain('entitlement');
  });
});
