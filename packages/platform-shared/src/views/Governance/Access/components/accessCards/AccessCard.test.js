/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount, flushPromises } from '@vue/test-utils';
import i18n from '@/i18n';
import AccessCard from './AccessCard';

const exampleAccess = {
  x: 80,
  y: 185,
  id: 'roleMembership-a0e4bfbe-1f3f-4d95-b57e-1582108a75fa',
  name: 'roleMembership-a0e4bfbe-1f3f-4d95-b57e-1582108a75fa',
  displayType: 'AccessNode',
  connections: {
    'accountGrant-system/MicrosoftTarget/User/82ebe3f7-463b-4301-905f-9ff7a6cc8962': 'accountGrant-system/MicrosoftTarget/User/82ebe3f7-463b-4301-905f-9ff7a6cc8962',
    'entitlementGrant-system/MicrosoftTarget/directoryRole/d05cc74f-d9df-4714-a586-004c8efc4bde': 'entitlementGrant-system/MicrosoftTarget/directoryRole/d05cc74f-d9df-4714-a586-004c8efc4bde',
    'entitlementGrant-system/MicrosoftTarget/__GROUP__/be9623b4-a31f-4aa1-8d57-1098c698b7bd': 'entitlementGrant-system/MicrosoftTarget/__GROUP__/be9623b4-a31f-4aa1-8d57-1098c698b7bd',
    'entitlementGrant-system/MicrosoftTarget/__GROUP__/ac77bdcb-659f-4276-beb9-14604d62986e': 'entitlementGrant-system/MicrosoftTarget/__GROUP__/ac77bdcb-659f-4276-beb9-14604d62986e',
  },
  type: 'roleMembership',
  displayName: 'MK Role 2',
  icon: 'assignment_ind',
};

const mountComponent = () => mount(AccessCard, {
  global: {
    plugins: [i18n],
  },
  props: {
    access: exampleAccess,
  },
});

describe('Access Card Details', () => {
  it('should emit access-selected event when clicked', async () => {
    const wrapper = mountComponent();
    await flushPromises();
    const card = wrapper.find('.card-wrapper div div');
    await card.trigger('click');
    expect(wrapper.emitted('access-selected')).toBeTruthy();
  });

  it('should emit get-card-details immediately on mount', async () => {
    const wrapper = mountComponent();
    await flushPromises();
    expect(wrapper.emitted('get-card-details')).toBeTruthy();
  });
});
