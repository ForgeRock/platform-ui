/**
 * Copyright (c) 2023-2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { shallowMount } from '@vue/test-utils';
import { setApplicationsTemplates } from '@forgerock/platform-shared/src/utils/appSharedUtils';
import EntitlementsTab from './index';

describe('EntitlementsTab', () => {
  function mountComponent(entitlements) {
    return shallowMount(EntitlementsTab, {
      global: {
        mocks: {
          $t: (t) => t,
        },
        renderStubDefaultSlot: true,
        stubs: {
          BTable: {
            name: 'BTable',
            template: '<div><slot name="cell(application)" :item="items[0]" /><slot name="cell(name)" :item="items[0]" /><slot name="cell(account)" :item="items[0]" /></div>',
            props: ['fields', 'items'],
          },
          BMedia: { name: 'BMedia', template: '<div><slot /></div>' },
        },
      },
      props: {
        entitlements,
      },
    });
  }

  beforeEach(() => {
    // preload application templates so getApplicationLogo does not fetch the CDN
    setApplicationsTemplates({
      templateName: {
        latest: { id: 'templateName', displayName: 'Template Name', image: 'template.svg' },
      },
    });
  });

  describe('component loaded', () => {
    let wrapper;

    beforeEach(() => {
      wrapper = mountComponent({
        result: [
          {
            id: '42e5f15e-6254-4b51-bc8e-6c88c7e132e3',
            campaignId: 'a486cff9-281c-4724-aec8-de6c4f509db6',
            item: { type: 'entitlementGrant' },
            user: { id: '2f89ad17-e520-409d-9954-b5fb1be9fc04' },
            enitlement: { id: '8989f1f4-1518-49bf-8a45-7a84d3c6b17f' },
            assignment: {
              id: 'b03dbb0b-f504-4869-a593-d3d1a54a44b1',
              name: 'Zoran Entitlement Owner',
            },
            application: {
              id: '5ef1b662-db86-4e6d-8e5f-41db789bf43f',
              name: 'TargetAzureADApp',
              icon: 'https://openam-gov-v2-3.forgeblocks.com/platform/img/microsoft.8a785075.svg',
            },
            descriptor: {
              idx: {
                '/entitlement': {
                  displayName: 'Zoran Entitlement Owner',
                },
                '/account': {
                  displayName: 'User Account 1',
                },
              },
            },
          },
        ],
      });
    });

    it('component should load correctly', () => {
      expect(wrapper.vm.blankValueIndicator).toBe('--');
    });

    it('renders the application logo as decorative image', () => {
      const img = wrapper.find('img');
      expect(img.exists()).toBe(true);
      expect(img.attributes('src')).toBe('https://openam-gov-v2-3.forgeblocks.com/platform/img/microsoft.8a785075.svg');
      expect(img.attributes('alt')).toBe('');
    });
  });
});
