/**
 * Copyright (c) 2022-2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount } from '@vue/test-utils';
import TenantTierBadge from './index';
import { findByTestId } from '../../utils/testHelpers';
import i18n from '../../../../platform-admin/src/i18n';

describe('TenantTierBadge', () => {
  it('renders correct abbreviation: "Dev", and associated css classes for a "development" badge: "blue-tenant, tenant-badge"', () => {
    const tenantTier = 'dev';
    const wrapper = mount(TenantTierBadge, {
      i18n,
      propsData: {
        tenantTier,
      },
    });
    const badge = findByTestId(wrapper, 'tenant-tier-badge');
    expect(badge.classes()).toContain('blue-tenant');
    expect(badge.classes()).toContain('tenant-badge');
    expect(badge.text()).toBe('Dev');
  });
});
