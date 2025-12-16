/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount, flushPromises } from '@vue/test-utils';
import i18n from '@/i18n';
import AccountCard from './AccountCard';

const exampleAccountCard = {
  name: 'accountGrant-system/MicrosoftTarget/User/82ebe3f7-463b-4301-905f-9ff7a6cc8962',
  displayType: 'AccessNode',
  type: 'accountGrant',
  displayName: 'Barth@IGATestQA.onmicrosoft.com',
  appName: 'Microsoft Entra',
  icon: 'https://cdn.forgerock.com/platform/app-templates/images/microsoft.svg',
};

const mountComponent = () => mount(AccountCard, {
  global: {
    plugins: [i18n],
  },
  props: {
    access: exampleAccountCard,
  },
});

describe('Account Card Details', () => {
  it('should display correct account details', async () => {
    const wrapper = mountComponent();
    await flushPromises();

    const imgElement = wrapper.find('img[src="https://cdn.forgerock.com/platform/app-templates/images/microsoft.svg"]');
    expect(imgElement.exists()).toBe(true);

    const appName = wrapper.find('h4');
    expect(appName.text()).toBe('Account');

    const accountName = wrapper.find('h3');
    expect(accountName.text()).toBe('Barth@IGATestQA.onmicrosoft.com');
  });
});
