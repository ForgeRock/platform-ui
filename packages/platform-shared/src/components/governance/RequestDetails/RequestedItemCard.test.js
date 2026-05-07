/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount } from '@vue/test-utils';
import { mockModal } from '@forgerock/platform-shared/src/testing/utils/mockModal';
import RequestedItemCard from './RequestedItemCard';
import i18n from '@/i18n';

jest.mock('@forgerock/platform-shared/src/utils/appSharedUtils');
jest.mock('@forgerock/platform-shared/src/utils/applicationImageResolver');

const entitlementRequest = {
  requestType: 'entitlementGrant',
  descriptor: {
    idx: {
      '/entitlement': { displayName: 'Customer Support - QA' },
      '/account': { displayName: 'jdoe@example.com' },
    },
  },
  application: {
    name: 'Salesforce',
    description: 'CRM platform',
  },
};

const roleRequest = {
  requestType: 'roleGrant',
  role: { name: 'Admin Role' },
  glossary: {},
  roleOwner: [],
  applications: [],
};

let modalShow;

const setup = (propsData = {}) => mount(RequestedItemCard, {
  global: {
    plugins: [i18n],
    stubs: {
      FrAccountModal: true,
      FrEntitlementModal: true,
      FrRoleModal: true,
    },
  },
  props: { ...propsData },
});

describe('RequestedItemCard', () => {
  beforeEach(() => {
    ({ modalShow } = mockModal());
  });

  describe('entitlement request type', () => {
    it('renders the entitlement information header', () => {
      const wrapper = setup({ request: entitlementRequest, requestType: 'entitlementGrant' });
      expect(wrapper.text()).toContain('Entitlement Information');
    });

    it('displays the entitlement name', () => {
      const wrapper = setup({ request: entitlementRequest, requestType: 'entitlementGrant' });
      expect(wrapper.text()).toContain('Customer Support - QA');
    });

    it('displays the application name', () => {
      const wrapper = setup({ request: entitlementRequest, requestType: 'entitlementGrant' });
      expect(wrapper.text()).toContain('Salesforce');
    });

    it('shows blank indicator when entitlement name is missing', () => {
      const wrapper = setup({ request: { application: { name: 'App' } }, requestType: 'entitlementGrant' });
      expect(wrapper.text()).toContain('--');
    });

    it('opens entitlement modal when entitlement name is clicked', async () => {
      const wrapper = setup({ request: entitlementRequest, requestType: 'entitlementGrant' });
      const buttons = wrapper.findAll('button');
      const entitlementBtn = buttons.find((b) => b.text().includes('Customer Support - QA'));
      await entitlementBtn.trigger('click');
      expect(modalShow).toHaveBeenCalledWith('requestDetailsEntitlementModal');
    });

    it('opens application modal when application name is clicked', async () => {
      const wrapper = setup({ request: entitlementRequest, requestType: 'entitlementGrant' });
      const buttons = wrapper.findAll('button');
      const appBtn = buttons.find((b) => b.text().includes('Salesforce'));
      await appBtn.trigger('click');
      expect(modalShow).toHaveBeenCalledWith('requestDetailsApplicationModal');
    });

    it('displays the account name when present', () => {
      const wrapper = setup({ request: entitlementRequest, requestType: 'entitlementGrant' });
      expect(wrapper.text()).toContain('jdoe@example.com');
    });

    it('opens account modal when account name is clicked', async () => {
      const wrapper = setup({ request: entitlementRequest, requestType: 'entitlementGrant' });
      const buttons = wrapper.findAll('button');
      const accountBtn = buttons.find((b) => b.text().includes('jdoe@example.com'));
      await accountBtn.trigger('click');
      expect(modalShow).toHaveBeenCalledWith('requestDetailsAccountModal');
    });

    it('does not render account field when account name is absent', () => {
      const wrapper = setup({
        request: { application: { name: 'App' } },
        requestType: 'entitlementGrant',
      });
      expect(wrapper.text()).not.toContain('Account');
    });

    it('does not render the role modal stub', () => {
      const wrapper = setup({ request: entitlementRequest, requestType: 'entitlementGrant' });
      expect(wrapper.find('fr-role-modal-stub').exists()).toBe(false);
    });
  });

  describe('role request type', () => {
    it('renders the role information header', () => {
      const wrapper = setup({ request: roleRequest, requestType: 'roleGrant' });
      expect(wrapper.text()).toContain('Role Information');
    });

    it('displays the role name', () => {
      const wrapper = setup({ request: roleRequest, requestType: 'roleGrant' });
      expect(wrapper.text()).toContain('Admin Role');
    });

    it('opens role modal when role name is clicked', async () => {
      const wrapper = setup({ request: roleRequest, requestType: 'roleGrant' });
      const roleBtn = wrapper.findAll('button').find((b) => b.text().includes('Admin Role'));
      await roleBtn.trigger('click');
      expect(modalShow).toHaveBeenCalledWith('requestDetailsRoleModal');
    });

    it('does not render entitlement or application content', () => {
      const wrapper = setup({ request: roleRequest, requestType: 'roleGrant' });
      expect(wrapper.text()).not.toContain('Entitlement');
      expect(wrapper.text()).not.toContain('Application');
    });

    it('shows blank indicator when role name is missing', () => {
      const wrapper = setup({ request: { role: {} }, requestType: 'roleGrant' });
      expect(wrapper.text()).toContain('--');
    });

    it('also works for roleRemove request type', () => {
      const wrapper = setup({ request: roleRequest, requestType: 'roleRemove' });
      expect(wrapper.text()).toContain('Role Information');
      expect(wrapper.text()).toContain('Admin Role');
    });
  });
});
