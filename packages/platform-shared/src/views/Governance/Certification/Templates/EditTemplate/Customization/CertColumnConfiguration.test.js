/**
 * Copyright 2025 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
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
