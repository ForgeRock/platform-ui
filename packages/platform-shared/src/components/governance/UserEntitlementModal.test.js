/**
 * Copyright (c) 2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { findByTestId } from '@forgerock/platform-shared/src/utils/testHelpers';
import { mount } from '@vue/test-utils';
import i18n from '@/i18n';
import UserEntitlementModal from './UserEntitlementModal';

jest.mock('@/api/governance/CommonsApi');

describe('UserEntitlementModal', () => {
  let wrapper;

  function mountComponent(props = {}) {
    wrapper = mount(UserEntitlementModal, {
      global: {
        mocks: {
          $t: (text, prop) => i18n.global.t(text, prop),
        },
      },
      props: {
        ...props,
        isTest: true,
      },
    });
  }

  const grant = {
    application: {

    },
    entitlement: {
      someData: 'someValue',
    },
    entitlementOwner: [
      {
        givenName: 'first',
        sn: 'last',
        userName: 'test user',
      },
    ],
    glossary: {
      idx: {
        '/entitlement': {
          test1: 'value1',
          test2: 'value2',
        },
      },
    },
  };

  const glossarySchema = [
    {
      name: 'test1',
      displayName: 'test 1',
    },
    {
      name: 'test2',
      displayName: 'test 2',
    },
  ];

  it('has a tab for entitlement details and a tab for account details', () => {
    mountComponent();

    const entitlementTab = findByTestId(wrapper, 'entitlement-details-tab');
    expect(entitlementTab.exists()).toBeTruthy();

    const accountTab = findByTestId(wrapper, 'entitlement-details-tab');
    expect(accountTab.exists()).toBeTruthy();
  });

  describe('entitlement details tab', () => {
    it('shows owner info', () => {
      mountComponent({ grant });

      const ownerInfo = findByTestId(wrapper, 'owner');
      expect(ownerInfo.text()).toEqual('first lasttest user');
    });

    it('shows glossary values', () => {
      mountComponent({ grant, glossarySchema });
      const glossaryInfo = findByTestId(wrapper, 'glossary');

      expect(glossaryInfo.text()).toMatch('test 1');
      expect(glossaryInfo.text()).toMatch('value1');
      expect(glossaryInfo.text()).toMatch('test 2');
      expect(glossaryInfo.text()).toMatch('value2');
    });

    it('shows raw entitlement properties', () => {
      mountComponent({ grant });
      const entitlementInfo = findByTestId(wrapper, 'entitlement');

      expect(entitlementInfo.text()).toMatch('someData');
      expect(entitlementInfo.text()).toMatch('someValue');
    });
  });
});
