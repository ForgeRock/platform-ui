/**
 * Copyright 2025 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

import { mount, flushPromises } from '@vue/test-utils';
import Customization from './Customization';
import i18n from '@/i18n';

describe('Customization', () => {
  let wrapper;
  const grantFilterProperties = {
    user: [
      { key: 'name', displayName: 'User Name' },
      { key: 'email', displayName: 'Email' },
    ],
    account: [
      { key: 'id', displayName: 'Account ID' },
    ],
  };

  const value = {
    columnConfig: {
      accounts: ['user.name', 'account.id'],
      entitlements: ['user.name'],
      roles: ['user.name'],
      entitlementComposition: ['application.application', 'entitlement.entitlement', 'review.flags', 'review.comments'],
    },
  };

  const summary = {
    enableAccountGrant: true,
    enableEntitlementGrant: true,
    enableRoleGrant: true,
    enableEntitlementCompositionGrant: true,
  };

  function mountComponent(customValue = value, customSummary = summary) {
    return mount(Customization, {
      props: {
        value: customValue,
        grantFilterProperties,
        summary: customSummary,
      },
      global: {
        plugins: [i18n],
      },
    });
  }

  it('has tabs for each grant type', async () => {
    wrapper = mountComponent();
    await flushPromises();

    const tabTitles = wrapper.findAll('btab').map((tab) => tab.attributes('title'));
    expect(tabTitles[0]).toContain('Accounts');
    expect(tabTitles[1]).toContain('Entitlements');
    expect(tabTitles[2]).toContain('Roles');
    expect(tabTitles[3]).toContain('Entitlement Composition');
  });

  it('does not have tabs for grant types that are not a part of the certification', async () => {
    const customSummary = {
      enableAccountGrant: true,
      enableEntitlementGrant: false,
      enableRoleGrant: true,
      enableEntitlementCompositionGrant: false,
    };
    wrapper = mountComponent(value, customSummary);
    await flushPromises();

    const tabTitles = wrapper.findAll('btab').map((tab) => tab.attributes('title'));
    expect(tabTitles[0]).toContain('Accounts');
    expect(tabTitles[1]).toContain('Roles');
    expect(tabTitles.length).toBe(2);
  });

  it('passes correct props to CertColumnConfiguration for each tab', async () => {
    wrapper = mountComponent();
    await flushPromises();

    // Find all CertColumnConfiguration stubs
    const certColConfigs = wrapper.findAllComponents({ name: 'CertColumnConfiguration' });
    expect(certColConfigs.length).toBe(4);

    // Check that each CertColumnConfiguration receives the correct model-value and grant-type
    const grantTypes = ['accounts', 'entitlements', 'roles', 'entitlementComposition'];
    certColConfigs.forEach((colConfig, idx) => {
      expect(colConfig.props('modelValue')).toEqual(value.columnConfig[grantTypes[idx]]);
      expect(colConfig.props('grantFilterProperties')).toEqual(grantFilterProperties);
      expect(colConfig.props('grantType')).toBe(grantTypes[idx]);
    });
  });

  it('updates updatedColumnConfig when CertColumnConfiguration emits update:model-value', async () => {
    wrapper = mountComponent();
    await flushPromises();

    // Simulate update:model-value from the first CertColumnConfiguration (accounts)
    const certColConfigs = wrapper.findAllComponents({ name: 'CertColumnConfiguration' });
    await certColConfigs[0].vm.$emit('update:model-value', ['user.name']);
    await flushPromises();

    // The updatedColumnConfig for accounts should be updated
    expect(wrapper.vm.updatedColumnConfig.accounts).toEqual(['user.name']);
  });

  it('emits input event with updated columnConfig when updatedColumnConfig changes', async () => {
    wrapper = mountComponent();
    await flushPromises();

    // Simulate update:model-value from the first CertColumnConfiguration (accounts)
    const certColConfigs = wrapper.findAllComponents({ name: 'CertColumnConfiguration' });
    await certColConfigs[0].vm.$emit('update:model-value', ['user.name']);
    await flushPromises();

    // Should emit input with the new columnConfig
    expect(wrapper.emitted('input')).toBeTruthy();
    const lastEmitted = wrapper.emitted('input').pop()[0];
    expect(lastEmitted).toEqual({
      columnConfig: {
        accounts: ['user.name'],
        entitlements: ['user.name'],
        roles: ['user.name'],
        entitlementComposition: ['application.application', 'entitlement.entitlement', 'review.flags', 'review.comments'],
      },
    });
  });
});
