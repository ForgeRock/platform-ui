/**
 * Copyright 2023-2025 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

import { mount, flushPromises } from '@vue/test-utils';
import { findByTestId } from '@forgerock/platform-shared/src/utils/testHelpers';
import { getResource, getFilterSchema } from '@forgerock/platform-shared/src/api/governance/CommonsApi';
import { mockValidation } from '@forgerock/platform-shared/src/testing/utils/mockValidation';
import * as TemplateApi from '@/api/governance/TemplateApi';
import What from './index';
import * as templateTypes from '../../templateTypes';

mockValidation();

jest.mock('@/api/governance/TemplateApi');
jest.mock('@forgerock/platform-shared/src/api/governance/CommonsApi');

describe('What View', () => {
  let wrapper;

  getResource.mockReturnValue(Promise.resolve({ data: {} }));
  getFilterSchema.mockReturnValue(Promise.resolve({ data: {} }));
  TemplateApi.getDecisionCount = jest.fn().mockImplementation(() => Promise.resolve({ data: { count: 1 } }));

  const mountComponent = (props) => {
    wrapper = mount(What, {
      global: {
        mocks: {
          $t: (text) => (text),
        },
      },
      props: {
        value: {
          accountFilter: {},
          accountSelection: 'governance.editTemplate.allAccounts',
          appFilter: {},
          appSelection: 'governance.editTemplate.allApplications',
          decisionFilter: {},
          formFields: {
            enableAccountGrant: true,
            enableEntitlementGrant: true,
            enableRoleGrant: true,
          },
          entitlementFilter: {},
          entitlementSelection: 'governance.editTemplate.allEntitlements',
          singleApp: [],
          singleUser: '',
          singleUserInfo: {},
          userFilter: {},
          userSelection: 'governance.editTemplate.allUsers',
        },
        ...props,
      },
    });
  };

  beforeEach(() => {
    mountComponent();
  });

  it('initializes user-selection with values from value prop', () => {
    expect(findByTestId(wrapper, 'user-selection').find('span').text()).toBe('All users');
  });
  it('initializes app-selection with values from value prop', () => {
    expect(findByTestId(wrapper, 'app-selection').find('span').text()).toBe('All applications');
  });
  it('initializes account-selection with values from value prop', () => {
    expect(findByTestId(wrapper, 'account-selection').find('span').text()).toBe('All accounts in selected applications');
  });
  it('initializes enable-account-cert with values from value prop', () => {
    expect(findByTestId(wrapper, 'enable-account-cert').attributes('value')).toBe('true');
  });
  it('initializes enable-account-cert with values from value prop', () => {
    expect(findByTestId(wrapper, 'enable-role-cert').attributes('value')).toBe('true');
  });
  it('initializes enable-cert-decision-filter with values from value prop', () => {
    expect(findByTestId(wrapper, 'enable-cert-decision-filter').attributes('value')).toBe('true');
  });
  it('initializes enable-entitlement-cert with values from value prop', () => {
    expect(findByTestId(wrapper, 'enable-entitlement-cert').attributes('value')).toBe('true');
  });
  it('initializes entitlement-selection with values from value prop', () => {
    expect(findByTestId(wrapper, 'entitlement-selection').find('span').text()).toBe('All entitlements');
  });
  describe('Identity', () => {
    it('unchecking account grant hides account count', async () => {
      findByTestId(wrapper, 'enable-account-cert').setChecked(false);
      await flushPromises();
      expect(findByTestId(wrapper, 'account-count').exists()).toBeFalsy();
    });

    it('hides entitlement count when entitlement grant is unchecked', async () => {
      findByTestId(wrapper, 'enable-entitlement-cert').setChecked(false);
      await flushPromises();
      const entitlementCount = findByTestId(wrapper, 'entitlement-count');
      expect(entitlementCount.exists()).toBeFalsy();
    });

    it('displays entitlement count when entitlement grant is checked', async () => {
      findByTestId(wrapper, 'enable-entitlement-cert').setChecked(true);
      await flushPromises();
      const entitlementCount = findByTestId(wrapper, 'entitlement-count');
      expect(entitlementCount.exists()).toBeTruthy();
    });

    it('unchecking entitlement hides entitlement selection component', async () => {
      findByTestId(wrapper, 'enable-entitlement-cert').setChecked(false);
      await flushPromises();
      expect(findByTestId(wrapper, 'FrEntitlementFilter').find('.collapse').attributes('style')).toBe('display: none;');
    });

    it('hides role count when role grant is unchecked', async () => {
      findByTestId(wrapper, 'enable-role-cert').setChecked(false);
      await flushPromises();
      const entitlementCount = findByTestId(wrapper, 'role-count');
      expect(entitlementCount.exists()).toBeFalsy();
    });

    it('displays role count when role grant is checked', async () => {
      findByTestId(wrapper, 'enable-role-cert').setChecked(true);
      await flushPromises();
      const entitlementCount = findByTestId(wrapper, 'role-count');
      expect(entitlementCount.exists()).toBeTruthy();
    });

    it('unchecking role hides role selection component', async () => {
      findByTestId(wrapper, 'enable-role-cert').setChecked(false);
      await flushPromises();
      expect(findByTestId(wrapper, 'FrRoleFilter').find('.collapse').attributes('style')).toBe('display: none;');
    });

    it('shows grant type checkboxes for event based certs', () => {
      mountComponent({ eventBased: true });
      expect(findByTestId(wrapper, 'enable-account-cert').exists()).toBeTruthy();
      expect(findByTestId(wrapper, 'enable-role-cert').exists()).toBeTruthy();
      expect(findByTestId(wrapper, 'enable-entitlement-cert').exists()).toBeTruthy();
    });
  });
  describe('Entitlement', () => {
    it('has entitlement, application, and user filters', () => {
      mountComponent({ type: templateTypes.types.ENTITLEMENT });
      expect(findByTestId(wrapper, 'FrEntitlementFilter').exists()).toBeTruthy();
      expect(findByTestId(wrapper, 'FrApplicationFilter').exists()).toBeTruthy();
      expect(findByTestId(wrapper, 'FrUserFilter').exists()).toBeTruthy();
    });
    it('hides role filter', async () => {
      mountComponent({ type: templateTypes.types.ENTITLEMENT });
      expect(findByTestId(wrapper, 'FrRoleFilter').exists()).toBeFalsy();
    });
    it('has entitlement, application, and user counts', async () => {
      mountComponent({ type: templateTypes.types.ENTITLEMENT });
      await flushPromises();
      expect(findByTestId(wrapper, 'entitlement-count').exists()).toBeTruthy();
      expect(findByTestId(wrapper, 'application-count').exists()).toBeTruthy();
      expect(findByTestId(wrapper, 'user-count').exists()).toBeTruthy();
    });
  });
  describe('Role Membership', () => {
    beforeEach(() => jest.resetModules());
    it('has role and user filter', () => {
      mountComponent({ type: templateTypes.types.ROLEMEMBERSHIP });
      expect(findByTestId(wrapper, 'FrRoleFilter').exists()).toBeTruthy();
      expect(findByTestId(wrapper, 'FrUserFilter').exists()).toBeTruthy();
    });
    it('hides account, application, and entitlement filters', () => {
      mountComponent({ type: templateTypes.types.ROLEMEMBERSHIP });
      expect(findByTestId(wrapper, 'FrAccountFilter').exists()).toBeFalsy();
      expect(findByTestId(wrapper, 'FrApplicationFilter').exists()).toBeFalsy();
      expect(findByTestId(wrapper, 'FrEntitlementFilter').exists()).toBeFalsy();
    });
    it('has role and user counts', async () => {
      mountComponent({ type: templateTypes.types.ROLEMEMBERSHIP });
      await flushPromises();
      expect(findByTestId(wrapper, 'role-count').exists()).toBeTruthy();
      expect(findByTestId(wrapper, 'user-count').exists()).toBeTruthy();
    });
    it('hides account, application, and entitlement counts', async () => {
      mountComponent({ type: templateTypes.types.ROLEMEMBERSHIP });
      await flushPromises();
      expect(findByTestId(wrapper, 'account-count').exists()).toBeFalsy();
      expect(findByTestId(wrapper, 'application-count').exists()).toBeFalsy();
      expect(findByTestId(wrapper, 'entitlement-count').exists()).toBeFalsy();
    });
  });
});
