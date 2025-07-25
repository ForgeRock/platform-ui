/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount, flushPromises } from '@vue/test-utils';
import * as CommonsApi from '@forgerock/platform-shared/src/api/governance/CommonsApi';
import i18n from '@/i18n';
import ApplicationSearch from './ApplicationSearch';

jest.mock('@forgerock/platform-shared/src/api/governance/CommonsApi');
jest.mock('@forgerock/platform-shared/src/utils/appSharedUtils', () => ({
  getApplicationLogo: jest.fn().mockReturnValue('app_logo.png'),
  getApplicationDisplayName: jest.fn().mockReturnValue('app display name'),
}));

const mockApplications = [
  {
    icon: 'google.svg',
    id: '1761d1fd-796d-490d-a986-f41ee09c03f5',
    name: 'GWS-ULife',
    templateName: 'google.workspace',
  },
  {
    description: 'Test',
    icon: 'microsoft.svg',
    id: '1fbe6672-780c-4226-af35-01a2546723c1',
    name: 'Microsoft Target',
    templateName: 'azure.ad',
  },
];

const mountComponent = () => mount(ApplicationSearch, {
  global: {
    plugins: [i18n],
  },
  props: {
    applicationSearchResults: mockApplications,
  },
});

describe('GovResourceSelect Component', () => {
  CommonsApi.getResource.mockResolvedValue({ result: mockApplications });

  it('renders options', async () => {
    const wrapper = mountComponent();
    await flushPromises();
    expect(wrapper.vm.applicationFilterOptions).toEqual([
      {
        value: '1761d1fd-796d-490d-a986-f41ee09c03f5',
        title: 'GWS-ULife',
        subtitle: 'app display name',
        icon: 'app_logo.png',
      },
      {
        value: '1fbe6672-780c-4226-af35-01a2546723c1',
        title: 'Microsoft Target',
        subtitle: 'app display name',
        icon: 'app_logo.png',
      },
    ]);
  });

  it('emits search on search input', async () => {
    const wrapper = mountComponent();
    await flushPromises();

    wrapper.vm.filterByApplicationSearch('appName');
    await wrapper.vm.$nextTick();

    expect(wrapper.emitted('search:applications')[0][0]).toEqual('appName');
  });

  it('includes an all option if selectAllText is provided', async () => {
    const wrapper = mountComponent();
    await flushPromises();

    wrapper.vm.filterByApplication(['1761d1fd-796d-490d-a986-f41ee09c03f5']);
    await wrapper.vm.$nextTick();

    expect(wrapper.emitted('update:applications')[0][0]).toEqual(['1761d1fd-796d-490d-a986-f41ee09c03f5']);
  });
});
