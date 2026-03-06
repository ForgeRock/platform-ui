/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { DOMWrapper, mount, flushPromises } from '@vue/test-utils';
import { createAppContainer } from '@forgerock/platform-shared/src/utils/testHelpers';
import { setupTestPinia } from '@forgerock/platform-shared/src/utils/testPiniaHelpers';
import * as CommonsApi from '@forgerock/platform-shared/src/api/governance/CommonsApi';
import i18n from '@/i18n';
import AccessModelingTable from './AccessModelingTable';

jest.mock('@forgerock/platform-shared/src/api/governance/AccessRequestApi');
jest.mock('@forgerock/platform-shared/src/api/governance/CommonsApi');

const rolesMock = [
  {
    id: 'roleTest1',
    status: 'candidate',
    name: 'Role Test 1',
    normalized_role_name: 'role_test_1',
    memberCount: 115,
    entitlementCount: 10,
    totalSystemUsers: 2259,
    confidence: 0.8,
    applications: [],
    entitlements: [
      'system_AWSCSV_Role_AmazonChimeFullAccess',
      'system_AWSCSV_Role_AmazonCloudDirectoryFullAccess',
      'system_AWSCSV_Role_AmazonCodeGuruSecurityScanAccess',
    ],
    justifications: [
      '11_FRINDEXEDSTRING17_AU',
    ],
  },
  {
    id: 'roleTest2',
    status: 'candidate',
    name: 'Role Test 2',
    normalized_role_name: 'role_test_2',
    memberCount: 49,
    entitlementCount: 2,
    totalSystemUsers: 2258,
    confidence: 0.78,
    applications: [],
    entitlements: [
      'system_AWSCSV_Role_AmazonBraketServiceRolePolicy',
      'system_AWSCSV_Role_AmazonCodeGuruSecurityScanAccess',
    ],
    justifications: [
      '10_FRINDEXEDSTRING2_IT 10_FRINDEXEDSTRING5_Human 10_FRINDEXEDSTRING9_Business 11_FRINDEXEDSTRING16_AUS',
    ],
  },
  {
    id: 'roleTest3',
    status: 'candidate',
    name: 'Role Test 3',
    normalized_role_name: 'role_test_3',
    memberCount: 67,
    entitlementCount: 9,
    totalSystemUsers: 2258,
    confidence: 0.8788888888888889,
    applications: [],
    entitlements: [
      'system_AWSCSV_Role_AlexaForBusinessPolycom',
      'system_AWSCSV_Role_AmazonAPIGatewayAdministrator',
      'system_AWSCSV_Role_AmazonAugmentedAIIntegratedAPIAccess',
      'system_AWSCSV_Role_AmazonChimeSDKMeetingsFullAccess',
    ],
    justifications: [
      '10_FRINDEXEDSTRING2_IT 10_FRINDEXEDSTRING4_Manager',
    ],
  },
];

describe('AccessModelingTable', () => {
  const stubProps = {
    global: {
      plugins: [i18n],
    },
  };

  const setup = (props) => {
    setupTestPinia({ user: { userId: '1234' } });
    return {
      wrapper: mount(AccessModelingTable, {
        attachTo: createAppContainer(),
        ...stubProps,
        props: {
          roles: rolesMock,
          ...props,
        },
      }),
      domWrapper: new DOMWrapper(document.body),
    };
  };

  beforeEach(() => {
    document.body.innerHTML = '';
  });

  describe('@Component Tests', () => {
    beforeEach(() => {
      CommonsApi.getResource.mockReturnValue(Promise.resolve({
        data: {
          result: [],
        },
      }));
    });

    it('should list roles correctly', async () => {
      const { wrapper } = setup();
      await flushPromises();

      const requestRows = wrapper.findAll('table tbody [role="row"]');
      expect(requestRows).toHaveLength(3);
      const cellsFirstRow = requestRows[0].findAll('td');
      expect(cellsFirstRow[0].text()).toContain('Role Test 1');
      expect(cellsFirstRow[1].text()).toContain('115');
      expect(cellsFirstRow[2].text()).toContain('10');
      expect(cellsFirstRow[3].text()).toContain('candidate');
    });

    it('Navigates to role details page after clicking on "Edit"', async () => {
      const { wrapper } = setup();
      await flushPromises();
      const requestRows = wrapper.find('table tbody [role="row"]');
      requestRows.trigger('click');
      expect(wrapper.emitted('navigate-to-details')).toHaveLength(1);
    });
  });
});
