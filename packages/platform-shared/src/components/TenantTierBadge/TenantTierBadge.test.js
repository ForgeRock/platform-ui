/**
 * Copyright (c) 2022 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount } from '@vue/test-utils';
import { findByTestId } from '@forgerock/platform-shared/src/utils/testHelpers';
import TenantTierBadge from './index';

describe('TenantTierBadge', () => {
  it('renders the correct badge-stlying and description according to the tenantTier property being passed', () => {
    const wrapper = mount(TenantTierBadge, {
      mocks: {
        $t: () => {},
      },
      propsData: {
        tenantTier: 'dev',
      },
    });
    const badgeText = findByTestId(wrapper, 'tenant-tier-badge');
    expect(badgeText.exists()).toBeTruthy();
    // expect(badgeText.text()).toBe('Dev');
    expect(wrapper.classes('border-primary')).toBe(true);
    expect(wrapper.classes('text-primary')).toBe(true);
  });

  it('renders the correct badge-stlying and description according to the tenantTier property being passed', () => {
    const wrapper = mount(TenantTierBadge, {
      mocks: {
        $t: () => {},
      },
      propsData: {
        tenantTier: 'staging',
      },
    });
    const badgeText = findByTestId(wrapper, 'tenant-tier-badge');
    expect(badgeText.exists()).toBeTruthy();
    // expect(badgeText.text()).toBe('Staging');
    expect(wrapper.classes('border-warning')).toBe(true);
    expect(wrapper.classes('text-warning')).toBe(true);
  });

  it('renders the correct badge-stlying and description according to the tenantTier property being passed', () => {
    const wrapper = mount(TenantTierBadge, {
      mocks: {
        $t: () => {},
      },
      propsData: {
        tenantTier: 'prod',
      },
    });
    const badgeText = findByTestId(wrapper, 'tenant-tier-badge');
    expect(badgeText.exists()).toBeTruthy();
    // expect(badgeText.text()).toBe('Prod');
    expect(wrapper.classes('border-success')).toBe(true);
    expect(wrapper.classes('text-success')).toBe(true);
  });

  it('renders the correct badge-stlying and description according to the tenantTier property being passed', () => {
    const wrapper = mount(TenantTierBadge, {
      mocks: {
        $t: () => {},
      },
      propsData: {
        tenantTier: 'other',
      },
    });
    const badgeText = findByTestId(wrapper, 'tenant-tier-badge');
    expect(badgeText.exists()).toBeTruthy();
    // expect(badgeText.text()).toBe('Other');
    expect(wrapper.classes('border-darkened')).toBe(true);
    expect(wrapper.classes('text-secondary')).toBe(true);
  });
});
