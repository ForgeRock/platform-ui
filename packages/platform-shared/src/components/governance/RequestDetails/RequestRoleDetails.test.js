/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { flushPromises, mount } from '@vue/test-utils';
import * as RoleApi from '@forgerock/platform-shared/src/api/governance/RoleApi';
import * as GlossaryUtils from '@forgerock/platform-shared/src/utils/governance/glossary';
import i18n from '@/i18n';
import RequestRoleDetails from './RequestRoleDetails';

jest.mock('@/store', () => ({
  state: {
    SharedStore: {
      roleRequestMembersEnabled: false,
    },
  },
}));

jest.mock('@forgerock/platform-shared/src/api/governance/RoleApi');
jest.mock('@forgerock/platform-shared/src/api/SchemaApi', () => ({
  getSchema: jest.fn().mockResolvedValue({ data: { properties: {} } }),
}));
jest.mock('@forgerock/platform-shared/src/api/governance/GlossaryApi', () => ({
  getGlossaryAttributes: jest.fn().mockResolvedValue({ data: { result: [] } }),
}));
jest.mock('@forgerock/platform-shared/src/api/governance/EntitlementApi');
jest.mock('@forgerock/platform-shared/src/api/CdnApi', () => ({
  getApplicationTemplateList: jest.fn().mockResolvedValue({}),
}));
jest.mock('lodash', () => ({
  ...jest.requireActual('lodash'),
  debounce: (fn) => {
    const debounced = (...args) => fn(...args);
    debounced.cancel = jest.fn();
    return debounced;
  },
}));

jest.spyOn(GlossaryUtils, 'getGlossarySchema').mockResolvedValue([]);

RoleApi.getRoleDataById.mockResolvedValue({
  data: { result: [], totalCount: 0, totalHits: 0 },
});

const store = require('@/store');

const baseItem = {
  rawData: {
    _displayData: {},
    request: {
      role: {
        roleId: 'role1',
        status: 'active',
        glossary: {},
        object: {
          name: 'My Role',
          description: '',
          entitlements: [],
          addedRoleMembers: [],
        },
      },
    },
    decision: { status: 'complete' },
  },
};

const mountComponent = () => mount(RequestRoleDetails, {
  global: {
    plugins: [i18n],
    stubs: {
      FrGlossaryEditForm: true,
      FrEntitlementsTab: true,
      FrMembersTab: true,
    },
  },
  props: {
    item: baseItem,
    updateRole: jest.fn().mockResolvedValue({}),
  },
});

describe('RequestRoleDetails', () => {
  describe('Members tab visibility', () => {
    it('hides the Members tab when roleRequestMembersEnabled is false', async () => {
      store.state.SharedStore.roleRequestMembersEnabled = false;
      const wrapper = mountComponent();
      await flushPromises();
      const tabs = wrapper.findAll('li.nav-item');
      expect(tabs.some((t) => t.text().includes('Members'))).toBe(false);
    });

    it('shows the Members tab when roleRequestMembersEnabled is true', async () => {
      store.state.SharedStore.roleRequestMembersEnabled = true;
      const wrapper = mountComponent();
      await flushPromises();
      const tabs = wrapper.findAll('li.nav-item');
      expect(tabs.some((t) => t.text().includes('Members'))).toBe(true);
    });
  });
});
