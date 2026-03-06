/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount, flushPromises } from '@vue/test-utils';
import { mockRouter } from '@forgerock/platform-shared/src/testing/utils/mockRouter';
import Notifications from '@kyvg/vue3-notification';
import { setupTestPinia } from '@forgerock/platform-shared/src/utils/testPiniaHelpers';
import Recommendations from './Recommendations';

jest.mock('@forgerock/platform-shared/src/api/CdnApi', () => ({
  getApplicationTemplateList: jest.fn().mockResolvedValue({}),
}));

mockRouter({ params: { accountId: 'system/Target/User/102' } });

let wrapper;

const entitlements = [
  {
    id: 'system_SNOWCSV_Role_ProblemAnalyzers',
    descriptor: {
      idx: {
        '/entitlement': {
          displayName: 'Problem Analyzers',
        },
      },
    },
  },
  {
    id: 'system_AWSCSV_Role_AmazonAppStreamFullAccess',
    descriptor: {
      idx: {
        '/entitlement': {
          displayName: 'Amazon App Stream Full Access',
        },
      },
    },
  },
  {
    id: 'system_AWSCSV_Role_AmazonConnectServiceLinkedRolePolicy',
    descriptor: {
      idx: {
        '/entitlement': {
          displayName: 'Amazon Connect Service Linked Role Policy',
        },
      },
    },
  },
  {
    id: 'system_AWSCSV_Role_AmazonCodeBuildReadOnlyAccess',
    descriptor: {
      idx: {
        '/entitlement': {
          displayName: 'Amazon CodeBuild Read Only Access',
        },
      },
    },
  },
  {
    id: 'system_SFDCCSV_Role_OrderManagementExternalBuyerPlus',
    descriptor: {
      idx: {
        '/entitlement': {
          displayName: 'Order Management External Buyer Plus',
        },
      },
    },
  },
  {
    id: 'system_SNOWCSV_Role_TeamDevelopmentCodeReviewers',
    descriptor: {
      idx: {
        '/entitlement': {
          displayName: 'Team Development Code Reviewers',
        },
      },
    },
  },
  {
    id: 'system_SNOWCSV_Role_CatalogRequestApprovers1000',
    descriptor: {
      idx: {
        '/entitlement': {
          displayName: 'Catalog Request Approvers 1000',
        },
      },
    },
  },
];

const role = {
  id: 'draft',
  role: {
    name: 'Role J0-R1003',
    status: 'draft',
    entitlements: [
      'system_SNOWCSV_Role_ProblemAnalyzers',
      'system_AWSCSV_Role_AmazonAppStreamFullAccess',
      'system_AWSCSV_Role_AmazonConnectServiceLinkedRolePolicy',
      'system_AWSCSV_Role_AmazonCodeBuildReadOnlyAccess',
      'system_SFDCCSV_Role_OrderManagementExternalBuyerPlus',
    ],
    justifications: [
      '11_FRINDEXEDSTRING13_Logistics 11_FRINDEXEDSTRING17_GB',
      '11_FRINDEXEDSTRING13_Logistics 11_FRINDEXEDSTRING17_US',
      '11_FRINDEXEDSTRING16_SFO 11_FRINDEXEDSTRING17_US',
    ],
  },
};

const candidateRole = {
  id: 'candidate',
  role: {
    name: 'Role J0-R1003 Candidate',
    status: 'candidate',
    entitlements: [
      'system_SNOWCSV_Role_TeamDevelopmentCodeReviewers',
      'system_SNOWCSV_Role_CatalogRequestApprovers1000',
      'system_SNOWCSV_Role_ProblemAnalyzers',
      'system_AWSCSV_Role_AmazonAppStreamFullAccess',
      'system_AWSCSV_Role_AmazonConnectServiceLinkedRolePolicy',
    ],
    justifications: [
      '11_FRINDEXEDSTRING13_Logistics 11_FRINDEXEDSTRING17_US',
      '11_FRINDEXEDSTRING16_SFO 11_FRINDEXEDSTRING17_US',
      '11_FRINDEXEDSTRING13_Logistics 11_FRINDEXEDSTRING16_SFO',
    ],
  },
};

const userSchema = [
  {
    key: 'frIndexedString13',
    name: 'frIndexedString13',
    displayName: 'Department',
    description: 'User Department',
    type: 'string',
    isMultiValue: false,
  },
  {
    key: 'frIndexedString16',
    name: 'frIndexedString16',
    displayName: 'City',
    description: 'User City',
    type: 'string',
    isMultiValue: false,
  },
  {
    key: 'frIndexedString17',
    name: 'frIndexedString17',
    displayName: 'Country',
    description: 'User Country',
    type: 'string',
    isMultiValue: false,
  },
];

function mountComponent(additionalProps = {}) {
  setupTestPinia();
  wrapper = mount(Recommendations, {
    global: {
      plugins: [Notifications],
      mocks: {
        $t: (t) => t,
      },
    },
    props: {
      role,
      candidateRole,
      userSchema,
      entitlements,
      ...additionalProps,
    },
  });
  return wrapper;
}

describe('Recommendations', () => {
  it('should display the correct tabs', async () => {
    wrapper = mountComponent();
    await flushPromises();

    const tabContainer = wrapper.find('.tabs');
    const tabs = tabContainer.findAll('li');

    expect(tabs.length).toBe(2);
  });

  it('should display the justifications tab correctly', async () => {
    wrapper = mountComponent();
    await flushPromises();

    const rows = wrapper.findAll('tbody tr');
    expect(rows.length).toBe(2);

    // Check add recommendation
    const firstJustification = rows[0];
    expect(firstJustification.text()).toContain('add_circle_outline');

    const firstJustificationEntries = firstJustification.findAll('.badge');
    expect(firstJustificationEntries.length).toBe(2);
    expect(firstJustificationEntries[0].text()).toBe('Department: Logistics');
    expect(firstJustificationEntries[1].text()).toBe('City: SFO');

    // Check remove recommendation
    const secondJustification = rows[1];
    expect(secondJustification.text()).toContain('remove_circle_outline');

    const secondJustificationEntries = secondJustification.findAll('.badge');
    expect(secondJustificationEntries.length).toBe(2);
    expect(secondJustificationEntries[0].text()).toBe('Department: Logistics');
    expect(secondJustificationEntries[1].text()).toBe('Country: GB');
  });

  it('should display the update recommendations button when something is checked and emit save', async () => {
    wrapper = mountComponent();
    await flushPromises();

    const rows = wrapper.findAll('tbody tr');
    const firstJustification = rows[0];
    const firstCheckbox = firstJustification.find('input[type="checkbox"]');
    await firstCheckbox.setChecked();

    const updateButton = wrapper.find('.btn-outline-primary');
    expect(updateButton.exists()).toBe(true);
    expect(updateButton.text()).toContain('updatePatterns');

    updateButton.trigger('click');
    expect(wrapper.emitted('save-recommendations')[0][0]).toEqual('justifications');
    expect(wrapper.emitted('save-recommendations')[0][1]).toEqual('');
    expect(wrapper.emitted('save-recommendations')[0][2]).toEqual([{ id: '11_FRINDEXEDSTRING13_Logistics 11_FRINDEXEDSTRING16_SFO', operation: 'add' }]);
  });

  it('should display the entitlements tab', async () => {
    wrapper = mountComponent();
    await flushPromises();

    const tabContainer = wrapper.find('.tabs');
    const tabs = tabContainer.findAll('li');
    tabs[1].find('a').trigger('click');
    await flushPromises();

    const rows = wrapper.findAll('tbody tr');
    expect(rows.length).toBe(4);

    // Check add recommendation
    const firstJustification = rows[0];
    expect(firstJustification.text()).toContain('add_circle_outline');
    expect(firstJustification.text()).toContain('Team Development Code Reviewers');

    // Check remove recommendation
    const secondJustification = rows[2];
    expect(secondJustification.text()).toContain('remove_circle_outline');
    expect(secondJustification.text()).toContain('Amazon CodeBuild Read Only Access');
  });

  it('should display the update recommendations button when something is checked and emit save on entitlements', async () => {
    wrapper = mountComponent();
    await flushPromises();

    const tabContainer = wrapper.find('.tabs');
    const tabs = tabContainer.findAll('li');
    tabs[1].find('a').trigger('click');
    await flushPromises();

    const rows = wrapper.findAll('tbody tr');
    expect(rows.length).toBe(4);

    // Check add recommendation
    const firstEntitlement = rows[0];
    const firstCheckbox = firstEntitlement.find('input[type="checkbox"]');
    await firstCheckbox.setChecked();

    const secondEntitlement = rows[2];
    const secondCheckbox = secondEntitlement.find('input[type="checkbox"]');
    await secondCheckbox.setChecked();

    const updateButton = wrapper.find('.btn-outline-primary');
    expect(updateButton.exists()).toBe(true);
    expect(updateButton.text()).toContain('updateEntitlements');

    updateButton.trigger('click');
    expect(wrapper.emitted('save-recommendations')[0][0]).toEqual('entitlements');
    expect(wrapper.emitted('save-recommendations')[0][1]).toEqual('');
    expect(wrapper.emitted('save-recommendations')[0][2]).toEqual([{ id: 'system_SNOWCSV_Role_TeamDevelopmentCodeReviewers', operation: 'add' }, { id: 'system_AWSCSV_Role_AmazonCodeBuildReadOnlyAccess', operation: 'remove' }]);
  });
});
