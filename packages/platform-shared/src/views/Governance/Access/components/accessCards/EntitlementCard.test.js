/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount, flushPromises } from '@vue/test-utils';
import i18n from '@/i18n';
import EntitlementCard from './EntitlementCard';

const exampleEntitlementCard = {
  name: 'entitlementGrant-system/MicrosoftTarget/__GROUP__/ac77bdcb-659f-4276-beb9-14604d62986e',
  displayType: 'AccessNode',
  type: 'entitlementGrant',
  displayName: 'Customer Support - QA',
  appName: 'Microsoft Entra',
  icon: 'https://cdn.forgerock.com/platform/app-templates/images/microsoft.svg',
};

const mountComponent = () => mount(EntitlementCard, {
  global: {
    plugins: [i18n],
  },
  props: {
    access: exampleEntitlementCard,
  },
});

describe('Entitlement Card Details', () => {
  it('should display correct entitlement details', async () => {
    const wrapper = mountComponent();
    await flushPromises();

    const imgElement = wrapper.find('img[src="https://cdn.forgerock.com/platform/app-templates/images/microsoft.svg"]');
    expect(imgElement.exists()).toBe(true);

    const appName = wrapper.find('h4');
    expect(appName.text()).toBe('Entitlement');

    const entitlementName = wrapper.find('h3');
    expect(entitlementName.text()).toBe('Customer Support - QA');
  });
});
