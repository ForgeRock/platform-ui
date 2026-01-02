/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount, flushPromises } from '@vue/test-utils';
import i18n from '@/i18n';
import AccountGrantDetails from './AccountGrantDetails';

jest.mock('@forgerock/platform-shared/src/utils/appSharedUtils', () => ({
  getApplicationLogo: jest.fn().mockReturnValue('app_logo.png'),
  getApplicationDisplayName: jest.fn().mockReturnValue('app display name'),
}));

const exampleAccountGrant = {
  account: {
    __NAME__: 'Barth@IGATestQA.onmicrosoft.com',
  },
  application: {
    connectorId: 'MicrosoftTarget',
    name: 'Microsoft Target',
    templateName: 'azure.ad',
    templateVersion: '3.3',
  },
  descriptor: {
    idx: {
      '/account': {
        displayName: 'Barth@IGATestQA.onmicrosoft.com',
      },
    },
  },
  item: {
    decision: {
      accessRequest: {
        grantStartDate: '2025-01-23T15:21:29Z',
      },
    },
    type: 'accountGrant',
  },
};

const mountComponent = () => mount(AccountGrantDetails, {
  global: {
    plugins: [i18n],
  },
  props: {
    access: exampleAccountGrant,
  },
});

describe('Account Grant Details', () => {
  it('should display correct account details', async () => {
    const wrapper = mountComponent();
    await flushPromises();

    const imgElement = wrapper.find('img[src="app_logo.png"]');
    expect(imgElement.exists()).toBe(true);

    const appName = wrapper.find('h4');
    expect(appName.text()).toBe('Microsoft Target');

    const accountName = wrapper.find('h3');
    expect(accountName.text()).toBe('Barth@IGATestQA.onmicrosoft.com');

    const grantDates = wrapper.findAll('.mb-4');
    expect(grantDates[0].text()).toBe('Access Start Date Jan 23, 2025');
    expect(grantDates[1].text()).toBe('Access End Date --');
  });
});
